"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Loader2, ArrowLeft, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import { motion, AnimatePresence } from "framer-motion"

interface ProPayment {
    _id: string
    userId: { _id: string; username: string; email: string } | null
    email: string
    selectedPlan: string
    amount: number
    transactionId: string
    screenshotPath: string
    paymentDate: string
    status: 'pending' | 'approved' | 'rejected'
    adminNote?: string
    createdAt: string
    reviewedAt?: string
}

const PLAN_NAMES: Record<string, string> = {
    monthly: 'Monthly (₹150)',
    '6month': '6-Month (₹850)',
    yearly: 'Yearly (₹1700)',
}

const STATUS_CONFIG = {
    pending: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pending' },
    approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Rejected' },
}

export default function AdminProPayments() {
    const router = useRouter()
    const [payments, setPayments] = useState<ProPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('pending')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [viewScreenshot, setViewScreenshot] = useState<string | null>(null)
    const [rejectNote, setRejectNote] = useState('')
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            if (!token) { router.push("/auth/login"); return }

            const params = new URLSearchParams({ page: String(page), limit: '15' })
            if (filter) params.append('status', filter)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/pro/admin/all?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.status === 401) { router.push("/auth/login"); return }
            if (!res.ok) throw new Error('Failed to fetch')

            const data = await res.json()
            setPayments(data.payments || [])
            setTotalPages(data.totalPages || 1)
            setTotal(data.total || 0)
        } catch (err) {
            console.error('Failed to fetch payments:', err)
            setMessage({ type: 'error', text: 'Failed to load payments' })
        } finally {
            setLoading(false)
        }
    }, [filter, page, router])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this payment and activate Pro access?')) return
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/pro/admin/approve/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setMessage({ type: 'success', text: `✅ ${data.message}` })
            fetchPayments()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string) => {
        setActionLoading(id)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/pro/admin/reject/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote: rejectNote || 'Payment could not be verified.' }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setMessage({ type: 'success', text: `Payment rejected.` })
            setRejectingId(null)
            setRejectNote('')
            fetchPayments()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }

    const getScreenshotUrl = (path: string) => {
        const normalized = path.replace(/\\/g, '/')
        const uploadsIndex = normalized.indexOf('uploads/')
        if (uploadsIndex !== -1) {
            return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/${normalized.substring(uploadsIndex)}`
        }
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/${normalized}`
    }

    return (
        <div className="min-h-screen bg-transparent text-white py-8 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />
            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Pro Payments</h1>
                            <p className="text-sm text-zinc-500">{total} total submissions</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-zinc-900/60 border border-white/10 rounded-xl p-1">
                        {[
                            { value: 'pending', label: 'Pending', color: 'text-amber-400' },
                            { value: 'approved', label: 'Approved', color: 'text-emerald-400' },
                            { value: 'rejected', label: 'Rejected', color: 'text-red-400' },
                            { value: '', label: 'All', color: 'text-zinc-300' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => { setFilter(f.value); setPage(1) }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === f.value ? `bg-white/10 ${f.color}` : 'text-zinc-600 hover:text-zinc-300'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`rounded-xl p-3 flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {message.text}
                            <button onClick={() => setMessage(null)} className="ml-auto text-zinc-500 hover:text-white">×</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-bold">No {filter || ''} payments found</p>
                    </div>
                ) : (
                    /* Payment Cards */
                    <div className="space-y-4">
                        {payments.map((payment) => {
                            const statusConf = STATUS_CONFIG[payment.status]
                            const StatusIcon = statusConf.icon
                            return (
                                <motion.div
                                    key={payment._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 space-y-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl border ${statusConf.bg}`}>
                                                <StatusIcon className={`w-4 h-4 ${statusConf.color}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">
                                                    {payment.userId?.username || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-zinc-500">{payment.email}</p>
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${statusConf.bg} ${statusConf.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConf.label}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mb-1">Plan</p>
                                            <p className="font-bold text-zinc-300">{PLAN_NAMES[payment.selectedPlan] || payment.selectedPlan}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mb-1">Transaction ID</p>
                                            <p className="font-mono text-xs text-violet-400 break-all">{payment.transactionId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mb-1">Payment Date</p>
                                            <p className="font-bold text-zinc-300">{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mb-1">Submitted</p>
                                            <p className="font-bold text-zinc-300">{new Date(payment.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                                        <Button
                                            onClick={() => setViewScreenshot(getScreenshotUrl(payment.screenshotPath))}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/10 bg-white/5 hover:bg-white/10 text-xs h-8"
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Screenshot
                                        </Button>

                                        {payment.status === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handleApprove(payment._id)}
                                                    disabled={actionLoading === payment._id}
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 font-bold"
                                                >
                                                    {actionLoading === payment._id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => setRejectingId(payment._id)}
                                                    disabled={actionLoading === payment._id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 font-bold"
                                                >
                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                                                </Button>
                                            </>
                                        )}

                                        {payment.adminNote && (
                                            <span className="text-[10px] text-zinc-500 italic ml-auto">Note: {payment.adminNote}</span>
                                        )}
                                    </div>

                                    {/* Reject form */}
                                    <AnimatePresence>
                                        {rejectingId === payment._id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 pt-3 border-t border-white/5"
                                            >
                                                <textarea
                                                    value={rejectNote}
                                                    onChange={(e) => setRejectNote(e.target.value)}
                                                    placeholder="Reason for rejection (optional)..."
                                                    className="w-full bg-zinc-800/60 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/30 min-h-[80px] resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleReject(payment._id)}
                                                        disabled={actionLoading === payment._id}
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                                                    >
                                                        Confirm Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setRejectingId(null); setRejectNote('') }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-white/10 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            variant="outline"
                            size="sm"
                            className="border-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-zinc-500">
                            Page <span className="text-white font-bold">{page}</span> of {totalPages}
                        </span>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            variant="outline"
                            size="sm"
                            className="border-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Screenshot modal */}
                <AnimatePresence>
                    {viewScreenshot && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewScreenshot(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-w-2xl max-h-[80vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Payment Screenshot</span>
                                    <button onClick={() => setViewScreenshot(null)} className="text-zinc-500 hover:text-white text-lg">×</button>
                                </div>
                                <div className="p-4">
                                    <img src={viewScreenshot} alt="Payment screenshot" className="max-w-full max-h-[60vh] mx-auto rounded-lg" />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
