import React, { useRef, useEffect, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollaborativeEditorProps {
    code: string
    language: string
    onChange: (value: string) => void
    onLanguageChange: (lang: string) => void
    onRunCode: () => void
    output: string | null
    isReadOnly?: boolean
}

export default function CollaborativeEditor({
    code,
    language,
    onChange,
    onLanguageChange,
    onRunCode,
    output,
    isReadOnly = false
}: CollaborativeEditorProps) {
    const editorRef = useRef<any>(null)

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor
    }

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value)
        }
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
                <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-[180px] bg-black border-zinc-700">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                        onClick={() => onChange("")} // Reset code
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold"
                        onClick={onRunCode}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Run Code
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                <Card className="lg:col-span-2 overflow-hidden border-zinc-800 bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            readOnly: isReadOnly,
                        }}
                    />
                </Card>

                {/* Output Panel */}
                <Card className="border-zinc-800 bg-black flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-zinc-800 font-bold text-xs uppercase tracking-widest text-zinc-500">
                        Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm text-zinc-300 overflow-auto whitespace-pre-wrap">
                        {output === null ? (
                            <span className="text-zinc-600 italic">Run code to see output...</span>
                        ) : output}
                    </div>
                </Card>
            </div>
        </div>
    )
}
