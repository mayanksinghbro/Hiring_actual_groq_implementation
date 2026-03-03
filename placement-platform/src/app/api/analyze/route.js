import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `System Role:
You are an elite Recruitment AI acting as a pipeline of 5 expert specialized skills. You will analyze a Candidate's precise resume data (Projects, Skills, Experience) against a specific Job Description (JD).

=== SKILL 1: jd_analyzer ===
Purpose: Break down the Job Description into scoreable dimensions.
Rules:
- Extract ONLY what the JD explicitly states.
- Split requirements into: must_have, nice_to_have, red_flags.
- Output strictly in the JSON background logic.

=== SKILL 2: fit_scorer ===
Purpose: Score a candidate against a JD — the most hallucination-prone step.
Rules:
- Only score based on information present in BOTH the resume and JD provided.
- For each scoring dimension, cite the EXACT resume text that supports your score.
- If evidence is absent, score = 0 for that dimension. Do not extrapolate.
- Penalize vague claims without measurable outcomes.
Dimensions: skills_match (0-30), experience_relevance (0-30), domain_fit (0-20), role_readiness (0-20). Total: sum of dimensions (0-100).

=== SKILL 3: ranking_explainer ===
Purpose: Generate the leaderboard justification for the candidate.
Rules:
- Write in plain, professional English. Reference only verifiable resume points.
- Structure: 3 strengths, 1 gap (under 120 words total).
- Prefix the 3 strengths with '✅', and the 1 gap with '❌'.
- Give specific, detailed explanations of the candidate's PROJECTS and why they align with the tech stack.

=== SKILL 4: email_composer ===
Purpose: Generate a pre-formatted shortlist email.
Rules:
- Write a professional but warm shortlisting email.
- Include: [CANDIDATE_NAME], [ROLE], [COMPANY], [LINK_PLACEHOLDER] as editable tokens.
- Keep tone encouraging but professional. Max 150 words. Do not fabricate interview details.
- CRITICAL JSON RULE 1: You MUST escape all newlines as \\n. DO NOT use literal newlines anywhere in the JSON string output.
- CRITICAL JSON RULE 2: You MUST escape all double quotes inside string values as \\" (e.g. "He said \\"yes\\""). Do NOT use raw double quotes inside any text fields.

=== SKILL 5: hallucination_guard ===
Purpose: Validation layer after all generated output.
Rules:
- Flag any claims in your own output that cannot be traced back precisely to the candidate's raw data.
- Output: { "hallucinated_claims": [], "confidence": "high/medium/low", "safe_to_use": true/false }

Output Format (Strict JSON):
You must output your analysis in the following strict JSON format:
{
  "match_score_out_of_100": <integer 0-100 from fit_scorer>,
  "key_strengths": ["<Specific matching skill>", "..."],
  "critical_missing_skills": ["<Required JD skill NOT found in resume>", "..."],
  "relevant_projects": ["<Detailed explanation of candidate's project and why it fits JD>", "..."],
  "justification_bullets": ["✅ <Strength 1...>", "✅ <Strength 2...>", "✅ <Strength 3...>", "❌ <Gap...>"],
  "email_draft": "<Plain text email body mapped to the skill 4 rules. Escape newlines as \\n>",
  "hallucination_guard": {
      "hallucinated_claims": ["claim 1", "..."],
      "confidence": "high",
      "safe_to_use": true
  }
}

IMPORTANT: You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, backticks, or conversational text. Your entire response must be parseable by JSON.parse().`;

