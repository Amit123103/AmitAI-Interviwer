"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, ThumbsUp, ThumbsDown, Eye, Filter, Plus, Search, Tag, Loader2 } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface Post {
    _id: string
    title: string
    content: string
    username: string
    category: string
    tags: string[]
    views: number
    upvotes: string[]
    downvotes: string[]
    comments: any[]
    createdAt: string
}

export default function CommunityPage() {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState("All")
    const [sort, setSort] = useState("new")
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Create Post State
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")
    const [newCategory, setNewCategory] = useState("General")
    const [newTags, setNewTags] = useState("")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchPosts()
    }, [category, sort])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                category: category === "All" ? "" : category,
                sort,
                limit: "20"
            })
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum?${query}`)
            const data = await res.json()
            setPosts(data.posts || [])
        } catch (error) {
            console.error("Failed to fetch posts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePost = async () => {
        setCreating(true)
        try {
            const userStr = localStorage.getItem("user")
            if (!userStr) {
                router.push("/auth/login")
                return
            }
            const user = JSON.parse(userStr)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category: newCategory,
                    tags: newTags.split(",").map(t => t.trim()).filter(t => t)
                })
            })

            if (res.ok) {
                setIsCreateOpen(false)
                setNewTitle("")
                setNewContent("")
                setNewTags("")
                fetchPosts() // Refresh feed
            }
        } catch (error) {
            console.error("Failed to create post:", error)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Community Forum</h1>
                        <p className="text-zinc-400 mt-2">Discuss interviews, share success stories, and get career advice.</p>
                    </div>
                    <div className="flex gap-4">
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Post
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Start a Discussion</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Title</label>
                                        <Input
                                            placeholder="e.g., Google L4 System Design Experience"
                                            className="bg-black/50 border-white/10"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Category</label>
                                        <Select value={newCategory} onValueChange={setNewCategory}>
                                            <SelectTrigger className="bg-black/50 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="System Design">System Design</SelectItem>
                                                <SelectItem value="Algorithms">Algorithms</SelectItem>
                                                <SelectItem value="Success Stories">Success Stories</SelectItem>
                                                <SelectItem value="Career Advice">Career Advice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Content</label>
                                        <Textarea
                                            placeholder="Share your experience or ask a question..."
                                            className="bg-black/50 border-white/10 min-h-[200px]"
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Tags (comma separated)</label>
                                        <Input
                                            placeholder="e.g., google, system-design, offer"
                                            className="bg-black/50 border-white/10"
                                            value={newTags}
                                            onChange={(e) => setNewTags(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-primary text-black font-bold hover:bg-primary/90 mt-4"
                                        onClick={handleCreatePost}
                                        disabled={creating || !newTitle || !newContent}
                                    >
                                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Discussion"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-bold text-zinc-400">Filters:</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {["All", "General", "System Design", "Algorithms", "Success Stories", "Career Advice"].map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCategory(cat)}
                                className={`rounded-full ${category === cat ? 'bg-white text-black' : 'border-white/10 text-zinc-400 hover:text-white'}`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="w-[140px] bg-black/50 border-white/10 text-xs">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="new">Newest First</SelectItem>
                                <SelectItem value="top">Most Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Feed */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-20 text-zinc-500 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            Loading discussions...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-white/5">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            No posts found. Be the first to start a discussion!
                        </div>
                    ) : (
                        posts.map((post) => (
                            <Link href={`/community/${post._id}`} key={post._id}>
                                <Card className="bg-zinc-900/50 border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                                                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-white">{post.category}</span>
                                                    <span>•</span>
                                                    <span className="font-bold text-zinc-300">@{post.username}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-zinc-400 line-clamp-2 text-sm">{post.content}</p>
                                        {post.tags.length > 0 && (
                                            <div className="flex gap-2 mt-4">
                                                {post.tags.slice(0, 5).map(tag => (
                                                    <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                                                        <Tag className="w-3 h-3" /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t border-white/5 pt-4 text-zinc-500 text-sm flex gap-6">
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="w-4 h-4" />
                                            {post.upvotes.length}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {post.comments.length}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            {post.views}
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
