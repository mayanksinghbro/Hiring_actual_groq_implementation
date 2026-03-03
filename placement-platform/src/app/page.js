export default function LandingPage() {
    return (
        <div
            className="min-h-screen font-sans text-gray-900"
            style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(240,242,245,0.45)), url(/backgrounds/welcome-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* ===== NAVBAR ===== */}
            <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">grid_view</span>
                        </div>
                        <span className="text-[24px] font-bold tracking-tight text-white">NextHire</span>
                        <span className="ml-2 px-2.5 py-0.5 bg-white/10 text-white/80 text-[11px] font-bold rounded-full uppercase tracking-wider border border-white/20">AI Powered</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/auth/login/student" className="text-[14px] font-medium text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors">Sign In</a>
                        <a href="/auth/login/student" className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20">Get Started</a>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-white/20 rounded-full opacity-40 blur-[100px]"></div>
                    <div className="absolute top-[200px] -left-[200px] w-[500px] h-[500px] bg-white/15 rounded-full opacity-30 blur-[100px]"></div>
                </div>

                <div className="max-w-[1200px] mx-auto px-6 pt-[80px] pb-[100px] relative">
                    <div className="text-center max-w-[720px] mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/40 shadow-sm mb-8" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[13px] font-medium text-gray-600">Trusted by 50+ colleges across India</span>
                        </div>

                        <h1 className="text-[52px] font-extrabold leading-[1.15] tracking-tight text-gray-900 mb-6">
                            The AI Platform That Makes
                            <span className="text-blue-600"> Campus Hiring</span> Effortless
                        </h1>

                        <p className="text-[18px] text-gray-600 leading-relaxed max-w-[560px] mx-auto mb-10">
                            NextHire connects students, companies, and placement cells on one intelligent platform — powered by Groq AI for blind hiring, skill gap analysis, and career roadmapping.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <a href="/auth/login/student" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-[16px] font-semibold transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5">
                                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                Start Your Journey
                            </a>
                            <a href="#features" className="inline-flex items-center gap-2 text-gray-700 px-8 py-4 rounded-xl text-[16px] font-semibold border border-white/50 transition-all hover:-translate-y-0.5" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                See How It Works
                            </a>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-[72px] grid grid-cols-4 gap-4 max-w-[800px] mx-auto">
                        {[
                            { value: '10,000+', label: 'Students Placed' },
                            { value: '500+', label: 'Hiring Companies' },
                            { value: '95%', label: 'Match Accuracy' },
                            { value: '< 48h', label: 'Avg Response Time' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-2xl p-5 text-center border border-white/40 shadow-sm" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                                <p className="text-[24px] font-bold text-gray-900">{stat.value}</p>
                                <p className="text-[13px] text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="max-w-[1200px] mx-auto px-6 py-[80px]">
                <div className="text-center mb-[56px]">
                    <span className="inline-block px-3 py-1 bg-blue-600/10 text-blue-600 text-[13px] font-bold rounded-full mb-4 border border-blue-600/20">WHY PLACIFY</span>
                    <h2 className="text-[36px] font-bold text-gray-900 mb-3">Everything You Need in One Platform</h2>
                    <p className="text-[16px] text-gray-500 max-w-[480px] mx-auto">From resume screening to placement analytics — every step of the hiring journey, supercharged with AI.</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {[
                        { icon: 'smart_toy', title: 'Groq AI Resume Screening', desc: 'Upload resumes and let our AI rank candidates based on job requirements — completely blind, bias-free, and instant.' },
                        { icon: 'route', title: 'Career Roadmapping', desc: 'Students get personalized skill gap analysis and a step-by-step roadmap to their dream job, powered by AI.' },
                        { icon: 'analytics', title: 'Real-Time Placement Analytics', desc: 'Placement cells get live dashboards with trend charts, batch analytics, and company-student mapping.' },
                        { icon: 'verified_user', title: 'Blind Hiring Principles', desc: 'Names, photos, and personal info are hidden during screening. Only skills and experience matter.' },
                        { icon: 'hub', title: 'Company-Student Matching', desc: 'AI matches students to companies based on skill compatibility, producing instant shortlists.' },
                        { icon: 'security', title: 'Secure & Role-Based', desc: 'Every user gets a role-specific portal. Data is encrypted, passwords are hashed, sessions secured.' },
                    ].map((feature) => (
                        <div key={feature.title} className="rounded-2xl p-7 border border-white/50 shadow-sm hover:shadow-md transition-all group" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                            <div className="bg-white/40 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[24px] text-gray-900">{feature.icon}</span>
                            </div>
                            <h3 className="text-[17px] font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== PORTAL CARDS ===== */}
            <section className="max-w-[1200px] mx-auto px-6 py-[80px]">
                <div className="text-center mb-[56px]">
                    <span className="inline-block px-3 py-1 bg-emerald-600/10 text-emerald-600 text-[13px] font-bold rounded-full mb-4 border border-emerald-600/20">GET STARTED</span>
                    <h2 className="text-[36px] font-bold text-gray-900 mb-3">Choose Your Portal</h2>
                    <p className="text-[16px] text-gray-500 max-w-[480px] mx-auto">Three portals, one platform. Sign in to the experience built for your role.</p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {/* Student */}
                    <a href="/auth/login/student" className="group block rounded-2xl border border-white/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                        <div className="h-[6px] bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        <div className="p-8">
                            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-blue-600 text-[32px]">school</span>
                            </div>
                            <h3 className="text-[22px] font-bold text-gray-900 mb-3">Student Portal</h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-6">Discover your career roadmap, analyze skill gaps, upload resumes, and get matched with top companies.</p>
                            <ul className="space-y-2 mb-8">
                                {['AI Career Roadmap', 'Skill Gap Analysis', 'Job Matching', 'Resume Upload'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-[13px] text-gray-600">
                                        <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>{item}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 text-blue-600 font-semibold text-[15px] group-hover:gap-3 transition-all">
                                Enter as Student<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </div>
                    </a>

                    {/* Company */}
                    <a href="/auth/login/company" className="group block rounded-2xl border border-white/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                        <div className="h-[6px] bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                        <div className="p-8">
                            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-indigo-600 text-[32px]">business</span>
                            </div>
                            <h3 className="text-[22px] font-bold text-gray-900 mb-3">Company Portal</h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-6">Post jobs, upload bulk resumes, and let Groq AI rank candidates with blind hiring — zero bias, instant results.</p>
                            <ul className="space-y-2 mb-8">
                                {['Groq AI Screening', 'Blind Hiring', 'Candidate Leaderboard', 'Email Automation'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-[13px] text-gray-600">
                                        <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>{item}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-[15px] group-hover:gap-3 transition-all">
                                Enter as Company<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </div>
                    </a>

                    {/* College */}
                    <a href="/auth/login/college" className="group block rounded-2xl border border-white/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                        <div className="h-[6px] bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                        <div className="p-8">
                            <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-emerald-600 text-[32px]">account_balance</span>
                            </div>
                            <h3 className="text-[22px] font-bold text-gray-900 mb-3">College Portal</h3>
                            <p className="text-[14px] text-gray-500 leading-relaxed mb-6">Live placement dashboards, batch analytics, trend charts, and company-student mapping for placement cells.</p>
                            <ul className="space-y-2 mb-8">
                                {['Placement Analytics', 'Batch Statistics', 'Company Mapping', 'Trend Visualization'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-[13px] text-gray-600">
                                        <span className="material-symbols-outlined text-green-500 text-[16px]">check_circle</span>{item}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-[15px] group-hover:gap-3 transition-all">
                                Enter as College<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                        </div>
                    </a>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="border-y border-white/30" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                <div className="max-w-[1200px] mx-auto px-6 py-[80px]">
                    <div className="text-center mb-[56px]">
                        <span className="inline-block px-3 py-1 bg-purple-600/10 text-purple-600 text-[13px] font-bold rounded-full mb-4 border border-purple-600/20">HOW IT WORKS</span>
                        <h2 className="text-[36px] font-bold text-gray-900 mb-3">Three Steps to Smarter Hiring</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Post & Upload', desc: 'Companies post job requirements and upload candidate resumes in bulk.', icon: 'upload_file' },
                            { step: '02', title: 'AI Analyzes', desc: 'Groq AI scores and ranks every candidate — blindly, based on skills alone.', icon: 'psychology' },
                            { step: '03', title: 'Hire the Best', desc: 'Review the leaderboard, send interview invites, and close offers — all in one place.', icon: 'handshake' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="bg-white/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <span className="material-symbols-outlined text-[28px] text-gray-900">{item.icon}</span>
                                </div>
                                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Step {item.step}</span>
                                <h3 className="text-[20px] font-bold text-gray-900 mt-2 mb-3">{item.title}</h3>
                                <p className="text-[14px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="max-w-[1200px] mx-auto px-6 py-[80px]">
                <div className="bg-[#1a1a1a] rounded-3xl p-[56px] text-center relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-[36px] font-bold text-white mb-4">Ready to Transform Your Placement Process?</h2>
                        <p className="text-[16px] text-white/60 max-w-[500px] mx-auto mb-8">Join hundreds of institutions using NextHire to make campus hiring smarter, faster, and fairer.</p>
                        <div className="flex items-center justify-center gap-4">
                            <a href="/auth/login/student" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-[16px] font-semibold transition-all shadow-lg hover:-translate-y-0.5">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>Sign Up Free
                            </a>
                            <a href="/auth/login/company" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl text-[16px] font-semibold border border-white/20 transition-all hover:-translate-y-0.5">
                                <span className="material-symbols-outlined text-[20px]">business</span>For Companies
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-[#1a1a1a] border-t border-white/10">
                <div className="max-w-[1200px] mx-auto px-6 py-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white text-xl">grid_view</span>
                            </div>
                            <span className="text-[16px] font-bold text-white">NextHire</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="/auth/login/student" className="text-[13px] text-white/50 hover:text-white transition-colors">Student</a>
                            <a href="/auth/login/company" className="text-[13px] text-white/50 hover:text-white transition-colors">Company</a>
                            <a href="/auth/login/college" className="text-[13px] text-white/50 hover:text-white transition-colors">College</a>
                        </div>
                        <p className="text-[13px] text-white/30">&copy; 2026 NextHire. AI-powered placement platform.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
