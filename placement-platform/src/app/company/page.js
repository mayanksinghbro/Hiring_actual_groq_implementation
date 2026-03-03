'use client';

import { useState, useEffect } from 'react';
import CreateJobForm from '@/components/company/CreateJobForm';
import CandidateLeaderboard from '@/components/company/CandidateLeaderboard';
import InterviewRoundsModal from '@/components/company/InterviewRoundsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { mockResumeTexts } from '@/data/mockResumes';
import * as pdfjsLib from 'pdfjs-dist';

import { parsePDFToSections } from '@/utils/pdfParser';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Shared job store (simulates DB — all portals read from this)
const sharedJobStore = {
    jobs: [],
    addJob(job) { this.jobs.unshift(job); },
    getJobs() { return this.jobs; },
};

// Expose globally so student/college portals can access
if (typeof window !== 'undefined') {
    window.__placifyJobs = sharedJobStore;
}

export default function CompanyPortal() {
    const [analyzing, setAnalyzing] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [postedJobs, setPostedJobs] = useState([]);
    const [hiredCandidates, setHiredCandidates] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [interviewData, setInterviewData] = useState({});
    const [interviewCandidate, setInterviewCandidate] = useState(null);

    useEffect(() => {
        // Load any previously posted jobs
        if (typeof window !== 'undefined' && window.__placifyJobs) {
            setPostedJobs(window.__placifyJobs.getJobs());
        }
    }, [activeTab]);

    const handleAnalyze = async (formData) => {
        const { title, description, competencies, topN, files } = formData;
        setJobTitle(title);
        setAnalyzing(true);
        setShowLeaderboard(false);
        setError('');

        const jobDescription = [
            `Job Title: ${title}`,
            description ? `\nJob Description:\n${description}` : '',
            competencies.length > 0 ? `\nRequired Competencies: ${competencies.join(', ')}` : '',
        ].join('');

        const resumes = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name || file;
            let structuredData = { rawText: '', skills: [], projects: [], experience: [] };

            // Try extracting real PDF text if the file has content (size > 0)
            if (file instanceof File && file.size > 0) {
                try {
                    structuredData = await parsePDFToSections(file, pdfjsLib);
                } catch (err) {
                    console.warn(`Failed to extract text from ${fileName}:`, err);
                }
            }

            // Fall back to mock data only if extraction yielded nothing (e.g. demo files)
            if (!structuredData.rawText || structuredData.rawText.length < 20) {
                const mockText = mockResumeTexts[fileName] || `Resume for candidate ${i + 1}. Generic resume with basic skills.`;
                structuredData.rawText = mockText;
                structuredData.skills = ['Generic Skills'];
            }

            resumes.push({
                id: `CND-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                fileName,
                ...structuredData
            });
        }

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription, resumes, competencies }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Analysis failed');

            const sortedCandidates = data.candidates;
            const finalCandidates = topN > 0 ? sortedCandidates.slice(0, topN) : sortedCandidates;

            // Attach original rawText back to candidates so the Resume Viewer can display it
            const candidatesWithText = finalCandidates.map(c => {
                const originalResume = resumes.find(r => r.id === c.id);
                return { ...c, rawText: originalResume?.rawText || '' };
            });

            setCandidates(candidatesWithText);
            setShowLeaderboard(true);

            // Save to shared store (simulates DB write)
            const newJob = {
                id: `JOB-${Date.now()}`,
                title: title || 'Senior Frontend Developer',
                description,
                competencies,
                resumeCount: files.length,
                candidatesShortlisted: finalCandidates.filter(c => c.matchScore >= 70).length,
                status: 'active',
                postedAt: new Date().toISOString(),
                candidates: finalCandidates,
                topN,
            };
            sharedJobStore.addJob(newJob);
            setPostedJobs(sharedJobStore.getJobs());

        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleHire = (candidate) => {
        setHiredCandidates(prev => [...prev, { ...candidate, hiredAt: new Date().toISOString(), jobTitle }]);
    };

    const handleOpenInterview = (candidate) => {
        setInterviewCandidate(candidate);
    };

    const handleUpdateInterview = (candidateId, data) => {
        setInterviewData(prev => ({ ...prev, [candidateId]: data }));
    };

    const stats = [
        { label: 'Active Postings', value: String(postedJobs.filter(j => j.status === 'active').length || 3), icon: 'work', color: 'bg-blue-100 text-blue-600' },
        { label: 'Resumes Analyzed', value: String(postedJobs.reduce((sum, j) => sum + j.resumeCount, 0) || 247), icon: 'description', color: 'bg-purple-100 text-purple-600' },
        { label: 'Shortlisted', value: String(postedJobs.reduce((sum, j) => sum + j.candidatesShortlisted, 0) || 34), icon: 'group', color: 'bg-green-100 text-green-600' },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(240,242,245,0.35)), url(/backgrounds/portal-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* HEADER */}
            <header className="h-[64px] bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 sm:px-10 shrink-0 z-20">
                <div className="flex items-center gap-4 sm:gap-8">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><span className="material-symbols-outlined text-white text-2xl">grid_view</span></div>
                        <span className="text-[24px] font-bold tracking-tight text-white">NextHire</span>
                    </div>
                    <nav className="flex items-center gap-2 h-[64px]">
                        <a href="/student" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">Student</a>
                        <a href="/company" className="text-[14px] font-medium text-white px-4 h-full flex items-center border-b-2 border-white">Company</a>
                        <a href="/college" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">College</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[13px] font-medium text-green-400">AI Online</span>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">HR</div>
                    </div>
                </div>
            </header>

            {/* LEFT SIDEBAR OVERLAY */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed top-0 left-0 h-full w-[300px] z-40 flex flex-col overflow-y-auto py-[32px] px-[24px] shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[18px] font-bold text-gray-900">Navigation</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                </div>
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                        { id: 'postings', label: 'Job Postings', icon: 'work' },
                        { id: 'interviews', label: 'Interviews', icon: 'record_voice_over' },
                        { id: 'analytics', label: 'Analytics', icon: 'analytics' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-white/40">
                    <p className="text-[13px] text-gray-500 mb-2">Hiring powered by</p>
                    <p className="text-[16px] font-bold text-gray-900">Groq AI</p>
                    <p className="text-[12px] text-gray-400 mt-1">Blind hiring • Bias-free screening</p>
                </div>
            </aside>

            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">

                {/* MAIN */}
                <main className="flex-grow p-[24px] sm:p-[32px] overflow-y-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* ===== DASHBOARD TAB ===== */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Company Hiring Portal</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">AI-powered resume screening with blind hiring principles</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="rounded-[16px] p-5 flex items-center gap-4 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                            <div className={`${stat.color} p-3 rounded-xl`}><span className="material-symbols-outlined text-2xl">{stat.icon}</span></div>
                                            <div>
                                                <p className="text-[24px] font-bold text-gray-900">{stat.value}</p>
                                                <p className="text-[13px] text-gray-500">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <CreateJobForm onAnalyze={handleAnalyze} />

                                {error && (
                                    <div className="mt-6 rounded-[16px] p-5 bg-red-50 border border-red-200">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-red-500">error</span>
                                            <div><p className="font-semibold text-red-700">Analysis Failed</p><p className="text-[14px] text-red-500 mt-1">{error}</p></div>
                                        </div>
                                    </div>
                                )}

                                {analyzing && <div className="mt-8"><LoadingSpinner text="Analyzing Resumes with Groq AI" /></div>}

                                {showLeaderboard && !analyzing && candidates.length > 0 && (
                                    <div className="mt-8"><CandidateLeaderboard candidates={candidates} jobTitle={jobTitle} resumeTexts={mockResumeTexts} onHire={handleHire} interviewData={interviewData} onOpenInterview={handleOpenInterview} /></div>
                                )}
                            </>
                        )}

                        {/* ===== JOB POSTINGS TAB ===== */}
                        {activeTab === 'postings' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Job Postings</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">All jobs posted through this portal</p>
                                </div>
                                {postedJobs.length === 0 ? (
                                    <div className="text-center py-16">
                                        <span className="material-symbols-outlined text-[56px] text-gray-300 block mb-4">work_off</span>
                                        <p className="text-[16px] font-medium text-gray-400 mb-2">No jobs posted yet</p>
                                        <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold text-[14px] hover:underline">Go to Dashboard to create one</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {postedJobs.map(job => (
                                            <div key={job.id} className="rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-blue-100 p-3 rounded-xl"><span className="material-symbols-outlined text-blue-600">work</span></div>
                                                        <div>
                                                            <h3 className="text-[16px] font-bold text-gray-900">{job.title}</h3>
                                                            <p className="text-[13px] text-gray-500">{job.resumeCount} resumes • {job.candidatesShortlisted} shortlisted • {new Date(job.postedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
                                                </div>
                                                {job.competencies?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {job.competencies.map(c => <span key={c} className="px-2.5 py-0.5 bg-white/30 rounded-full text-[12px] text-gray-600 border border-white/40">{c}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== INTERVIEWS TAB ===== */}
                        {activeTab === 'interviews' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Interview Pipeline</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">Track and manage candidate interview rounds</p>
                                </div>
                                {Object.keys(interviewData).length === 0 ? (
                                    <div className="text-center py-16">
                                        <span className="material-symbols-outlined text-[56px] text-gray-300 block mb-4">record_voice_over</span>
                                        <p className="text-[16px] font-medium text-gray-400 mb-2">No interviews started yet</p>
                                        <p className="text-[13px] text-gray-300 mb-4">Go to Dashboard, analyze resumes, and click "Interview" on a candidate</p>
                                        <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold text-[14px] hover:underline">Go to Dashboard</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.values(interviewData).map(entry => {
                                            const roundCount = entry.rounds?.length || 0;
                                            const acceptedCount = entry.rounds?.filter(r => r.status === 'accepted').length || 0;
                                            const rejectedCount = entry.rounds?.filter(r => r.status === 'rejected').length || 0;
                                            const pendingCount = entry.rounds?.filter(r => r.status === 'pending').length || 0;
                                            const latestRound = entry.rounds?.[entry.rounds.length - 1];
                                            return (
                                                <div
                                                    key={entry.candidateId}
                                                    onClick={() => {
                                                        // Find the full candidate object from all candidates
                                                        const fullCandidate = candidates.find(c => c.id === entry.candidateId) || { id: entry.candidateId, fileName: entry.candidateName };
                                                        handleOpenInterview(fullCandidate);
                                                    }}
                                                    className="rounded-[16px] p-5 shadow-sm cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-gray-200"
                                                    style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-[16px] font-bold border-2 ${entry.overallStatus === 'accepted' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                                                                entry.overallStatus === 'rejected' ? 'bg-red-100 border-red-300 text-red-700' :
                                                                    'bg-blue-100 border-blue-300 text-blue-700'
                                                                }`}>
                                                                {(entry.candidateName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[15px] font-bold text-gray-900 capitalize">{entry.candidateName || entry.candidateId}</h3>
                                                                <p className="text-[12px] text-gray-500 font-mono mt-0.5">{entry.candidateId}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-4 text-[12px]">
                                                                <span className="text-gray-500">{roundCount} round{roundCount !== 1 ? 's' : ''}</span>
                                                                {acceptedCount > 0 && <span className="text-emerald-600 font-semibold">{acceptedCount} accepted</span>}
                                                                {rejectedCount > 0 && <span className="text-red-600 font-semibold">{rejectedCount} rejected</span>}
                                                                {pendingCount > 0 && <span className="text-amber-600 font-semibold">{pendingCount} pending</span>}
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${entry.overallStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                                entry.overallStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {entry.overallStatus === 'accepted' ? '✓ Accepted' :
                                                                    entry.overallStatus === 'rejected' ? '✗ Rejected' : 'In Progress'}
                                                            </span>
                                                            <span className="material-symbols-outlined text-gray-400 text-[20px]">chevron_right</span>
                                                        </div>
                                                    </div>
                                                    {latestRound && (
                                                        <div className="mt-3 pt-3 border-t border-white/30 flex items-center gap-3">
                                                            <span className="text-[11px] text-gray-500">Latest: <strong>{latestRound.type}</strong> round</span>
                                                            {latestRound.review && <span className="text-[11px] text-gray-400 truncate max-w-sm">"{latestRound.review.substring(0, 80)}{latestRound.review.length > 80 ? '...' : ''}"</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== ANALYTICS TAB ===== */}
                        {activeTab === 'analytics' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Hiring Analytics</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">Performance metrics and hiring funnel</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {[
                                        { label: 'Total Jobs Posted', value: String(postedJobs.length || 3), icon: 'work', color: 'bg-blue-100 text-blue-600' },
                                        { label: 'Total Candidates Screened', value: String(postedJobs.reduce((s, j) => s + j.resumeCount, 0) || 247), icon: 'people', color: 'bg-purple-100 text-purple-600' },
                                        { label: 'Total Shortlisted', value: String(postedJobs.reduce((s, j) => s + j.candidatesShortlisted, 0) || 34), icon: 'how_to_reg', color: 'bg-green-100 text-green-600' },
                                        { label: 'Hired', value: String(hiredCandidates.length), icon: 'handshake', color: 'bg-orange-100 text-orange-600' },
                                    ].map(stat => (
                                        <div key={stat.label} className="rounded-[16px] p-5 flex items-center gap-4 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                            <div className={`${stat.color} p-3 rounded-xl`}><span className="material-symbols-outlined text-2xl">{stat.icon}</span></div>
                                            <div><p className="text-[24px] font-bold text-gray-900">{stat.value}</p><p className="text-[13px] text-gray-500">{stat.label}</p></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Hiring Funnel */}
                                <div className="rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-4">Hiring Funnel</h3>
                                    {[
                                        { stage: 'Resumes Received', count: postedJobs.reduce((s, j) => s + j.resumeCount, 0) || 247, pct: 100 },
                                        { stage: 'AI Screened', count: postedJobs.reduce((s, j) => s + j.resumeCount, 0) || 247, pct: 100 },
                                        { stage: 'Shortlisted', count: postedJobs.reduce((s, j) => s + j.candidatesShortlisted, 0) || 34, pct: 14 },
                                        { stage: 'Interviewed', count: 12, pct: 5 },
                                        { stage: 'Hired', count: hiredCandidates.length || 5, pct: 2 },
                                    ].map((step, i) => (
                                        <div key={step.stage} className="flex items-center gap-4 mb-3">
                                            <span className="text-[14px] font-medium text-gray-700 w-40 shrink-0">{step.stage}</span>
                                            <div className="flex-1 h-3 bg-white/40 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${step.pct}%` }}></div></div>
                                            <span className="text-[14px] font-bold text-gray-900 w-12 text-right">{step.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>

                {/* RIGHT PANEL TOGGLE BUTTON */}
                <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="fixed bottom-6 right-6 z-20 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg shadow-indigo-900/30 transition-all hover:scale-105">
                    <span className="material-symbols-outlined text-[24px]">{rightPanelOpen ? 'close' : 'info'}</span>
                </button>
            </div>

            {/* RIGHT PANEL OVERLAY */}
            {rightPanelOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setRightPanelOpen(false)} />}
            <aside className={`fixed top-0 right-0 h-full w-[320px] z-40 overflow-y-auto shadow-2xl transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="p-[28px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[15px] font-bold text-gray-900">Recent Activity</h3>
                        <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                    </div>
                    <div className="space-y-4">
                        {(hiredCandidates.length > 0 ? hiredCandidates.slice(0, 2).map((c, i) => ({ text: `${c.id} hired for ${c.jobTitle}`, time: 'Just now', icon: 'handshake', color: 'bg-green-100 text-green-600' })) : []).concat([
                            { text: 'Resume batch uploaded', time: '2 min ago', icon: 'upload_file', color: 'bg-blue-100 text-blue-600' },
                            { text: 'AI analysis completed', time: '15 min ago', icon: 'smart_toy', color: 'bg-purple-100 text-purple-600' },
                            { text: '3 candidates shortlisted', time: '1 hour ago', icon: 'how_to_reg', color: 'bg-green-100 text-green-600' },
                        ]).slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`${item.color} p-2 rounded-lg shrink-0`}><span className="material-symbols-outlined text-[18px]">{item.icon}</span></div>
                                <div><p className="text-[14px] text-gray-800 font-medium">{item.text}</p><p className="text-[12px] text-gray-400">{item.time}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/40">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                            <div><div className="flex justify-between text-[13px] mb-1"><span className="text-gray-600">Avg Match Score</span><span className="font-bold text-gray-900">84%</span></div><div className="h-2 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }}></div></div></div>
                            <div><div className="flex justify-between text-[13px] mb-1"><span className="text-gray-600">Response Rate</span><span className="font-bold text-gray-900">92%</span></div><div className="h-2 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div></div></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Interview Rounds Modal */}
            {interviewCandidate && (
                <InterviewRoundsModal
                    candidate={interviewCandidate}
                    interviewData={interviewData[interviewCandidate.id]}
                    onUpdateInterview={handleUpdateInterview}
                    onClose={() => setInterviewCandidate(null)}
                />
            )}
        </div>
    );
}
