
"use client"

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { Clock, Database, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Submission {
    _id: string;
    problemId: {
        title: string;
        slug: string;
        difficulty: string;
    };
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Pending';
    language: string;
    runtime: number;
    memory: number;
    createdAt: string;
}

export default function SubmissionHistory({ userId }: { userId: string }) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // We reuse the 'recent' endpoint or create a new full history one. 
                // For now, let's use the stats endpoint's recent data or 
                // ideally we should have a dedicated /api/coding/user/:id/submissions endpoint.
                // Since we haven't created that yet, I'll rely on the stats endpoint's 'recent' 
                // field which gives top 5, but for a full history we'd need more.
                // Let's stick to the Top 5 for now as per the 'Recent Activity' request, 
                // but let's make it look like a history list.

                // Converting this to use the `recent` field from stats for MVP efficiency
                // to avoid creating another endpoint immediately unless requested.
                const res = await axios.get(`${API_URL}/api/coding/user/${userId}/stats`);
                setSubmissions(res.data.recent);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchHistory();
    }, [userId]);

    if (loading) return <div className="p-4 text-center text-zinc-500">Loading history...</div>;

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 w-full mt-6">
            <h3 className="text-zinc-400 font-bold mb-4">Submission History</h3>
            <div className="space-y-4">
                {submissions.length > 0 ? (
                    submissions.map((sub) => (
                        <div key={sub._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-zinc-950/50 hover:bg-zinc-950 transition-colors gap-3">
                            <div>
                                <div className="font-medium text-white text-sm sm:text-base">{sub.problemId?.title || 'Unknown Problem'}</div>
                                <div className="text-xs text-zinc-500 flex gap-2 items-center mt-1">
                                    <span>{format(new Date(sub.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                    <span>•</span>
                                    <span className={`${sub.problemId?.difficulty === 'Easy' ? 'text-emerald-500' :
                                            sub.problemId?.difficulty === 'Medium' ? 'text-amber-500' :
                                                'text-rose-500'
                                        }`}>{sub.problemId?.difficulty}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={`border-0 ${sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {sub.status === 'Accepted' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                    {sub.status}
                                </Badge>

                                <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1" title="Runtime">
                                        <Clock className="w-3 h-3" />
                                        {sub.runtime}ms
                                    </div>
                                    <div className="flex items-center gap-1" title="Memory">
                                        <Database className="w-3 h-3" />
                                        {(sub.memory / 1024).toFixed(1)}MB
                                    </div>
                                    <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                                        {sub.language}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-zinc-500 italic">No submissions yet. Start coding!</div>
                )}
            </div>
            {/* Pagination could go here */}
        </Card>
    );
}
