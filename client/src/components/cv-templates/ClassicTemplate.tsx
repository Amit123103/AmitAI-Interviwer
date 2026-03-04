import React from "react"
import { CVData } from "./ModernTemplate"

export default function ClassicTemplate({ data }: { data: CVData }) {
    return (
        <div className="bg-white text-black w-full h-full min-h-[1056px] p-12 font-serif" style={{ aspectRatio: '210/297' }}>
            {/* Document Header */}
            <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
                    {data.personal.firstName} {data.personal.lastName}
                </h1>
                {data.personal.title && (
                    <div className="text-sm font-medium italic mb-3">
                        {data.personal.title}
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>• {data.personal.phone}</span>}
                    {data.personal.location && <span>• {data.personal.location}</span>}
                    {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
                    {data.personal.website && <span>• {data.personal.website}</span>}
                </div>
            </div>

            {/* Summary */}
            {data.personal.summary && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-800">
                        {data.personal.summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">Experience</h2>
                    <div className="space-y-5">
                        {data.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-sm">{exp.role}</h3>
                                    <span className="text-xs font-medium italic">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-sm italic mb-2">{exp.company}</div>
                                {exp.description && (
                                    <div
                                        className="text-sm text-gray-800 leading-relaxed ml-4 list-disc"
                                        dangerouslySetInnerHTML={{ __html: exp.description.replace(/\n/g, '<br />') }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {data.education.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-baseline">
                                <div>
                                    <div className="font-bold text-sm">{edu.institution}</div>
                                    <div className="text-sm italic">{edu.degree}</div>
                                </div>
                                <span className="text-xs font-medium">{edu.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Skills & Expertise</h2>
                    <div className="text-sm text-gray-800">
                        {data.skills.join("  •  ")}
                    </div>
                </div>
            )}
        </div>
    )
}
