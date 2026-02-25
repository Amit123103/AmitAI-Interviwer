"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { ArrowLeft, Upload, CheckCircle, Clock, Copy, CreditCard, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion, AnimatePresence } from "framer-motion"

const PLAN_INFO: Record<string, { name: string; price: number; duration: string }> = {
    monthly: { name: 'Monthly', price: 150, duration: '1 Month' },
    '6month': { name: '6-Month', price: 850, duration: '6 Months' },
    yearly: { name: 'Yearly', price: 1700, duration: '12 Months' },
}

const UPI_ID = "amitkumar1203@slc" // Replace with actual UPI ID

function PaymentPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') || 'monthly'
    const plan = PLAN_INFO[planId] || PLAN_INFO.monthly

    const [transactionId, setTransactionId] = useState('')
    const [email, setEmail] = useState('')
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [screenshot, setScreenshot] = useState<File | null>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.email) setEmail(user.email)
            } catch { }
        }
    }, [])

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be under 5MB')
                return
            }
            setScreenshot(file)
            setError('')
            const reader = new FileReader()
            reader.onloadend = () => setScreenshotPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const copyUPI = () => {
        navigator.clipboard.writeText(UPI_ID)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!transactionId.trim()) return setError('Transaction ID is required')
        if (!email.trim()) return setError('Email is required')
        if (!paymentDate) return setError('Payment date is required')
        if (!screenshot) return setError('Payment screenshot is required')

        setLoading(true)
        try {
            const userStr = localStorage.getItem("user")
            const token = localStorage.getItem("token")
            if (!userStr || !token) {
                router.push("/auth/login")
                return
            }

            const formData = new FormData()
            formData.append('transactionId', transactionId.trim())
            formData.append('selectedPlan', planId)
            formData.append('email', email.trim())
            formData.append('paymentDate', paymentDate)
            formData.append('screenshot', screenshot)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/pro/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || 'Submission failed')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 relative overflow-hidden">
                <MeshBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center space-y-6 max-w-md"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Payment Submitted!</h2>
                    <p className="text-zinc-400 leading-relaxed">
                        Your payment proof has been submitted successfully. Our team will verify your payment and activate your Pro access within <span className="text-violet-400 font-bold">24 hours</span>.
                    </p>
                    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 space-y-2 text-left">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Plan</span>
                            <span className="font-bold">{plan.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Amount</span>
                            <span className="font-bold text-emerald-400">₹{plan.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Status</span>
                            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <Clock className="w-3.5 h-3.5" /> Pending Verification
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black uppercase tracking-wider"
                    >
                        Go to Dashboard
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />
            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back to Plans</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Complete Payment</h1>
                    <p className="text-zinc-400">Pay via UPI and upload your payment screenshot</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Payment Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Plan Summary */}
                        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Plan</span>
                                    <span className="font-bold text-white">{plan.name} Pro</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Duration</span>
                                    <span className="font-bold">{plan.duration}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between">
                                    <span className="text-zinc-400 font-bold">Total</span>
                                    <span className="text-2xl font-black text-emerald-400">₹{plan.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Scan & Pay</h3>
                            <div className="bg-white rounded-2xl p-4 mx-auto w-fit">
                                <img
                                    src="/qr-code.jpg"
                                    alt="UPI Payment QR Code"
                                    className="w-48 h-48 rounded-xl object-contain"
                                />
                            </div>

                            {/* UPI ID */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Or pay to UPI ID:</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-violet-400 select-all">
                                        {UPI_ID}
                                    </div>
                                    <Button
                                        onClick={copyUPI}
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 bg-white/5 hover:bg-white/10"
                                    >
                                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 space-y-2">
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">Payment Instructions</h4>
                            <ul className="text-[13px] text-zinc-400 space-y-1.5 list-disc pl-4">
                                <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                                <li>Scan the QR code or enter the UPI ID above</li>
                                <li>Pay exactly <span className="text-emerald-400 font-bold">₹{plan.price}</span></li>
                                <li>Take a <span className="text-white font-bold">screenshot</span> of the payment confirmation</li>
                                <li>Fill in the form and upload the screenshot</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right: Upload Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Submit Payment Proof</h3>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-400">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Transaction ID */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Transaction ID / UTR Number *</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter your UPI Transaction ID"
                                    className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Registered Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                                    required
                                />
                            </div>

                            {/* Plan (read-only) */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Selected Plan</label>
                                <div className="w-full bg-zinc-800/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-400">
                                    {plan.name} — ₹{plan.price}
                                </div>
                            </div>

                            {/* Payment Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Payment Date *</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all [color-scheme:dark]"
                                    required
                                />
                            </div>

                            {/* Screenshot Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Payment Screenshot *</label>
                                <label className="block cursor-pointer">
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${screenshotPreview ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5'
                                        }`}>
                                        {screenshotPreview ? (
                                            <div className="space-y-2">
                                                <img src={screenshotPreview} alt="Screenshot preview" className="max-h-40 mx-auto rounded-lg" />
                                                <p className="text-xs text-emerald-400 font-bold">{screenshot?.name}</p>
                                                <p className="text-[10px] text-zinc-500">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="w-8 h-8 text-zinc-600 mx-auto" />
                                                <p className="text-sm text-zinc-500">Click to upload screenshot</p>
                                                <p className="text-[10px] text-zinc-600">JPEG, PNG, WebP — Max 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleScreenshotChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all hover:scale-[1.01]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                    </span>
                                ) : (
                                    'Submit Payment Proof'
                                )}
                            </Button>

                            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                                By submitting, you confirm that the payment has been made. False submissions may result in account restrictions.
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
        }>
            <PaymentPageContent />
        </Suspense>
    )
}
