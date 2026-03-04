import React from "react"
import { CVData } from "./ModernTemplate"

export default function MinimalTemplate({ data }: { data: CVData }) {
    return (
        <div className="bg-zinc-50 text-zinc-800 w-full h-full min-h-[1056px] p-16 font-sans" style={{ aspectRatio: '210/297' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header Info */}
                <header className="mb-12">
                    <h1 className="text-4xl font-light text-zinc-900 tracking-tight mb-2">
                        {data.personal.firstName} <span className="font-semibold">{data.personal.lastName}</span>
                    </h1>
                    {data.personal.title && (
                        <div className="text-lg text-emerald-600 font-medium mb-4">
                            {data.personal.title}
                        </div>
                    )}

                    <div className="flex flex-wrap text-xs text-zinc-500 gap-4 mt-4">
                        {data.personal.email && <span className="hover:text-emerald-600 transition-colors">{data.personal.email}</span>}
                        {data.personal.phone && <span>{data.personal.phone}</span>}
                        {data.personal.location && <span>{data.personal.location}</span>}
                        {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
                        {data.personal.website && <span>{data.personal.website}</span>}
                    </div>
                </header>

                {/* Summary */}
                {data.personal.summary && (
                    <section className="mb-12">
                        <p className="text-sm leading-relaxed text-zinc-600 font-light max-w-2xl">
                            {data.personal.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-4">
                            Experience
                            <div className="h-px bg-zinc-200 flex-1" />
                        </h2>
                        <div className="space-y-8">
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3 text-xs text-zinc-400 mt-1">
                                        {exp.startDate} -<br />
                                        {exp.current ? 'Present' : exp.endDate}
                                    </div>
                                    <div className="col-span-9">
                                        <h3 className="text-sm font-semibold text-zinc-900">{exp.role}</h3>
                                        <div className="text-emerald-600 text-sm mb-3">{exp.company}</div>
                                        {exp.description && (
                                            <div
                                                className="text-sm text-zinc-600 font-light leading-relaxed space-y-2"
                                                dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-4">
                            Education
                            <div className="h-px bg-zinc-200 flex-1" />
                        </h2>
                        <div className="space-y-6">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3 text-xs text-zinc-400 mt-1">
                                        {edu.year}
                                    </div>
                                    <div className="col-span-9">
                                        <h3 className="text-sm font-semibold text-zinc-900">{edu.degree}</h3>
                                        <div className="text-zinc-500 text-sm mt-1">{edu.institution}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-4">
                            Skills
                            <div className="h-px bg-zinc-200 flex-1" />
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700 font-light">
                            {data.skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
