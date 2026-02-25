"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const InterviewPageContent = dynamic(() => import('./content'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center h-screen bg-black text-white">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )
})

export default function InterviewPage() {
    return <InterviewPageContent />
}
