"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Search, Filter, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface Post {
    _id: string
    title: string
    content: string
    username: string
    category: string
    upvotes: string[]
    downvotes: string[]
    views: number
    createdAt: string
    comments: any[]
}

export default function ForumPage() {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState("All")
    const [page, setPage] = useState(1)

    // New Post State
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")
    const [newCategory, setNewCategory] = useState("General")

    useEffect(() => {
        fetchPosts()
    }, [category, page])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum?category=${category}&page=${page}`)
            const data = await res.json()
            if (data.posts) {
                setPosts(data.posts)
            }
        } catch (err) {
            console.error("Failed to fetch posts", err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePost = async () => {
        if (!newTitle || !newContent) return

        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth/login")
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category: newCategory
                })
            })

            if (res.ok) {
                setIsCreating(false)
                setNewTitle("")
                setNewContent("")
                fetchPosts()
            }
        } catch (err) {
            console.error("Failed to create post", err)
        }
    }

    const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth/login")
            return
        }

        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                // This is a naive optimistic update, real logic is complex with arrays. 
                // Let's just fetch for now or rely on server response.
                return p
            }
            return p
        }))

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum/${postId}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ type })
            })
            if (res.ok) {
                const updatedPost = await res.json()
                setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p))
            }
        } catch (err) {
            console.error("Vote failed", err)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="h-10 w-10"><ArrowLeft /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-primary w-6 h-6 sm:w-7 sm:h-7" /> Community Forum
                            </h1>
                            <p className="text-zinc-500 text-xs sm:text-sm">Discuss strategies, system design, and share success.</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsCreating(!isCreating)} className="gap-2 bg-primary text-black hover:bg-primary/90 h-11 sm:h-12 w-full md:w-auto">
                        {isCreating ? "Cancel" : <><Plus size={16} /> New Post</>}
                    </Button>
                </div>

                {/* Create Post Form */}
                {isCreating && (
                    <Card className="bg-zinc-900 border-zinc-800 animate-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle>Create a New Discussion</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Title"
                                className="bg-black border-zinc-800"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <select
                                className="w-full h-10 px-3 py-2 bg-black border border-zinc-800 rounded-md text-sm focus:ring-1 focus:ring-primary text-white"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            >
                                <option value="General">General</option>
                                <option value="System Design">System Design</option>
                                <option value="Algorithms">Algorithms</option>
                                <option value="Success Stories">Success Stories</option>
                                <option value="Career Advice">Career Advice</option>
                            </select>
                            <Textarea
                                placeholder="What's on your mind?"
                                className="bg-black border-zinc-800 min-h-[150px]"
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleCreatePost}>Post Discussion</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex overflow-x-auto gap-2 pb-2">
                    {["All", "General", "System Design", "Algorithms", "Success Stories", "Career Advice"].map(c => (
                        <Button
                            key={c}
                            variant={category === c ? "default" : "outline"}
                            className={`rounded-full whitespace-nowrap ${category === c ? 'bg-primary text-black' : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setCategory(c)}
                        >
                            {c}
                        </Button>
                    ))}
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary w-8 h-8" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            No posts found in this category. Be the first to post!
                        </div>
                    ) : (
                        posts.map(post => (
                            <Card key={post._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        {/* Vote Column */}
                                        <div className="flex flex-col items-center gap-1 text-zinc-500">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10" onClick={() => handleVote(post._id, 'upvote')}>
                                                <ThumbsUp size={16} className={post.upvotes.includes('me') ? "fill-primary text-primary" : ""} />
                                            </Button>
                                            <span className="font-bold text-sm">{(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleVote(post._id, 'downvote')}>
                                                <ThumbsDown size={16} />
                                            </Button>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white hover:underline cursor-pointer">{post.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-300">{post.category}</span>
                                                        <span>• Posted by {post.username}</span>
                                                        <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-zinc-500 text-xs">
                                                    <MessageSquare size={14} /> {post.comments?.length || 0}
                                                </div>
                                            </div>
                                            <p className="text-zinc-400 text-sm line-clamp-3">{post.content}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