function buildPrompt(jobDescription, resume, competencies) {
    return `Inputs:

=== JOB DESCRIPTION ===
${jobDescription}
=== END JOB DESCRIPTION ===

=== REQUIRED COMPETENCIES (EXACT LIST) ===
${competencies && competencies.length > 0 ? competencies.join(', ') : 'See job description text above'}
=== END REQUIRED COMPETENCIES ===

=== CANDIDATE STRUCTURED DATA ===
Skills Detected:
${resume.skills ? resume.skills.join('\n') : 'None'}

Projects:
${resume.projects ? resume.projects.join('\n') : 'None'}

Experience / Internships:
${resume.experience ? resume.experience.join('\n') : 'None'}
=== END CANDIDATE STRUCTURED DATA ===

=== CANDIDATE FULL TEXT (RAW RESUME) ===
${resume.rawText || 'No raw text provided.'}
=== END CANDIDATE FULL TEXT ===

IMPORTANT: The REQUIRED COMPETENCIES listed above are the ONLY skills you should check against. For critical_missing_skills, ONLY include items from this exact list that are NOT found in the resume. 
Analyze this candidate's raw text and structured data against the job description above. Explicitly explain your ranking score based on what is found in their resume text.`;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Intelligent fallback: analyze resume text against ONLY the user-provided competencies
function localAnalysis(jobDescription, resume, candidateId, competencies = []) {
    const resumeText = resume.rawText || '';
    const resumeLower = resumeText.toLowerCase();

    // Use ONLY the competencies the user explicitly listed — never invent skills
    const requiredSkills = competencies.map(c => c.toLowerCase());

    const matched = requiredSkills.filter(s => resumeLower.includes(s));
    const missing = requiredSkills.filter(s => !resumeLower.includes(s));

    // Score based on skill overlap against ONLY user-provided competencies
    let score = 0;
    if (requiredSkills.length > 0) {
        score = Math.round((matched.length / requiredSkills.length) * 85) + 10;
    } else {
        score = 50; // No competencies provided, neutral score
    }

    const projectLines = resume.projects || [];
    const experienceLines = resume.experience || [];
    const skillsLines = resume.skills || [];

    // Add some variance based on experience mentions
    if (experienceLines.length > 0) score = Math.min(score + 8, 98);
    if (projectLines.length > 0) score = Math.min(score + 5, 98);

    // Clamp
    score = Math.max(20, Math.min(score, 98));

    const justification = matched.length > 0
        ? `Candidate scored ${score}% because their Projects (${projectLines.length}) and Experience (${experienceLines.length}) show explicit proficiency in ${matched.slice(0, 3).join(', ')}. ${missing.length > 0 ? `However, their skills section lacks ${missing.slice(0, 2).join(' and ')}.` : `Their background covers all required competencies perfectly.`}`
        : `Candidate ranked low (${score}%) because they lack the core technical competencies (${requiredSkills.slice(0, 4).join(', ')}) in their listed skills, projects, and experiences.`;

    return {
        id: candidateId,
        matchScore: score,
        keyStrengths: matched.length > 0 ? matched.slice(0, 5) : [],
        criticalMissingSkills: missing.slice(0, 4),
        relevantProjects: projectLines.slice(0, 3),
        relevantExperience: experienceLines.slice(0, 2),
        justification,
        shortlisted: false,
    };
}

async function analyzeWithRetry(groq, jobDescription, resume, index, competencies = [], maxRetries = 2) {
    let lastErrMessage = 'Unknown error';
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const prompt = buildPrompt(jobDescription, resume, competencies);
            const chatCompletion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 2048,
                top_p: 0.8,
                response_format: { type: 'json_object' },
            });

            const responseText = chatCompletion.choices[0]?.message?.content || '';

            let analysis;
            try {
                analysis = JSON.parse(responseText);
            } catch (parseErr) {
                console.error(`[PARSE ERROR] Resume ${index}, attempt ${attempt}:`, parseErr.message);
                console.error(`[RAW STRING EXCERPT]`, responseText.slice(-200));

                if (attempt === maxRetries) throw new Error('JSON parse failed: ' + parseErr.message);
                await delay(2000);
                continue;
            }

            const emailDraft = analysis.email_draft || '';
            const hallucinationGuard = analysis.hallucination_guard || { safe_to_use: true };
            const matchScore = analysis.match_score_out_of_100 || 0;

            // Apply hallucination guard strictness: if the model flagged itself, penalize the score
            const finalScore = hallucinationGuard.safe_to_use === false ? Math.max(0, matchScore - 20) : matchScore;

            if (hallucinationGuard.safe_to_use === false) {
                console.warn(`[Hallucination Guard] Penalized Resume ${index} for flagged claims:`, hallucinationGuard.hallucinated_claims);
            }

            return {
                id: resume.id,
                fileName: resume.fileName,
                matchScore: finalScore,
                keyStrengths: analysis.key_strengths || [],
                criticalMissingSkills: analysis.critical_missing_skills || [],
                relevantProjects: analysis.relevant_projects || [],
                relevantExperience: analysis.relevant_experience || [],
                justification_bullets: analysis.justification_bullets || [],
                emailDraft: emailDraft,
                hallucinationGuard: hallucinationGuard,
                shortlisted: finalScore >= 70,
                source: 'groq',
            };
        } catch (err) {
            lastErrMessage = err.message || JSON.stringify(err);
            console.error(`Attempt ${attempt + 1} failed for resume ${index}:`, lastErrMessage.slice(0, 150));

            if (attempt < maxRetries) {
                let backoffMS = (attempt + 1) * 3000;

                // Handle rate limit errors
                const retryMatch = err.message?.match(/retry in (\d+\.?\d*)s/i);
                if (retryMatch && retryMatch[1]) {
                    backoffMS = (parseFloat(retryMatch[1]) + 1) * 1000;
                    console.log(`Rate limit detected! Sleeping explicitly for ${backoffMS}ms before retrying...`);
                } else if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('rate_limit')) {
                    backoffMS = 35000;
                    console.log(`429 Rate Limit detected. Sleeping for ${backoffMS}ms...`);
                }

                console.log(`Retrying in ${backoffMS}ms...`);
                await delay(backoffMS);
            }
        }
    }

    // All retries failed — gracefully return an error candidate profile
    console.error(`All Groq analysis retries failed for resume ${index}`);
    return {
        id: resume.id,
        fileName: resume.fileName,
        matchScore: 0,
        keyStrengths: [],
        criticalMissingSkills: [],
        relevantProjects: [],
        relevantExperience: [],
        justification_bullets: [
            '⚠️ SCORE NOT GENERATED: Groq API error or parsing failed.',
            `❌ Error: ${lastErrMessage.slice(0, 250)}`,
            'ℹ️ Try clearing your Next.js cache or ensuring prompt alignment.'
        ],
        emailDraft: '',
        hallucinationGuard: { safe_to_use: true },
        shortlisted: false,
        source: 'groq-error',
    };
}

