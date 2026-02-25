"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface Comment {
    _id: string
    content: string
    username: string
    createdAt: string
}

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
    comments: Comment[]
    createdAt: string
}

export default function PostDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (userStr) {
            setCurrentUser(JSON.parse(userStr))
        }
        fetchPost()
    }, [id])

    const fetchPost = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum/${id}`)
            if (res.ok) {
                const data = await res.json()
                setPost(data)
            } else {
                console.error("Post not found")
            }
        } catch (error) {
            console.error("Error fetching post:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!currentUser) return router.push("/auth/login")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum/${id}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ type })
            })
            if (res.ok) {
                fetchPost() // Refresh to show new vote count
            }
        } catch (error) {
            console.error("Vote failed:", error)
        }
    }

    const handleComment = async () => {
        if (!currentUser) return router.push("/auth/login")
        if (!comment.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/forum/${id}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ content: comment })
            })
            if (res.ok) {
                setComment("")
                fetchPost()
            }
        } catch (error) {
            console.error("Comment failed:", error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black text-white p-10 text-center">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <Button variant="link" onClick={() => router.back()} className="text-primary mt-4">Go Back</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white pl-0">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Forum
                </Button>

                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                                <div className="text-sm text-zinc-400 flex items-center gap-2">
                                    <span className="font-bold text-white">@{post.username}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                    <span>•</span>
                                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{post.category}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>

                        <div className="flex gap-4 border-t border-white/5 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`gap-2 ${post.upvotes.includes(currentUser?._id) ? 'bg-primary/20 text-primary border-primary/50' : 'border-white/10'}`}
                                onClick={() => handleVote('upvote')}
                            >
                                <ThumbsUp className="w-4 h-4" /> {post.upvotes.length}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`gap-2 ${post.downvotes.includes(currentUser?._id) ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'border-white/10'}`}
                                onClick={() => handleVote('downvote')}
                            >
                                <ThumbsDown className="w-4 h-4" /> {post.downvotes.length}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> Comments ({post.comments.length})
                    </h2>

                    {/* Add Comment */}
                    <div className="flex gap-4">
                        <Textarea
                            placeholder="Add to the discussion..."
                            className="bg-zinc-900 border-white/10 min-h-[80px]"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button
                            className="h-auto bg-primary text-black font-bold"
                            onClick={handleComment}
                            disabled={submitting || !comment.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                        {post.comments.map((comment: any, index: number) => (
                            <div key={index} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-sm">@{comment.username}</span>
                                    <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-zinc-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
