'use client';

import { useState } from 'react';
import EmailModal from './EmailModal';
import ResumeViewerModal from './ResumeViewerModal';

export default function CandidateLeaderboard({ candidates, jobTitle, resumeTexts, interviewData = {}, onOpenInterview }) {
    const [emailCandidate, setEmailCandidate] = useState(null);
    const [viewCandidate, setViewCandidate] = useState(null);
    const [shortlisted, setShortlisted] = useState({});

    const handleShortlist = (candidate) => {
        setEmailCandidate(candidate);
        setShortlisted((prev) => ({ ...prev, [candidate.id]: true }));
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-amber-600';
        return 'text-gray-500';
    };

    const getScoreBarColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 80) return 'bg-blue-500';
        if (score >= 70) return 'bg-amber-500';
        return 'bg-gray-400';
    };

    return (
        <>
            <div className="bg-white rounded-[16px] p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2.5 rounded-xl">
                            <span className="material-symbols-outlined text-amber-600 text-xl">emoji_events</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-[18px] font-bold text-gray-900">AI Candidate Leaderboard</h2>
                                <span className="px-2.5 py-0.5 bg-gray-100/80 text-gray-600 rounded-lg text-[12px] font-bold border border-gray-200">
                                    Showing Top {candidates.length}
                                </span>
                            </div>
                            <p className="text-[13px] text-gray-500 mt-1">Ranked by Groq AI Match Score — Blind Hiring Mode</p>
                        </div>
                    </div>
                    <span className="badge badge-purple"><span className="material-symbols-outlined text-[14px]">shield</span>Names Hidden</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-12">Rank</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-48">Candidate</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-32">Match Score</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-72">AI Justification</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-48">Key Strengths</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-48">Missing Skills</th>
                                <th className="pb-3 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {candidates.map((candidate, index) => {
                                const rank = index + 1;
                                const strengths = candidate.keyStrengths || candidate.skills || [];
                                const missingSkills = candidate.criticalMissingSkills || [];
                                const relevantProjects = candidate.relevantProjects || [];
                                const relevantExperience = candidate.relevantExperience || [];
                                const candidateName = candidate.fileName ? candidate.fileName.split('.')[0].replace(/[-_]/g, ' ') : 'Unknown Candidate';
                                return (
                                    <tr key={candidate.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50">
                                                {rank <= 3 ? (
                                                    <span className={`material-symbols-outlined text-[18px] ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700'}`}>emoji_events</span>
                                                ) : (
                                                    <span className="text-[13px] font-bold text-gray-400">#{rank}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold ${rank <= 3 ? 'bg-blue-50 text-[#2563EB] border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                                    {candidateName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 text-[13px] line-clamp-1 capitalize">{candidateName}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-gray-400 text-[11px] font-mono">{candidate.id}</span>
                                                        {interviewData[candidate.id] && (
                                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${interviewData[candidate.id].overallStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                                    interviewData[candidate.id].overallStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {interviewData[candidate.id].overallStatus === 'accepted' ? '✓ Accepted' :
                                                                    interviewData[candidate.id].overallStatus === 'rejected' ? '✗ Rejected' :
                                                                        `Round ${interviewData[candidate.id].rounds?.length || 0}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[16px] font-bold tabular-nums ${getScoreColor(candidate.matchScore)}`}>{candidate.matchScore}%</span>
                                                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className={`h-full rounded-full ${getScoreBarColor(candidate.matchScore)} score-bar`} style={{ width: `${candidate.matchScore}%`, animationDelay: `${index * 0.1}s` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-6">
                                            <div className="flex flex-col gap-2">
                                                <ul className="text-[12px] text-gray-700 leading-relaxed max-w-sm space-y-1.5">
                                                    {candidate.justification_bullets ? (
                                                        candidate.justification_bullets.map((bullet, i) => (
                                                            <li key={i} className="flex items-start">
                                                                <span>{bullet}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <p>{candidate.justification || 'No justification provided.'}</p>
                                                    )}
                                                </ul>
                                                {(relevantProjects.length > 0 || relevantExperience.length > 0) && (
                                                    <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-100 pt-2">
                                                        {relevantExperience.length > 0 && (
                                                            <div className="flex items-start gap-1">
                                                                <span className="material-symbols-outlined text-[13px] text-blue-500 mt-0.5 shrink-0">work</span>
                                                                <span className="text-[11px] text-gray-600 leading-tight"><strong>Experience:</strong> {relevantExperience.join(', ')}</span>
                                                            </div>
                                                        )}
                                                        {relevantProjects.length > 0 && (
                                                            <div className="flex items-start gap-1">
                                                                <span className="material-symbols-outlined text-[13px] text-purple-500 mt-0.5 shrink-0">folder_special</span>
                                                                <span className="text-[11px] text-gray-600 leading-tight"><strong>Projects:</strong> {relevantProjects.join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {strengths.slice(0, 3).map((skill) => (
                                                    <span key={skill} className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                                        <span className="material-symbols-outlined text-[12px]">check_circle</span>{skill}
                                                    </span>
                                                ))}
                                                {strengths.length > 3 && <span className="text-[11px] text-gray-400">+{strengths.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {missingSkills.slice(0, 3).map((skill) => (
                                                    <span key={skill} className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                                                        <span className="material-symbols-outlined text-[12px]">warning</span>{skill}
                                                    </span>
                                                ))}
                                                {missingSkills.length > 3 && <span className="text-[11px] text-gray-400">+{missingSkills.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => candidate.fileName && setViewCandidate(candidate)}
                                                    disabled={!candidate.fileName}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${candidate.fileName ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100' : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {candidate.fileName ? 'description' : 'visibility_off'}
                                                    </span>
                                                    {candidate.fileName ? 'Resume' : 'Unavailable'}
                                                </button>
                                                <button
                                                    onClick={() => onOpenInterview && onOpenInterview(candidate)}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${interviewData[candidate.id]
                                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                                                            : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                                                    {interviewData[candidate.id] ? 'View Interview' : 'Interview'}
                                                </button>
                                                <button
                                                    onClick={() => handleShortlist(candidate)}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${shortlisted[candidate.id] ? 'bg-green-50 text-green-700 border border-green-200' : 'btn-primary text-[12px]'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                                    {shortlisted[candidate.id] ? 'Shortlisted ✓' : 'Shortlist & Email'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {emailCandidate && <EmailModal candidate={emailCandidate} jobTitle={jobTitle} onClose={() => setEmailCandidate(null)} />}
            {viewCandidate && <ResumeViewerModal candidate={viewCandidate} resumeText={viewCandidate.rawText || resumeTexts?.[viewCandidate.fileName] || ''} onClose={() => setViewCandidate(null)} />}
        </>
    );
}
