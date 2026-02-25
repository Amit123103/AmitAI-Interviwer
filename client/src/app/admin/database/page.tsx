"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
    Database,
    Terminal as TerminalIcon,
    Table,
    Zap,
    Search,
    Play,
    X,
    ArrowLeft,
    Shield,
    Clock,
    ChevronRight,
    ArrowDown,
    Loader2,
    RefreshCw,
    Download,
    Cpu,
    Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import MeshBackground from "@/app/dashboard/components/MeshBackground"

interface TableStat {
    name: string
    count: number
}

interface SQLRow {
    [key: string]: any
}

export default function DatabaseControl() {
    const router = useRouter()
    const [activeView, setActiveView] = useState<'overview' | 'terminal' | 'browser'>('overview')
    const [tables, setTables] = useState<TableStat[]>([])
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [tableData, setTableData] = useState<{ data: SQLRow[], schema: any[] } | null>(null)
    const [query, setQuery] = useState('')
    const [queryResult, setQueryResult] = useState<{ data: SQLRow[], fields: string[], duration: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const terminalRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/database/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTables(data.tables)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleExecuteSQL = async () => {
        if (!query.trim()) return
        setActionLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/database/execute`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })
            const result = await res.json()
            if (res.ok) {
                setQueryResult(result)
            } else {
                setError(result.message)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const fetchTableData = async (tableName: string) => {
        setLoading(true)
        setSelectedTable(tableName)
        setActiveView('browser')
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/database/table/${tableName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setTableData(await res.json())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-hidden font-sans">
            <MeshBackground />

            {/* Top Command Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 h-20">
                <div className="max-w-screen-2xl mx-auto px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            onClick={() => router.push('/admin/dashboard')}
                            variant="ghost"
                            className="group gap-2 text-zinc-500 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Mission Control</span>
                        </Button>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white">Neural SQL Authority</h1>
                                <p className="text-[8px] font-mono text-emerald-500/60 uppercase">System Level: ROOT / ARCHITECT</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveView('overview')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'overview' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveView('terminal')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'terminal' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            SQL Console
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pt-20 h-screen flex">
                {/* Sidebar: Table List */}
                <aside className="w-80 border-r border-white/5 bg-zinc-950/40 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Database Schema</h3>
                            <RefreshCw
                                onClick={fetchStats}
                                className={`w-4 h-4 text-zinc-600 hover:text-emerald-400 cursor-pointer transition-colors ${loading ? 'animate-spin' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            {tables.map(table => (
                                <button
                                    key={table.name}
                                    onClick={() => fetchTableData(table.name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${selectedTable === table.name
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                        : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Table className={`w-4 h-4 ${selectedTable === table.name ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                                        <span className="text-[11px] font-bold tracking-wider uppercase">{table.name}</span>
                                    </div>
                                    <span className="text-[9px] font-mono opacity-40">{table.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Action Area */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {activeView === 'terminal' ? (
                            <motion.div
                                key="terminal"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex-1 p-8 flex flex-col gap-6"
                            >
                                <div className="glass-card-v2 p-6 flex-1 flex flex-col gap-4 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TerminalIcon className="w-5 h-5 text-emerald-400" />
                                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Direct Directive Execution</h2>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
                                            <Button
                                                onClick={handleExecuteSQL}
                                                disabled={actionLoading || !query}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest px-6 h-9 rounded-xl"
                                            >
                                                <Play className="w-3.5 h-3.5 mr-2" /> Run Query
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 p-4 font-mono text-sm relative group">
                                        <textarea
                                            ref={terminalRef}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="-- ENTER SQL DIRECTIVE HERE --&#10;SELECT * FROM users WHERE role = 'ADMIN';"
                                            className="w-full h-full bg-transparent border-none outline-none text-emerald-500 resize-none custom-scrollbar placeholder:text-zinc-800"
                                            spellCheck={false}
                                        />
                                        <div className="absolute top-4 right-4 text-[10px] text-zinc-800 font-black uppercase tracking-widest pointer-events-none group-focus-within:opacity-0 transition-opacity">
                                            Input Buffer :: Ready
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                                            <p className="font-black uppercase mb-1 flex items-center gap-2"><Lock className="w-3 h-3" /> Syntax Error / Access Denied</p>
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Results Grid */}
                                <div className="glass-card-v2 p-6 h-1/2 flex flex-col gap-4 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Execution Output</h3>
                                        {queryResult && (
                                            <p className="text-[9px] font-mono text-zinc-600 uppercase">
                                                Processed {queryResult.data.length} rows in {queryResult.duration}ms
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-2xl">
                                        {queryResult ? (
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                                                    <tr>
                                                        {queryResult.fields.map(field => (
                                                            <th key={field} className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-emerald-400 border-b border-white/5">{field}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queryResult.data.map((row, i) => (
                                                        <tr key={i} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                                                            {queryResult.fields.map(field => (
                                                                <td key={field} className="px-4 py-3 text-[10px] font-mono text-zinc-300 whitespace-nowrap">
                                                                    {typeof row[field] === 'object' ? JSON.stringify(row[field]) : String(row[field])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                                                <Cpu className="w-12 h-12 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Instruction</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="browser"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 p-8 flex flex-col"
                            >
                                {activeView === 'browser' && tableData ? (
                                    <div className="glass-card-v2 p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                                    <Table className="w-5 h-5 text-violet-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black uppercase tracking-tight text-white">{selectedTable}</h2>
                                                    <p className="text-[9px] font-mono text-zinc-500 uppercase">Schema: public.{selectedTable}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button variant="outline" className="h-9 rounded-xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-2xl relative">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-zinc-900 sticky top-0 z-10 backdrop-blur-md">
                                                    <tr>
                                                        {tableData.schema.map(col => (
                                                            <th key={col.column_name} className="px-6 py-4 border-b border-white/5">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{col.column_name}</span>
                                                                    <span className="text-[8px] font-mono text-zinc-600">{col.data_type}</span>
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.data.map((row, i) => (
                                                        <tr key={i} className="hover:bg-white/[0.02] border-b border-white/5 transition-colors">
                                                            {tableData.schema.map(col => (
                                                                <td key={col.column_name} className="px-6 py-4 text-[11px] font-mono text-zinc-400">
                                                                    {typeof row[col.column_name] === 'object' ? JSON.stringify(row[col.column_name]) : String(row[col.column_name])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-zinc-950/20 rounded-[48px] border border-white/5 border-dashed">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                                            <Database className="w-24 h-24 text-emerald-400 relative z-10" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Inventory Explorer</h3>
                                            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                                Select a data fragment from the primary authority index to initiate scanning.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </main>
    )
}
