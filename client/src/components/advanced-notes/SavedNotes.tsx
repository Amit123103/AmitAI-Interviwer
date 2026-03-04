"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, FileText, Trash2, Download, MoreVertical, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SavedNotesProps {
    onOpenNote: (id: string) => void;
    onNewNote: () => void;
}

export default function SavedNotes({ onOpenNote, onNewNote }: SavedNotesProps) {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            const res = await fetch(`${apiUrl}/api/notes/user/${user._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();

            if (data.success) {
                setNotes(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/notes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                toast.success('Note deleted');
                setNotes(notes.filter(n => n._id !== id));
            }
        } catch (err) {
            toast.error('Failed to delete note');
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Saved Notes</h2>
                        <p className="text-zinc-400">Access and manage your handwritten notes.</p>
                    </div>

                    <Button
                        onClick={onNewNote}
                        className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-semibold gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Note
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-zinc-900/50 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
                        <FileText className="w-12 h-12 text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-300">No notes yet</h3>
                        <p className="text-zinc-500 text-sm mt-1 mb-6">Start writing to see your notes here.</p>
                        <Button variant="outline" onClick={onNewNote} className="border-zinc-700 bg-transparent hover:bg-white/5 hover:text-white">
                            New Note
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {notes.map(note => (
                            <Card
                                key={note._id}
                                onClick={() => onOpenNote(note._id)}
                                className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-rose-500/30 hover:bg-zinc-900/60 transition-all duration-300 cursor-pointer h-64 flex flex-col hover-shine"
                            >
                                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-rose-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-300 group-hover:bg-rose-500/20 group-hover:text-rose-400 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleDelete(e, note._id)}
                                                className="p-1.5 rounded-md hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2">{note.title}</h3>
                                    <p className="text-sm text-zinc-500 line-clamp-2 flex-1">{note.previewText || 'No preview available'}</p>

                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 text-[11px] text-zinc-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{format(new Date(note.updatedAt), 'MMM d, yyyy • h:mm a')}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
