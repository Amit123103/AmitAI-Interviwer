"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { HelpCircle, Send, Bug, BookOpen, Loader2, MessageCircle } from "lucide-react"

export default function HelpPanel({ user }: { user: any }) {
    const [message, setMessage] = useState("")
    const [subject, setSubject] = useState("")
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!message || !subject) {
            toast.error("Please fill in all fields")
            return
        }
        setSending(true)
        setTimeout(() => {
            setSending(false)
            toast.success("Support ticket created! We'll be in touch.")
            setMessage("")
            setSubject("")
        }, 1500)
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-950/80 border-white/[0.06] hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-500 cursor-pointer backdrop-blur-2xl group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-violet-500/10 rounded-full text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold group-hover:text-violet-400 transition-colors">User Guide</h3>
                            <p className="text-xs text-zinc-500">Learn how to ace your interview.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/80 border-white/[0.06] hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.08)] transition-all duration-500 cursor-pointer backdrop-blur-2xl group">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-400 group-hover:bg-red-500/20 transition-colors">
                            <Bug className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold group-hover:text-red-400 transition-colors">Report a Bug</h3>
                            <p className="text-xs text-zinc-500">Found an issue? Let us know.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/15 transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-cyan-400" />
                        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Frequently Asked Questions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/[0.06]">
                            <AccordionTrigger className="hover:text-violet-400 transition-colors">How does the AI grading work?</AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Our AI analyzes your implementation for correctness, efficiency, and code style. It also evaluates your communication skills based on transcript sentiment and clarity.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/[0.06]">
                            <AccordionTrigger className="hover:text-violet-400 transition-colors">Can I retry an interview?</AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Yes! You can retry as many times as you like. We recommend trying different scenarios (e.g., "Strict" vs "Friendly") to broaden your experience.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/[0.06]">
                            <AccordionTrigger className="hover:text-violet-400 transition-colors">How secure is my data?</AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Extremely secure. We use industry-standard encryption for all data storage and transmission. You can delete your account and all data at any time from the Privacy tab.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-white/[0.06]">
                            <AccordionTrigger className="hover:text-violet-400 transition-colors">What languages are supported?</AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Currently we support English (US/UK) and Hindi (Beta). We are actively working on adding Spanish and French support.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/15 transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-violet-400" />
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Contact Support</span>
                    </CardTitle>
                    <CardDescription>Can't find what you're looking for?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Subject</label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Billing Issue"
                            className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Message</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your issue in detail..."
                            className="bg-zinc-900/50 border-white/[0.06] min-h-[100px] focus:border-violet-500/40 focus:ring-violet-500/20"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSend} disabled={sending} className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-bold shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all duration-300 border-0">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Send Message
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
