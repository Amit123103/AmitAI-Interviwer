"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"

export default function PublicPortfolioPage() {
    const params = useParams()
    const id = params?.id as string

    const [portfolio, setPortfolio] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [messageStatus, setMessageStatus] = useState("")

    useEffect(() => {
        if (!id) return

        const fetchPortfolio = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
                const res = await fetch(`${apiUrl}/api/portfolio/public/${id}`)

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Portfolio not found or not published.")
                    }
                    throw new Error("Failed to load portfolio.")
                }

                const data = await res.json()
                setPortfolio(data) // Wait, previously it was data.data but the backend returns `portfolio` directly. Oh, let's keep it as `data` if backend does `res.status(200).json(portfolio)`. 
                // Ah, the controller does: `res.status(200).json(portfolio);`. So it should be `setPortfolio(data)` directly.
            } catch (err: any) {
                setError(err.message || "An error occurred.")
            } finally {
                setLoading(false)
            }
        }

        fetchPortfolio()
    }, [id])

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSending(true)
        setMessageStatus("")
        try {
            const formData = new FormData(e.currentTarget)
            const payload = {
                name: formData.get("name"),
                email: formData.get("email"),
                message: formData.get("message")
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const res = await fetch(`${apiUrl}/api/portfolio/message/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error("Could not send message")
            setMessageStatus("Message sent successfully!")
            //@ts-ignore
            e.target.reset()
        } catch (err: any) {
            setMessageStatus(err.message || "Failed to send.")
        } finally {
            setIsSending(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
                <h1 className="text-4xl font-bold mb-4 text-zinc-300">Oops!</h1>
                <p className="text-zinc-500 max-w-md">{error || "Could not load this portfolio."}</p>
            </div>
        )
    }

    const { templateId, personalDetails, experience, education, skills, projects } = portfolio

    // --- TEMPLATES ---
    const ModernTemplate = () => (
        <div className="bg-white text-zinc-900 min-h-screen p-8 md:p-16 lg:p-24 font-sans max-w-5xl mx-auto shadow-2xl">
            <header className="mb-16 text-center md:text-left">
                <h1 className="text-5xl md:text-6xl font-black mb-4">{personalDetails?.fullName || "Your Name"}</h1>
                <h2 className="text-2xl text-zinc-500 mb-6">{personalDetails?.headline || "Your Title"}</h2>
                <div className="flex flex-wrap gap-6 text-base text-zinc-600 justify-center md:justify-start">
                    {personalDetails?.email && <span>{personalDetails.email}</span>}
                    {personalDetails?.location && <span>{personalDetails.location}</span>}
                    {personalDetails?.linkedin && <a href={personalDetails.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">LinkedIn</a>}
                    {personalDetails?.github && <a href={personalDetails.github} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>}
                    {personalDetails?.website && <a href={personalDetails.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Website</a>}
                </div>
            </header>

            {personalDetails?.about && (
                <section className="mb-16">
                    <h3 className="text-2xl font-bold border-b-2 border-zinc-200 pb-2 mb-6 uppercase tracking-wider text-zinc-400">About Me</h3>
                    <p className="text-zinc-700 leading-relaxed text-lg max-w-4xl">{personalDetails.about}</p>
                </section>
            )}

            {experience && experience.length > 0 && (
                <section className="mb-16">
                    <h3 className="text-2xl font-bold border-b-2 border-zinc-200 pb-2 mb-8 uppercase tracking-wider text-zinc-400">Experience</h3>
                    <div className="space-y-12">
                        {experience.map((exp: any) => (
                            <div key={exp.id || exp._id}>
                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
                                    <h4 className="text-2xl font-bold text-zinc-800">{exp.title}</h4>
                                    <span className="text-zinc-500 font-mono mt-1 md:mt-0">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-indigo-600 font-medium text-lg mb-4">{exp.company} <span className="text-zinc-400 font-normal">| {exp.location}</span></div>
                                <p className="text-zinc-700 leading-relaxed text-lg">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education && education.length > 0 && (
                <section className="mb-16">
                    <h3 className="text-2xl font-bold border-b-2 border-zinc-200 pb-2 mb-8 uppercase tracking-wider text-zinc-400">Education</h3>
                    <div className="space-y-8">
                        {education.map((edu: any) => (
                            <div key={edu.id || edu._id}>
                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
                                    <h4 className="text-xl font-bold text-zinc-800">{edu.degree}</h4>
                                    <span className="text-zinc-500 font-mono text-sm">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <div className="text-indigo-600 font-medium">{edu.institution} <span className="text-zinc-400 font-normal">| {edu.location}</span></div>
                                <p className="text-zinc-600 mt-2">{edu.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills && skills.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-zinc-200 pb-2 mb-6 uppercase tracking-wider text-zinc-400">Skills</h3>
                    <div className="flex flex-wrap gap-3">
                        {skills.map((skill: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-zinc-100 text-zinc-800 font-medium rounded-lg">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {projects && projects.length > 0 && (
                <section className="mt-16 mb-16">
                    <h3 className="text-2xl font-bold border-b-2 border-zinc-200 pb-2 mb-8 uppercase tracking-wider text-zinc-400">Projects</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        {projects.map((proj: any) => (
                            <div key={proj.id} className="border border-zinc-200 p-6 rounded-2xl hover:shadow-lg transition-shadow bg-zinc-50 flex flex-col">
                                <h4 className="text-xl font-bold mb-2">
                                    {proj.link ? <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{proj.title}</a> : proj.title}
                                </h4>
                                <p className="text-zinc-600 mb-6">{proj.description}</p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {proj.technologies?.map((tech: string, i: number) => (
                                        <span key={i} className="text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 shadow-sm mt-16">
                <h3 className="text-2xl font-bold pb-2 mb-6 uppercase tracking-wider text-zinc-400">Get In Touch</h3>
                <form onSubmit={handleSendMessage} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="name" required placeholder="Your Name" className="p-3 rounded-lg border border-zinc-200 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input name="email" type="email" required placeholder="Your Email" className="p-3 rounded-lg border border-zinc-200 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <textarea name="message" required placeholder="Your Message..." rows={4} className="p-3 rounded-lg border border-zinc-200 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" disabled={isSending} className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
                        {isSending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                    {messageStatus && <p className="text-sm font-medium text-indigo-600 mt-3">{messageStatus}</p>}
                </form>
            </section>
        </div>
    )

    const CyberTemplate = () => (
        <div className="bg-zinc-950 text-indigo-400 min-h-screen p-8 md:p-16 lg:p-24 font-mono shadow-[inset_0_0_150px_rgba(99,102,241,0.05)] relative overflow-hidden">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 border-l-4 border-indigo-500 pl-8 md:pl-16 py-8">
                <header className="mb-20">
                    <div className="text-sm text-indigo-500/50 mb-4 tracking-widest">{">"} SYSTEM_INITIALIZED // {new Date().getFullYear()}</div>
                    <h1 className="text-5xl md:text-7xl font-black mb-4 text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] tracking-tight">{personalDetails?.fullName || "GUEST_USER"}</h1>
                    <h2 className="text-2xl md:text-3xl text-indigo-400 mb-8 font-light tracking-wide">{personalDetails?.headline || "UNKNOWN_ROLE"}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-200/60 bg-indigo-950/20 p-6 border border-indigo-500/20 rounded-lg">
                        {personalDetails?.email && <div><span className="text-indigo-500">EMAIL:</span> {personalDetails.email}</div>}
                        {personalDetails?.location && <div><span className="text-indigo-500">LOC:</span> {personalDetails.location}</div>}
                        {personalDetails?.linkedin && <div><span className="text-indigo-500">LINKEDIN:</span> <a href={personalDetails.linkedin} className="hover:text-indigo-300">Link</a></div>}
                        {personalDetails?.github && <div><span className="text-indigo-500">GITHUB:</span> <a href={personalDetails.github} className="hover:text-indigo-300">Link</a></div>}
                        {personalDetails?.website && <div><span className="text-indigo-500">WEB:</span> <a href={personalDetails.website} className="hover:text-indigo-300">Link</a></div>}
                    </div>
                </header>

                {personalDetails?.about && (
                    <section className="mb-20 relative overflow-hidden p-8 bg-indigo-500/[0.02] border border-indigo-500/30 rounded-lg">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                        <h3 className="text-2xl font-bold mb-6 text-white tracking-widest">_ABOUT</h3>
                        <p className="text-indigo-100/90 leading-loose text-lg">{personalDetails.about}</p>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500/50"></div>
                    </section>
                )}

                {experience && experience.length > 0 && (
                    <section className="mb-20">
                        <h3 className="text-2xl font-bold mb-8 text-white tracking-widest">_EXPERIENCE</h3>
                        <div className="space-y-12 pl-6 border-l-2 border-indigo-500/20 relative">
                            {experience.map((exp: any) => (
                                <div key={exp.id || exp._id} className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-zinc-950 border-2 border-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
                                    <h4 className="text-2xl font-bold text-indigo-300 mb-1">{exp.title} <span className="text-indigo-500/50 font-normal text-xl">@ {exp.company}</span></h4>
                                    <div className="text-sm text-indigo-400/60 mb-4 bg-indigo-950/30 inline-block px-3 py-1 rounded border border-indigo-500/10 tracking-widest">
                                        [{exp.startDate} - {exp.endDate}] :: {exp.location}
                                    </div>
                                    <p className="text-indigo-100/80 leading-relaxed text-lg">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {education && education.length > 0 && (
                    <section className="mb-20">
                        <h3 className="text-2xl font-bold mb-8 text-white tracking-widest">_EDUCATION</h3>
                        <div className="space-y-10 pl-6 border-l-2 border-indigo-500/20 relative">
                            {education.map((edu: any) => (
                                <div key={edu.id || edu._id} className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-zinc-950 border-2 border-indigo-500 rounded-full"></div>
                                    <h4 className="text-xl font-bold text-indigo-300 mb-1">{edu.degree}</h4>
                                    <div className="text-sm text-indigo-400/60 mb-2">[{edu.startDate} - {edu.endDate}] :: {edu.institution}</div>
                                    <p className="text-indigo-100/70 text-sm">{edu.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {skills && skills.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold mb-8 text-white tracking-widest">_SYS.SKILLS</h3>
                        <div className="flex flex-wrap gap-4">
                            {skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:bg-indigo-900/60 transition-colors">
                                    <span className="text-indigo-500 mr-2 opacity-50">{">"}</span>{skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {projects && projects.length > 0 && (
                    <section className="mt-20">
                        <h3 className="text-2xl font-bold mb-8 text-white tracking-widest">_PROJECTS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map((proj: any) => (
                                <div key={proj.id} className="bg-indigo-950/30 border border-indigo-500/30 p-6 relative flex flex-col hover:border-indigo-400 transition-colors">
                                    <div className="absolute top-0 right-0 px-2 py-1 bg-indigo-500/20 text-xs text-indigo-400 font-bold tracking-widest">EXE</div>
                                    <h4 className="text-xl font-bold text-indigo-300 mb-3">
                                        {proj.link ? <a href={proj.link} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">{proj.title}</a> : proj.title}
                                    </h4>
                                    <p className="text-indigo-200/70 text-sm mb-6 leading-relaxed">{proj.description}</p>
                                    <div className="text-xs text-indigo-500 mt-auto">
                                        [ {proj.technologies?.join(" | ")} ]
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mt-20 p-8 border border-indigo-500/30 bg-indigo-950/20 relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-indigo-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-indigo-500"></div>

                    <h3 className="text-2xl font-bold mb-8 text-white tracking-widest">_CONTACT</h3>
                    <form onSubmit={handleSendMessage} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input name="name" required placeholder="[ENTER_NAME]" className="p-3 bg-zinc-950/50 border border-indigo-500/30 w-full focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder:text-indigo-500/50" />
                            <input name="email" type="email" required placeholder="[ENTER_EMAIL]" className="p-3 bg-zinc-950/50 border border-indigo-500/30 w-full focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder:text-indigo-500/50" />
                        </div>
                        <textarea name="message" required placeholder="[ENTER_MESSAGE_DATA]..." rows={5} className="p-3 bg-zinc-950/50 border border-indigo-500/30 w-full focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder:text-indigo-500/50" />
                        <button type="submit" disabled={isSending} className="px-8 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500 text-indigo-200 tracking-widest font-bold flex items-center gap-3 transition-colors">
                            {isSending ? 'TRANSMITTING...' : <><Send className="w-4 h-4" /> TRANSMIT</>}
                        </button>
                        {messageStatus && <p className="text-sm text-indigo-400 mt-4 tracking-widest">{">"} {messageStatus}</p>}
                    </form>
                </section>
            </div>
        </div>
    )

    const CreativeTemplate = () => (
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 text-zinc-800 min-h-screen p-6 md:p-12 lg:p-20 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-20 text-center">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl rotate-3 mb-10 shadow-2xl shadow-orange-500/30 border-8 border-white flex items-center justify-center text-white text-5xl font-black transform hover:rotate-6 transition-transform">
                        {personalDetails?.fullName ? personalDetails.fullName.charAt(0).toUpperCase() : "P"}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 tracking-tighter">{personalDetails?.fullName || "Your Name"}</h1>
                    <h2 className="text-3xl font-bold text-zinc-700 mb-8">{personalDetails?.headline || "Your Creative Title"}</h2>

                    <div className="flex flex-wrap justify-center gap-4">
                        {personalDetails?.email && <span className="px-4 py-2 bg-white rounded-full shadow-sm text-rose-500 font-medium">{personalDetails.email}</span>}
                        {personalDetails?.location && <span className="px-4 py-2 bg-white rounded-full shadow-sm text-orange-500 font-medium">{personalDetails.location}</span>}
                        {personalDetails?.linkedin && <a href={personalDetails.linkedin} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full shadow-sm text-zinc-700 hover:text-rose-500 transition-colors font-medium">LinkedIn</a>}
                        {personalDetails?.github && <a href={personalDetails.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full shadow-sm text-zinc-700 hover:text-orange-500 transition-colors font-medium">GitHub</a>}
                    </div>
                </header>

                <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-xl shadow-zinc-200/50 p-8 md:p-16 lg:p-20 border border-white">
                    {personalDetails?.about && (
                        <section className="mb-20">
                            <h3 className="text-2xl uppercase tracking-[0.2em] text-rose-400 font-bold mb-8">Hello World.</h3>
                            <p className="text-zinc-600 leading-loose text-xl font-medium">{personalDetails.about}</p>
                        </section>
                    )}

                    {experience && experience.length > 0 && (
                        <section className="mb-20">
                            <h3 className="text-2xl uppercase tracking-[0.2em] text-rose-400 font-bold mb-12">Journey</h3>
                            <div className="space-y-16">
                                {experience.map((exp: any) => (
                                    <div key={exp.id || exp._id} className="relative pl-10 md:pl-16 border-l-4 border-orange-100">
                                        <div className="absolute -left-3 top-2 w-5 h-5 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full border-4 border-white shadow-md"></div>
                                        <h4 className="text-3xl font-black text-zinc-800 mb-2">{exp.title}</h4>
                                        <div className="text-orange-500 font-bold text-xl mb-4">{exp.company} <span className="text-zinc-400 text-base font-medium ml-4 bg-zinc-100 px-3 py-1 rounded-full">{exp.startDate} — {exp.endDate}</span></div>
                                        <p className="text-zinc-600 leading-relaxed text-lg">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {education && education.length > 0 && (
                        <section className="mb-20">
                            <h3 className="text-2xl uppercase tracking-[0.2em] text-rose-400 font-bold mb-12">Academic</h3>
                            <div className="space-y-12">
                                {education.map((edu: any) => (
                                    <div key={edu.id || edu._id} className="p-8 bg-rose-50/30 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-200 to-transparent opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                                        <h4 className="text-2xl font-black text-zinc-800 mb-2">{edu.degree}</h4>
                                        <div className="text-orange-500 font-bold mb-3">{edu.institution} <span className="text-zinc-400 text-sm font-medium ml-3 italic">{edu.startDate} — {edu.endDate}</span></div>
                                        <p className="text-zinc-600 leading-relaxed">{edu.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {skills && skills.length > 0 && (
                        <section>
                            <h3 className="text-2xl uppercase tracking-[0.2em] text-rose-400 font-bold mb-8">Toolkit</h3>
                            <div className="flex flex-wrap gap-4">
                                {skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-6 py-3 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 font-black text-lg rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 transform duration-200 cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {projects && projects.length > 0 && (
                        <section className="mt-20">
                            <h3 className="text-2xl uppercase tracking-[0.2em] text-rose-400 font-bold mb-12">Creations</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {projects.map((proj: any) => (
                                    <div key={proj.id} className="bg-gradient-to-br from-orange-50/50 to-rose-50/50 border border-orange-100 p-8 rounded-[2rem] hover:shadow-xl hover:shadow-rose-100 transition-all flex flex-col group">
                                        <h4 className="text-2xl font-black text-zinc-800 mb-3 group-hover:text-rose-500 transition-colors">
                                            {proj.title}
                                        </h4>
                                        <p className="text-zinc-600 mb-6 text-lg">{proj.description}</p>
                                        <div className="mb-6 flex flex-wrap gap-2 mt-auto">
                                            {proj.technologies?.map((tech: string, i: number) => (
                                                <span key={i} className="text-xs font-black text-orange-500 bg-white px-3 py-1.5 rounded-xl shadow-sm tracking-wider uppercase">{tech}</span>
                                            ))}
                                        </div>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-rose-500 font-black hover:text-rose-600 flex items-center gap-2 text-sm uppercase tracking-widest mt-auto">
                                                View Project <ArrowLeft className="w-4 h-4 rotate-135" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="mt-20 p-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[3rem] text-white shadow-xl shadow-orange-500/20">
                        <div className="max-w-2xl mx-auto text-center mb-10">
                            <h3 className="text-4xl font-black mb-4">Let's Create Together</h3>
                            <p className="text-rose-100 text-lg font-medium">Have a project in mind? Send me a message below.</p>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-6 max-w-2xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <input name="name" required placeholder="Name" className="p-4 rounded-2xl bg-white/20 border border-white/30 w-full focus:outline-none focus:bg-white/30 placeholder:text-rose-100 font-medium" />
                                <input name="email" type="email" required placeholder="Email" className="p-4 rounded-2xl bg-white/20 border border-white/30 w-full focus:outline-none focus:bg-white/30 placeholder:text-rose-100 font-medium" />
                            </div>
                            <textarea name="message" required placeholder="Tell me about your project..." rows={4} className="p-4 rounded-2xl bg-white/20 border border-white/30 w-full focus:outline-none focus:bg-white/30 placeholder:text-rose-100 font-medium resize-none" />
                            <div className="flex justify-center">
                                <button type="submit" disabled={isSending} className="px-10 py-4 bg-white text-rose-500 hover:text-orange-500 font-black rounded-2xl flex items-center gap-3 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
                                    {isSending ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
                                </button>
                            </div>
                            {messageStatus && <p className="text-center font-bold text-white bg-white/20 p-3 rounded-xl mt-4">{messageStatus}</p>}
                        </form>
                    </section>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-zinc-950">
            {templateId === "modern" && <ModernTemplate />}
            {templateId === "cyber" && <CyberTemplate />}
            {templateId === "creative" && <CreativeTemplate />}
            {!['modern', 'cyber', 'creative'].includes(templateId) && <ModernTemplate />}
        </div>
    )
}
