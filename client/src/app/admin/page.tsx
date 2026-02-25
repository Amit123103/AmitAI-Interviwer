"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, FileText, Ban, CheckCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchAdminData()
    }, [])

    const fetchAdminData = async () => {
        setLoading(true)
        try {
            const userStr = localStorage.getItem("user")
            if (!userStr) {
                router.push("/auth/login")
                return
            }
            const user = JSON.parse(userStr)
            if (user.role !== 'admin') {
                router.push("/dashboard")
                return
            }

            const headers = { "Authorization": `Bearer ${user.token}` }

            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/stats`, { headers })
            const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/users`, { headers })

            if (statsRes.ok && usersRes.ok) {
                setStats(await statsRes.json())
                setUsers(await usersRes.json())
            } else {
                console.error("Failed to fetch admin data")
            }
        } catch (error) {
            console.error("Admin fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 sm:mb-8">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
                    <Card className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                            <Users className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                            <p className="text-xs text-zinc-500">Platform wide</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
                            <DollarSign className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats?.totalRevenue}</div>
                            <p className="text-xs text-zinc-500">{stats?.proUsers} Pro Subscribers</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Interviews</CardTitle>
                            <Activity className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalInterviews}</div>
                            <p className="text-xs text-zinc-500">Completed Sessions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Forum Posts</CardTitle>
                            <FileText className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalPosts}</div>
                            <p className="text-xs text-zinc-500">Community Discussions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>User Management</CardTitle>
                            <div className="flex w-full max-w-sm items-center space-x-2">
                                <Input
                                    placeholder="Search users..."
                                    className="bg-black/50 border-white/10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-zinc-400">User</TableHead>
                                    <TableHead className="text-zinc-400">Email</TableHead>
                                    <TableHead className="text-zinc-400">Role</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user._id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${user.subscriptionStatus === 'pro' ? 'bg-primary/20 text-primary' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                                {user.subscriptionStatus}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Ban className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
