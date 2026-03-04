"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getStroke } from 'perfect-freehand';
import {
    PenTool, Eraser, Highlighter, Undo2, Redo2, Save,
    X, Camera, CameraOff, ChevronLeft, ChevronRight,
    Square, LayoutGrid, Plus, Type, TypeIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Point {
    x: number;
    y: number;
    pressure?: number;
}

interface Stroke {
    id: string;
    points: Point[];
    color: string;
    size: number;
    tool: 'pen' | 'highlighter' | 'eraser';
}

interface RecognizedWord {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    originalStrokes: Stroke[];
    color: string;
    alternatives?: string[];
}

interface PageData {
    pageId: string;
    strokes: Stroke[];
    recognizedWords: RecognizedWord[];
    text?: string;
    background: 'white' | 'ruled' | 'grid' | 'dark';
}

interface WriteNotesProps {
    noteId: string | null;
    onExit: () => void;
}

const COLORS = ['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return "";
    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );
    d.push("Z");
    return d.join(" ");
}

export default function WriteNotes({ noteId, onExit }: WriteNotesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<SVGSVGElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    const [isClient, setIsClient] = useState(false);

    // Document State
    const [title, setTitle] = useState('Untitled Note');
    const [pages, setPages] = useState<PageData[]>([
        { pageId: `page-${Date.now()}`, strokes: [], recognizedWords: [], text: '', background: 'dark' }
    ]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentPage = pages[currentPageIndex] || pages[0];

    const [noteText, setNoteText] = useState(currentPage.text || '');

    useEffect(() => {
        setNoteText(currentPage.text || '');
    }, [currentPage.text]);

    // Handwriting Recognition UI State
    const [viewMode, setViewMode] = useState<'handwritten' | 'clean'>('handwritten');
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [selectedWord, setSelectedWord] = useState<RecognizedWord | null>(null);
    const [useGrammar, setUseGrammar] = useState(false);

    // Drawing State (Refs for Hand Tracking Loop)
    const strokesRef = useRef<Stroke[]>([]);
    const [strokesState, setStrokesState] = useState<Stroke[]>([]);
    const recognizedWordsRef = useRef<RecognizedWord[]>([]);
    const [recognizedWordsState, setRecognizedWordsState] = useState<RecognizedWord[]>([]);

    const currentStrokeRef = useRef<Stroke | null>(null);
    const lastStrokeTimeRef = useRef<number>(Date.now());
    const pendingWordStrokesRef = useRef<Stroke[]>([]);
    const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Force re-render just for current stroke
    const [, setTick] = useState(0);

    const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

    // Tools State
    const activeToolRef = useRef<'pen' | 'highlighter' | 'eraser'>('pen');
    const [activeTool, setActiveToolUI] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
    const colorRef = useRef('#ffffff');
    const [color, setColorUI] = useState('#ffffff');
    const sizeRef = useRef(4);
    const [size, setSizeUI] = useState(4);

    // Hand Tracking State
    const [isCameraActive, setIsCameraActive] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const trackingLoopRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef(-1);

    // Virtual Pointer for Hand Tracking
    const isPinchingRef = useRef(false);
    const lastToolChangeRef = useRef<number>(0);

    // Sync Refs with State for UI
    const setActiveTool = (t: 'pen' | 'highlighter' | 'eraser') => { activeToolRef.current = t; setActiveToolUI(t); };
    const setColor = (c: string) => { colorRef.current = c; setColorUI(c); };
    const setSize = (s: number) => { sizeRef.current = s; setSizeUI(s); };

    useEffect(() => {
        setIsClient(true);
        if (noteId) {
            fetchNoteDetails(noteId);
        } else {
            strokesRef.current = [];
            setStrokesState([]);
        }

        return () => {
            if (trackingLoopRef.current) clearInterval(trackingLoopRef.current);
            if (wsRef.current) wsRef.current.close();
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [noteId]);

    const fetchNoteDetails = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/notes/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setTitle(data.data.title);
                if (data.data.pages && data.data.pages.length > 0) {
                    setPages(data.data.pages);
                    strokesRef.current = data.data.pages[0].strokes || [];
                    recognizedWordsRef.current = data.data.pages[0].recognizedWords || [];
                    setStrokesState(strokesRef.current);
                    setRecognizedWordsState(recognizedWordsRef.current);
                    setNoteText(data.data.pages[0].text || '');
                }
            }
        } catch (err) {
            toast.error('Failed to load note');
        }
    };

    const saveNote = async () => {
        try {
            const updatedPages = [...pages];
            updatedPages[currentPageIndex].strokes = strokesRef.current;
            updatedPages[currentPageIndex].recognizedWords = recognizedWordsRef.current;
            setPages(updatedPages);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const method = noteId ? 'PUT' : 'POST';
            const url = noteId ? `${apiUrl}/api/notes/${noteId}` : `${apiUrl}/api/notes`;

            const payload = { title, pages: updatedPages };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Note saved successfully');
            }
        } catch (err) {
            toast.error('Failed to save note');
        }
    };

    // --- Core Drawing Logic ---
    const startStroke = (x: number, y: number, pressure: number = 0.5) => {
        setUndoStack(prev => [...prev, [...strokesRef.current]]);
        setRedoStack([]);

        const tool = activeToolRef.current;
        const color = colorRef.current;
        const size = sizeRef.current;

        currentStrokeRef.current = {
            id: `stroke-${Date.now()}`,
            points: [{ x, y, pressure }],
            color: tool === 'highlighter' ? color + '80' : color,
            size: tool === 'highlighter' ? size * 3 : size,
            tool
        };
        setTick(t => t + 1);
    };

    const continueStroke = (x: number, y: number, pressure: number = 0.5) => {
        if (activeToolRef.current === 'eraser') {
            eraseAtPoint({ x, y });
        } else if (currentStrokeRef.current) {
            currentStrokeRef.current.points.push({ x, y, pressure });
            setTick(t => t + 1);
        }
    };

    const endStroke = () => {
        if (currentStrokeRef.current && activeToolRef.current !== 'eraser') {
            strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
            setStrokesState(strokesRef.current);

            // Handwriting Recognition Logic (Only for Pen tool)
            if (activeToolRef.current === 'pen') {
                pendingWordStrokesRef.current.push(currentStrokeRef.current);
                lastStrokeTimeRef.current = Date.now();

                // Set timeout to process the grouped strokes as a word
                if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
                recognitionTimeoutRef.current = setTimeout(() => {
                    processPendingWord();
                }, 1200); // 1.2 second pause means word is complete
            }

            currentStrokeRef.current = null;
        }
    };

    const processPendingWord = async () => {
        const strokes = [...pendingWordStrokesRef.current];
        pendingWordStrokesRef.current = []; // clear queue
        if (strokes.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        strokes.forEach(s => {
            s.points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            });
        });

        const padding = 20;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;

        if (width <= padding * 2 || height <= padding * 2) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        strokes.forEach(stroke => {
            if (stroke.points.length === 0) return;
            const pts = getStroke(stroke.points.map(p => [p.x - minX + padding, p.y - minY + padding, p.pressure || 0.5]), {
                size: stroke.size, thinning: 0.5, smoothing: 0.5, streamline: 0.5
            });
            const pathData = getSvgPathFromStroke(pts);
            const path = new Path2D(pathData);
            ctx.fillStyle = '#000000';
            ctx.fill(path);
        });

        const imageDataUrl = tempCanvas.toDataURL('image/png');

        setIsRecognizing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/notes/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    image: imageDataUrl,
                    useGrammarCorrection: useGrammar
                })
            });

            const data = await res.json();
            if (data.success && data.data.text && data.data.text.trim() !== '') {
                setNoteText(prev => {
                    const newText = prev + (prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '') + data.data.text;
                    setPages(prevPages => {
                        const updatedPages = [...prevPages];
                        updatedPages[currentPageIndex].text = newText;
                        return updatedPages;
                    });
                    return newText;
                });

                const strokeIdsToRemove = new Set(strokes.map(s => s.id));
                strokesRef.current = strokesRef.current.filter(s => !strokeIdsToRemove.has(s.id));
                setStrokesState(strokesRef.current);
            }
        } catch (err) {
            console.error('Word recognition failed', err);
        } finally {
            setIsRecognizing(false);
        }
    };

    const getCursorPoint = (evtX: number, evtY: number) => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: evtX - rect.left,
            y: evtY - rect.top
        };
    };

    const eraseAtPoint = (pt: { x: number, y: number }) => {
        const ERASER_RADIUS = 25;
        const keepStrokes = strokesRef.current.filter(stroke => {
            return !stroke.points.some(p =>
                Math.hypot(p.x - pt.x, p.y - pt.y) < ERASER_RADIUS
            );
        });

        if (keepStrokes.length !== strokesRef.current.length) {
            strokesRef.current = keepStrokes;
            setStrokesState(keepStrokes);
        }
    };

    const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const pt = getCursorPoint(e.clientX, e.clientY);
        if (pt) startStroke(pt.x, pt.y, e.pressure);
    };

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const pt = getCursorPoint(e.clientX, e.clientY);
        if (pt) continueStroke(pt.x, pt.y, e.pressure);
    };

    const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        endStroke();
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const previousState = undoStack[undoStack.length - 1];
        setRedoStack([...redoStack, [...strokesRef.current]]);
        strokesRef.current = previousState;
        setStrokesState(previousState);
        setUndoStack(undoStack.slice(0, -1));
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        setUndoStack([...undoStack, [...strokesRef.current]]);
        strokesRef.current = nextState;
        setStrokesState(nextState);
        setRedoStack(redoStack.slice(0, -1));
    };

    const handlePageChange = (direction: 'next' | 'prev') => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].strokes = strokesRef.current;
        updatedPages[currentPageIndex].text = noteText;

        if (direction === 'next') {
            if (currentPageIndex === pages.length - 1) {
                const newPage: PageData = {
                    pageId: `page-${Date.now()}`,
                    strokes: [],
                    recognizedWords: [],
                    text: '',
                    background: currentPage.background
                };
                updatedPages.push(newPage);
                setPages(updatedPages);
                setCurrentPageIndex(updatedPages.length - 1);
                strokesRef.current = [];
                recognizedWordsRef.current = [];
            } else {
                setPages(updatedPages);
                setCurrentPageIndex(currentPageIndex + 1);
                strokesRef.current = updatedPages[currentPageIndex + 1].strokes;
                recognizedWordsRef.current = updatedPages[currentPageIndex + 1].recognizedWords || [];
                setNoteText(updatedPages[currentPageIndex + 1].text || '');
            }
        } else {
            if (currentPageIndex > 0) {
                setPages(updatedPages);
                setCurrentPageIndex(currentPageIndex - 1);
                strokesRef.current = updatedPages[currentPageIndex - 1].strokes;
                recognizedWordsRef.current = updatedPages[currentPageIndex - 1].recognizedWords || [];
                setNoteText(updatedPages[currentPageIndex - 1].text || '');
            }
        }
        setStrokesState(strokesRef.current);
        setRecognizedWordsState(recognizedWordsRef.current);
        setUndoStack([]);
        setRedoStack([]);
    };

    const setBackground = (bg: 'white' | 'ruled' | 'grid' | 'dark') => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].background = bg;
        setPages(updatedPages);
    };

    // --- Hand Tracking Init ---
    const initHandTracking = () => {
        try {
            toast.loading('Connecting to AI Core...', { id: 'hand-tracker' });

            const wsUrl = process.env.NEXT_PUBLIC_AI_WS_URL || 'ws://127.0.0.1:8000/ws/gesture-track';
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                toast.success('Hand Tracking Activated!', { id: 'hand-tracker' });
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleGestureAction(data);
            };

            ws.onerror = (err) => {
                console.error('WebSocket Error:', err);
                toast.error('Lost connection to Hand Tracker', { id: 'hand-tracker' });
            };

            wsRef.current = ws;
            trackingLoopRef.current = window.setInterval(sendFrameToPython, 100);
        } catch (error) {
            console.error(error);
            toast.error('Failed to initialize Hand Tracking', { id: 'hand-tracker' });
        }
    };

    const handleGestureAction = (data: any) => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (data.action === "none") {
            if (isPinchingRef.current) {
                isPinchingRef.current = false;
                endStroke();
            }
            if (cursorRef.current) cursorRef.current.style.transform = `translate(-100px, -100px)`;
            return;
        }

        const pointerX = (1 - data.x) * screenW;
        const pointerY = data.y * screenH;

        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${pointerX}px, ${pointerY}px)`;

            if (data.action === "draw") {
                cursorRef.current.style.backgroundColor = colorRef.current;
                cursorRef.current.style.borderColor = colorRef.current;
                cursorRef.current.style.width = '16px';
                cursorRef.current.style.height = '16px';
            } else if (data.action === "highlight") {
                cursorRef.current.style.backgroundColor = 'rgba(168, 85, 247, 0.4)';
                cursorRef.current.style.width = '32px';
                cursorRef.current.style.height = '32px';
            } else if (data.action === "erase_swipe") {
                cursorRef.current.style.backgroundColor = 'rgba(244, 63, 94, 0.4)';
                cursorRef.current.style.width = '40px';
                cursorRef.current.style.height = '40px';
            } else if (data.action === "change_tool") {
                cursorRef.current.style.backgroundColor = '#10b981';
                cursorRef.current.style.width = '24px';
                cursorRef.current.style.height = '24px';
            } else {
                cursorRef.current.style.backgroundColor = 'transparent';
                cursorRef.current.style.borderColor = '#9ca3af';
                cursorRef.current.style.width = '24px';
                cursorRef.current.style.height = '24px';
            }
        }

        const canvasPt = getCursorPoint(pointerX, pointerY);
        if (!canvasPt) return;

        if (data.action === "draw") {
            if (!isPinchingRef.current) {
                isPinchingRef.current = true;
                if (activeToolRef.current !== 'pen') setActiveTool('pen');
                startStroke(canvasPt.x, canvasPt.y, 0.8);
            } else {
                continueStroke(canvasPt.x, canvasPt.y, 0.8);
            }
        } else if (data.action === "highlight") {
            if (!isPinchingRef.current) {
                isPinchingRef.current = true;
                if (activeToolRef.current !== 'highlighter') setActiveTool('highlighter');
                startStroke(canvasPt.x, canvasPt.y, 0.8);
            } else {
                continueStroke(canvasPt.x, canvasPt.y, 0.8);
            }
        } else if (data.action === "erase_swipe") {
            if (isPinchingRef.current) {
                isPinchingRef.current = false;
                endStroke();
            }
            if (activeToolRef.current !== 'eraser') setActiveTool('eraser');
            eraseAtPoint({ x: canvasPt.x, y: canvasPt.y });
        } else if (data.action === "pause") {
            if (isPinchingRef.current) {
                isPinchingRef.current = false;
                endStroke();
            }
        } else if (data.action === "change_tool") {
            if (isPinchingRef.current) {
                isPinchingRef.current = false;
                endStroke();
            }
            const now = Date.now();
            if (now - lastToolChangeRef.current > 1500) {
                lastToolChangeRef.current = now;
                const tools: ('pen' | 'highlighter' | 'eraser')[] = ['pen', 'highlighter', 'eraser'];
                const currentIndex = tools.indexOf(activeToolRef.current);
                const nextTool = tools[(currentIndex + 1) % tools.length];
                setActiveTool(nextTool);
                toast(`Tool changed to ${nextTool}`);
            }
        }
    };

    const sendFrameToPython = () => {
        const video = videoRef.current;
        const ws = wsRef.current;
        if (!video || !ws || ws.readyState !== WebSocket.OPEN || !isCameraActive) return;

        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Data = canvas.toDataURL('image/jpeg', 0.5);
            ws.send(base64Data);
        }
    };

    const toggleCamera = async () => {
        if (isCameraActive) {
            if (trackingLoopRef.current) clearInterval(trackingLoopRef.current);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            setIsCameraActive(false);
            if (cursorRef.current) cursorRef.current.style.transform = `translate(-100px, -100px)`;
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', () => {
                        initHandTracking();
                    });

                    // Handle play() promise to avoid AbortError: interrupted by a new load request
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn("Video play interrupted or failed:", error);
                        });
                    }
                }
                setIsCameraActive(true);
            } catch (err) {
                toast.error('Failed to access camera');
            }
        }
    };

    const getStrokePath = (stroke: Stroke) => {
        const outlinePoints = getStroke(stroke.points.map(p => [p.x, p.y, p.pressure || 0.5]), {
            size: stroke.size,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: stroke.tool !== 'highlighter'
        });
        return getSvgPathFromStroke(outlinePoints);
    };

    const getBackgroundClass = () => {
        switch (currentPage.background) {
            case 'ruled': return 'bg-white bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] [background-size:100%_2rem] text-zinc-900';
            case 'grid': return 'bg-white bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] [background-size:2rem_2rem] text-zinc-900';
            case 'white': return 'bg-white text-zinc-900';
            case 'dark':
            default: return 'bg-zinc-950 text-white';
        }
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col h-full w-full relative">
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-zinc-400 pointer-events-none z-[100] transition-all duration-75 -translate-x-10 -translate-y-10 shadow-lg mix-blend-difference"
                style={{ transform: 'translate(-100px, -100px)' }}
            />

            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
                <div className="flex gap-4 items-center pointer-events-auto">
                    <Button variant="outline" size="icon" onClick={onExit} className="rounded-full bg-zinc-900/80 border-white/10 text-white hover:bg-zinc-800 backdrop-blur-md">
                        <X className="w-5 h-5" />
                    </Button>
                    <div className="flex bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-2 shadow-2xl items-center gap-3">
                        <input
                            type="text"
                            className="bg-transparent border-none text-white font-medium focus:outline-none w-48 text-lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Note"
                        />
                        <div className="h-4 w-[1px] bg-white/20" />
                        <span className="text-sm font-medium text-zinc-400">Page {currentPageIndex + 1} of {pages.length}</span>
                    </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <Button
                        onClick={toggleCamera}
                        variant="outline"
                        className={`rounded-xl border-white/10 shadow-2xl backdrop-blur-md gap-2 ${isCameraActive ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900/80 text-zinc-300'}`}
                    >
                        {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                        {isCameraActive ? 'Tracking On' : 'Enable Hand Tracking'}
                    </Button>
                    <Button onClick={saveNote} className="rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white shadow-2xl border-none gap-2">
                        <Save className="w-4 h-4" /> Save
                    </Button>
                </div>
            </div>

            <div ref={containerRef} className={`flex-1 relative w-full h-full overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}>
                <svg
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full touch-none ${viewMode === 'clean' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {strokesState.map((stroke) => (
                        <path
                            key={stroke.id}
                            d={getStrokePath(stroke)}
                            fill={stroke.color}
                        />
                    ))}
                    {currentStrokeRef.current && (
                        <path
                            d={getStrokePath(currentStrokeRef.current)}
                            fill={currentStrokeRef.current.color}
                        />
                    )}
                </svg>

                <div className={`absolute z-10 pointer-events-auto transition-all duration-500 ease-in-out ${viewMode === 'clean' ? 'inset-0 p-8 md:p-12 bg-black/40 backdrop-blur-sm pt-12' : 'bottom-24 left-6 right-6 lg:left-24 lg:right-96 h-32 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10'}`}>
                    <div className="max-w-4xl mx-auto h-full flex flex-col">
                        <div className={`flex items-center justify-between ${viewMode === 'clean' ? 'mb-6 px-2' : 'mb-2'}`}>
                            <h2 className={`font-bold tracking-tight text-white flex items-center gap-2 ${viewMode === 'clean' ? 'text-2xl' : 'text-sm text-white/70'}`}>
                                <TypeIcon className={viewMode === 'clean' ? 'w-6 h-6 text-fuchsia-400' : 'w-4 h-4 text-fuchsia-400'} />
                                {viewMode === 'clean' ? 'Live Transcript' : 'Auto-Transcription Active'}
                            </h2>
                            {isRecognizing && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full animate-pulse border border-indigo-500/30">Recognizing...</span>}
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => {
                                setNoteText(e.target.value);
                                setPages(prevPages => {
                                    const updatedPages = [...prevPages];
                                    updatedPages[currentPageIndex].text = e.target.value;
                                    return updatedPages;
                                });
                            }}
                            placeholder="Start writing in the air. Text will appear automatically..."
                            className={`flex-1 w-full bg-transparent border-none text-white font-medium leading-relaxed resize-none focus:outline-none placeholder:text-white/20 custom-scrollbar ${viewMode === 'clean' ? 'text-3xl p-2' : 'text-lg overflow-y-auto'}`}
                        />
                    </div>
                </div>
            </div>

            <video
                ref={videoRef}
                className={`fixed bottom-28 right-6 w-56 h-40 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-2xl z-20 transition-all duration-300 transform -scale-x-100 ${isCameraActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                muted playsInline
            />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-2.5 shadow-2xl shadow-black/50 gap-2 items-center pointer-events-auto transition-all">
                <div className="flex gap-1.5 bg-white/5 rounded-2xl p-1.5 border border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => setActiveTool('pen')} className={`rounded-xl h-10 w-10 ${activeTool === 'pen' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                        <PenTool className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setActiveTool('highlighter')} className={`rounded-xl h-10 w-10 ${activeTool === 'highlighter' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                        <Highlighter className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setActiveTool('eraser')} className={`rounded-xl h-10 w-10 ${activeTool === 'eraser' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                        <Eraser className="w-5 h-5" />
                    </Button>
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <div className="flex gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                    {[
                        { id: 'dark', icon: <Square className="w-4 h-4 fill-zinc-950 text-zinc-700" /> },
                        { id: 'white', icon: <Square className="w-4 h-4 fill-white text-zinc-300" /> },
                        { id: 'ruled', icon: <LayoutGrid className="w-4 h-4" /> },
                        { id: 'grid', icon: <LayoutGrid className="w-4 h-4" /> },
                    ].map((bg: any) => (
                        <button
                            key={bg.id}
                            onClick={() => setBackground(bg.id as any)}
                            className={`p-2 rounded-xl transition-all ${currentPage.background === bg.id ? 'bg-white/20 shadow-md' : 'hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                        >
                            {bg.icon}
                        </button>
                    ))}
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <div className="flex gap-2 items-center px-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if (activeTool === 'eraser') setActiveTool('pen'); }}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-2" />

                <div className="flex gap-2 items-center px-1">
                    <button onClick={() => setSize(2)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${size <= 3 ? 'bg-white/20' : 'hover:bg-white/10'}`}><div className="w-1.5 h-1.5 bg-white rounded-full" /></button>
                    <button onClick={() => setSize(4)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${size > 3 && size <= 6 ? 'bg-white/20' : 'hover:bg-white/10'}`}><div className="w-2.5 h-2.5 bg-white rounded-full" /></button>
                    <button onClick={() => setSize(8)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${size > 6 ? 'bg-white/20' : 'hover:bg-white/10'}`}><div className="w-4 h-4 bg-white rounded-full" /></button>
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handleUndo} disabled={undoStack.length === 0} className="rounded-xl h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                        <Undo2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRedo} disabled={redoStack.length === 0} className="rounded-xl h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                        <Redo2 className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex gap-1.5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-1.5 border border-violet-500/20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode('handwritten')}
                        className={`rounded-xl h-10 w-10 ${viewMode === 'handwritten' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <PenTool className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode('clean')}
                        className={`rounded-xl h-10 w-10 ${viewMode === 'clean' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Type className="w-5 h-5" />
                    </Button>
                    <div className="w-[1px] h-6 bg-violet-500/20 mx-1 self-center" />
                    <Button
                        variant="ghost"
                        onClick={() => setUseGrammar(!useGrammar)}
                        className={`rounded-xl h-10 px-3 text-xs font-bold transition-all ${useGrammar ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                    >
                        Grammar {useGrammar ? 'ON' : 'OFF'}
                    </Button>
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <div className="flex gap-1 bg-gradient-to-r from-indigo-500/10 to-teal-500/10 rounded-2xl p-1 border border-indigo-500/20 items-center px-2">
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange('prev')} disabled={currentPageIndex === 0} className="text-zinc-400 hover:text-white h-8 w-8 disabled:opacity-30 rounded-lg">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 px-2 min-w-[50px] text-center">
                        {currentPageIndex + 1} / {pages.length}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange('next')} className="text-zinc-400 hover:text-white h-8 w-8 rounded-lg">
                        {currentPageIndex === pages.length - 1 ? <Plus className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
