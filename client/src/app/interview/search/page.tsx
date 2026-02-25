"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Search, Building, Code, Server, Briefcase, ArrowRight, Star, Globe, Cpu } from "lucide-react"

// Mock Template Data
const templates = [
    {
        id: "google-frontend",
        title: "Frontend Engineer",
        company: "Google",
        icon: <Globe className="w-6 h-6 text-blue-500" />,
        level: "L4 (Mid-Level)",
        skills: ["React", "Performance", "CSS", "DOM"],
        description: "Focuses on browser rendering, JS fundamentals, and UI optimization."
    },
    {
        id: "amazon-leadership",
        title: "Leadership Principles",
        company: "Amazon",
        icon: <Star className="w-6 h-6 text-yellow-500" />,
        level: "L5 (Manager)",
        skills: ["Behavioral", "Star Method", "Conflict Resolution"],
        description: "Deep dive into Amazon's 16 Leadership Principles."
    },
    {
        id: "uber-system-design",
        title: "System Design: Ride Share",
        company: "Uber",
        icon: <Cpu className="w-6 h-6 text-black dark:text-white" />,
        level: "L5 (Senior)",
        skills: ["Scalability", "Geo-hashing", "Real-time Data"],
        description: "Design a scalable ride-sharing architecture."
    },
    {
        id: "meta-fullstack",
        title: "Full Stack Developer",
        company: "Meta",
        icon: <Code className="w-6 h-6 text-blue-600" />,
        level: "E4",
        skills: ["GraphQL", "React", "Python", "Database"],
        description: "End-to-end product development focus."
    },
    {
        id: "fintech-security",
        title: "Security Engineer",
        company: "Stripe",
        icon: <Server className="w-6 h-6 text-indigo-500" />,
        level: "L3",
        skills: ["Encryption", "OWASP", "Auth flows"],
        description: "Security-first interview for payment infrastructure."
    },
    {
        id: "startup-generalist",
        title: "Founding Engineer",
        company: "Startup",
        icon: <Briefcase className="w-6 h-6 text-green-500" />,
        level: "Senior",
        skills: ["Speed", "Product Sense", "Full Stack"],
        description: "Wear many hats and build fast in a chaotic environment."
    }
]

export default function InterviewSearchPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

        if (selectedCategory === "All") return matchesSearch
        if (selectedCategory === "FAANG") return matchesSearch && ["Google", "Amazon", "Meta"].includes(t.company)
        if (selectedCategory === "Startup") return matchesSearch && t.company === "Startup"
        if (selectedCategory === "System Design") return matchesSearch && t.title.includes("System Design")

        return matchesSearch
    })

    const handleStart = (template: any) => {
        // Redirect to setup with query params to pre-fill
        const query = new URLSearchParams({
            template: template.id,
            company: template.company,
            role: template.title
        }).toString()
        router.push(`/interview/setup?${query}`)
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 sm:space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
                    >
                        Find Your Perfect Interview
                    </motion.h1>
                    <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Browse our curated library of interview templates tailored for top companies and specific roles.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between sticky top-4 z-10 bg-black/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-zinc-800">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                            placeholder="Search by role, company, or skill..."
                            className="pl-9 sm:pl-10 bg-zinc-900 border-zinc-700 h-11 sm:h-12 text-sm sm:text-base"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {["All", "FAANG", "Startup", "System Design"].map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-full h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm whitespace-nowrap ${selectedCategory === cat ? "bg-primary text-black" : "border-zinc-700 text-zinc-400"
                                    }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-primary/50 transition-all hover:bg-zinc-900 group cursor-pointer h-full flex flex-col" onClick={() => handleStart(t)}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        {t.icon}
                                    </div>
                                    <div className="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-400 font-mono">
                                        {t.level}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div>
                                        <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">{t.title}</CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-zinc-500">
                                            <Building className="w-3 h-3" /> {t.company}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 line-clamp-2">
                                        {t.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {t.skills.map(s => (
                                            <span key={s} className="px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-300 border border-white/5">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-black transition-colors">
                                        Start Interview <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16 sm:py-20 text-zinc-500">
                        <p className="text-base sm:text-lg">No templates found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
