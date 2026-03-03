'use client';

import { useState } from 'react';

const ROUND_TYPES = ['Technical', 'HR', 'Managerial', 'Culture Fit', 'System Design', 'Coding', 'Custom'];

export default function InterviewRoundsModal({ candidate, interviewData, onUpdateInterview, onClose }) {
    const data = interviewData || { rounds: [], overallStatus: 'in_progress' };
    const [rounds, setRounds] = useState(data.rounds || []);
    const [overallStatus, setOverallStatus] = useState(data.overallStatus || 'in_progress');

    const candidateName = candidate.fileName
        ? candidate.fileName.split('.')[0].replace(/[-_]/g, ' ')
        : 'Unknown Candidate';

    const handleAddRound = () => {
        const newRound = {
            id: rounds.length + 1,
            type: 'Technical',
            status: 'pending',
            review: '',
            date: new Date().toISOString(),
        };
        const updated = [...rounds, newRound];
        setRounds(updated);
        syncToParent(updated, overallStatus);
    };

    const handleUpdateRoundField = (roundId, field, value) => {
        const updated = rounds.map(r => r.id === roundId ? { ...r, [field]: value } : r);
        setRounds(updated);
        syncToParent(updated, overallStatus);
    };

    const handleSetVerdict = (roundId, verdict) => {
        const updated = rounds.map(r => r.id === roundId ? { ...r, status: verdict } : r);
        setRounds(updated);

        // If any round is rejected, overall = rejected
        // If all rounds accepted, overall = accepted
        // Otherwise in_progress
        let newOverall = 'in_progress';
        if (verdict === 'rejected') {
            newOverall = 'rejected';
        } else {
            const allAccepted = updated.every(r => r.status === 'accepted');
            if (allAccepted && updated.length > 0) newOverall = 'accepted';
        }
        setOverallStatus(newOverall);
        syncToParent(updated, newOverall);
    };

    const handleFinalDecision = (decision) => {
        setOverallStatus(decision);
        syncToParent(rounds, decision);
    };

    const syncToParent = (updatedRounds, status) => {
        onUpdateInterview(candidate.id, {
            candidateId: candidate.id,
            candidateName,
            jobTitle: candidate.jobTitle || '',
            rounds: updatedRounds,
            overallStatus: status,
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                        <span className="material-symbols-outlined text-[13px]">cancel</span>Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>Pending
                    </span>
                );
        }
    };

    const getOverallBadge = () => {
        switch (overallStatus) {
            case 'accepted':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                        <span className="text-[14px] font-bold text-emerald-700">Candidate Accepted</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
                        <span className="material-symbols-outlined text-red-600 text-[20px]">block</span>
                        <span className="text-[14px] font-bold text-red-700">Candidate Rejected</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
                        <span className="material-symbols-outlined text-blue-600 text-[20px]">pending</span>
                        <span className="text-[14px] font-bold text-blue-700">Interview In Progress</span>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)' }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ animation: 'slideUp 0.3s ease-out' }}>

                {/* Header */}
                <div className="shrink-0 px-8 py-6 border-b border-gray-100" style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-[18px] font-bold backdrop-blur-sm border border-white/20">
                                {candidateName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-[20px] font-bold text-white capitalize">{candidateName}</h2>
                                <p className="text-[13px] text-white/70 mt-0.5 font-mono">{candidate.id} • Match Score: {candidate.matchScore}%</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                            <span className="material-symbols-outlined text-white text-[24px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Overall Status Bar */}
                <div className="shrink-0 px-8 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                    {getOverallBadge()}
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-400 font-medium mr-2">Final Decision:</span>
                        <button
                            onClick={() => handleFinalDecision('accepted')}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${overallStatus === 'accepted' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">thumb_up</span>Accept
                        </button>
                        <button
                            onClick={() => handleFinalDecision('rejected')}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${overallStatus === 'rejected' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">thumb_down</span>Reject
                        </button>
                    </div>
                </div>

                {/* Rounds Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {rounds.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gray-50 mb-4">
                                <span className="material-symbols-outlined text-[40px] text-gray-300">assignment</span>
                            </div>
                            <p className="text-[16px] font-medium text-gray-400 mb-2">No interview rounds yet</p>
                            <p className="text-[13px] text-gray-300 mb-6">Add the first round to start the interview process</p>
                            <button
                                onClick={handleAddRound}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 shadow-lg"
                                style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                                <span className="material-symbols-outlined text-[18px]">add_circle</span>Add First Round
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {rounds.map((round, index) => (
                                <div key={round.id} className="relative">
                                    {/* Timeline connector */}
                                    {index < rounds.length - 1 && (
                                        <div className="absolute left-[23px] top-[56px] bottom-0 w-[2px] bg-gray-200 z-0" />
                                    )}

                                    <div className="relative z-10 flex gap-5 pb-6">
                                        {/* Timeline node */}
                                        <div className="shrink-0 mt-1">
                                            <div className={`h-[48px] w-[48px] rounded-xl flex items-center justify-center text-[14px] font-bold border-2 ${round.status === 'accepted' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                                                    round.status === 'rejected' ? 'bg-red-100 border-red-300 text-red-700' :
                                                        'bg-blue-100 border-blue-300 text-blue-700'
                                                }`}>
                                                R{round.id}
                                            </div>
                                        </div>

                                        {/* Round card */}
                                        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            {/* Round header */}
                                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-[14px] font-bold text-gray-900">Round {round.id}</h3>
                                                    <select
                                                        value={round.type}
                                                        onChange={(e) => handleUpdateRoundField(round.id, 'type', e.target.value)}
                                                        className="text-[12px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                    >
                                                        {ROUND_TYPES.map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(round.status)}
                                                    <span className="text-[11px] text-gray-400">{new Date(round.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Review area */}
                                            <div className="px-5 py-4">
                                                <label className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    <span className="material-symbols-outlined text-[14px]">rate_review</span>
                                                    Review / Feedback
                                                </label>
                                                <textarea
                                                    value={round.review}
                                                    onChange={(e) => handleUpdateRoundField(round.id, 'review', e.target.value)}
                                                    placeholder="Write your review for this round... (e.g., technical skills, communication, problem-solving approach)"
                                                    rows={3}
                                                    className="w-full text-[13px] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all placeholder:text-gray-300"
                                                />
                                            </div>

                                            {/* Action buttons */}
                                            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/30 rounded-b-xl">
                                                <button
                                                    onClick={() => handleSetVerdict(round.id, 'accepted')}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${round.status === 'accepted'
                                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                    {round.status === 'accepted' ? 'Accepted ✓' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={() => handleSetVerdict(round.id, 'rejected')}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${round.status === 'rejected'
                                                            ? 'bg-red-600 text-white shadow-md shadow-red-200'
                                                            : 'bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                                    {round.status === 'rejected' ? 'Rejected ✗' : 'Reject'}
                                                </button>
                                                {round.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleSetVerdict(round.id, 'pending')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">undo</span>Reset
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-8 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-[12px] text-gray-400">{rounds.length} round{rounds.length !== 1 ? 's' : ''} total</span>
                        {rounds.length > 0 && (
                            <span className="text-[12px] text-gray-400">
                                • {rounds.filter(r => r.status === 'accepted').length} accepted
                                • {rounds.filter(r => r.status === 'rejected').length} rejected
                                • {rounds.filter(r => r.status === 'pending').length} pending
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddRound}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 shadow-lg"
                        style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>Add Round
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