export async function POST(request) {
    try {
        const { jobDescription, resumes, competencies = [] } = await request.json();

        if (!jobDescription || !resumes || resumes.length === 0) {
            return NextResponse.json(
                { error: 'Missing jobDescription or resumes' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY?.trim();

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return NextResponse.json(
                { error: 'Groq API Key is missing or invalid. Please configure your .env variables to use Groq analysis.' },
                { status: 401 }
            );
        }

        const groq = new Groq({ apiKey });

        // Process resumes SEQUENTIALLY with delays to respect rate limits
        const results = [];
        for (let i = 0; i < resumes.length; i++) {
            console.log(`Analyzing resume ${i + 1}/${resumes.length}: ${resumes[i].fileName}`);
            const result = await analyzeWithRetry(groq, jobDescription, resumes[i], i, competencies);
            results.push(result);

            // 2s delay between requests for rate limit safety
            if (i < resumes.length - 1) {
                await delay(2000);
            }
        }

        // Sort by match score descending
        results.sort((a, b) => b.matchScore - a.matchScore);

        const groqCount = results.filter((r) => r.source === 'groq').length;
        const fallbackCount = results.filter((r) => r.source !== 'groq').length;
        console.log(`Analysis complete: ${groqCount} via Groq, ${fallbackCount} via fallback`);

        return NextResponse.json({ candidates: results });
    } catch (err) {
        console.error('Analyze API error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
