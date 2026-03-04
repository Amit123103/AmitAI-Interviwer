import React from "react"
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react"

export interface CVData {
    personal: {
        firstName: string
        lastName: string
        title: string
        email: string
        phone: string
        location: string
        linkedin: string
        website: string
        summary: string
    }
    experience: Array<{
        id: string
        company: string
        role: string
        startDate: string
        endDate: string
        current: boolean
        description: string
    }>
    education: Array<{
        id: string
        institution: string
        degree: string
        year: string
    }>
    skills: string[]
}

interface TemplateProps {
    data: CVData
}

export default function ModernTemplate({ data }: TemplateProps) {
    return (
        <div className="bg-white text-zinc-800 w-full h-full min-h-[1056px] flex font-sans" style={{ aspectRatio: '210/297' }}>
            {/* LEFT COLUMN - Sidebar */}
            <div className="w-[35%] bg-zinc-900 text-white p-8 flex flex-col gap-8">
                {/* Header Info */}
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-2 text-cyan-400">
                        {data.personal.firstName}<br />
                        <span className="text-white">{data.personal.lastName}</span>
                    </h1>
                    <div className="text-cyan-200 font-medium tracking-widest uppercase text-xs mt-4">
                        {data.personal.title || "Professional Title"}
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-3 text-xs text-zinc-300 mt-4">
                    {data.personal.email && (
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-cyan-500" />
                            <span>{data.personal.email}</span>
                        </div>
                    )}
                    {data.personal.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-cyan-500" />
                            <span>{data.personal.phone}</span>
                        </div>
                    )}
                    {data.personal.location && (
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-cyan-500" />
                            <span>{data.personal.location}</span>
                        </div>
                    )}
                    {data.personal.linkedin && (
                        <div className="flex items-center gap-3">
                            <Linkedin className="w-4 h-4 text-cyan-500" />
                            <span>{data.personal.linkedin}</span>
                        </div>
                    )}
                    {data.personal.website && (
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-cyan-500" />
                            <span>{data.personal.website}</span>
                        </div>
                    )}
                </div>

                {/* Education */}
                {data.education.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Education</h3>
                        <div className="space-y-4">
                            {data.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="font-bold text-sm text-zinc-200">{edu.degree}</div>
                                    <div className="text-xs text-zinc-400 mt-1">{edu.institution}</div>
                                    <div className="text-[10px] text-cyan-500/80 font-medium mt-1 uppercase tracking-wider">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-800 text-cyan-300 text-[10px] uppercase font-bold tracking-wider rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN - Main Content */}
            <div className="w-[65%] p-10 flex flex-col gap-8 bg-zinc-50">
                {/* Summary */}
                {data.personal.summary && (
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-4 flex items-center gap-4">
                            <span>Profile</span>
                            <div className="h-[2px] flex-1 bg-zinc-200" />
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-600 font-medium">
                            {data.personal.summary}
                        </p>
                    </div>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-6 flex items-center gap-4">
                            <span>Experience</span>
                            <div className="h-[2px] flex-1 bg-zinc-200" />
                        </h3>
                        <div className="space-y-8">
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="relative">
                                    <div className="absolute left-[-20px] top-1.5 w-2 h-2 rounded-full bg-cyan-500" />
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-zinc-800 uppercase tracking-wide text-sm">{exp.role}</h4>
                                        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded tracking-wider">
                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                        {exp.company}
                                    </div>
                                    {exp.description && (
                                        <div
                                            className="text-sm text-zinc-600 leading-relaxed prose prose-sm max-w-none prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5"
                                            dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
