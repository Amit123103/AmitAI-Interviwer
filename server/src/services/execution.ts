import axios from 'axios';

const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';

// ─── Language Registry ────────────────────────────────────────────────────────
export const languageMap: Record<string, { language: string; version: string; aliases?: string[] }> = {
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'typescript': { language: 'typescript', version: '5.0.3' },
    'java': { language: 'java', version: '15.0.2' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'c': { language: 'c', version: '10.2.0' },
    'go': { language: 'go', version: '1.16.2' },
    'rust': { language: 'rust', version: '1.68.2' },
    'csharp': { language: 'csharp', version: '6.12.0', aliases: ['c#', 'cs'] },
    'ruby': { language: 'ruby', version: '3.0.1' },
    'php': { language: 'php', version: '8.2.3' },
    'swift': { language: 'swift', version: '5.3.3' },
    'kotlin': { language: 'kotlin', version: '1.8.20' },
};

// ─── Error Types ──────────────────────────────────────────────────────────────
export type ErrorType = 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'execution_error';

export interface PistonResult {
    stdout: string;
    stderr: string;
    output: string;
    exitCode: number;
    signal: string | null;
    errorType?: ErrorType;
}

// ─── Supported Languages Check ────────────────────────────────────────────────
export function getSupportedLanguages(): string[] {
    return Object.keys(languageMap);
}

export function isLanguageSupported(lang: string): boolean {
    return lang in languageMap;
}

export function getLanguageLabel(lang: string): string {
    const labels: Record<string, string> = {
        python: 'Python 3.10', javascript: 'JavaScript (Node 18)', typescript: 'TypeScript 5',
        java: 'Java 15', cpp: 'C++ (GCC 10)', c: 'C (GCC 10)', go: 'Go 1.16',
        rust: 'Rust 1.68', csharp: 'C# (.NET 6)', ruby: 'Ruby 3', php: 'PHP 8.2',
        swift: 'Swift 5.3', kotlin: 'Kotlin 1.8',
    };
    return labels[lang] || lang;
}

// ─── Main Execution Function ──────────────────────────────────────────────────
export const executeCode = async (
    languageId: string,
    code: string,
    stdin: string = '',
    timeoutMs: number = 10000
): Promise<PistonResult> => {
    const runtime = languageMap[languageId];
    if (!runtime) {
        return {
            stdout: '',
            stderr: `Unsupported language: "${languageId}". Supported: ${getSupportedLanguages().join(', ')}`,
            output: '',
            exitCode: 1,
            signal: null,
            errorType: 'execution_error',
        };
    }

    try {
        const response = await axios.post(PISTON_URL, {
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
            stdin: stdin || '',
            run_timeout: timeoutMs,
            compile_timeout: timeoutMs,
        }, {
            timeout: timeoutMs + 5000, // HTTP timeout slightly longer than execution timeout
        });

        const run = response.data.run;
        const compile = response.data.compile;

        // Check for compilation errors (Java, C++, TypeScript, etc.)
        if (compile && compile.code !== 0 && compile.stderr) {
            return {
                stdout: '',
                stderr: compile.stderr,
                output: compile.output || compile.stderr,
                exitCode: compile.code || 1,
                signal: compile.signal || null,
                errorType: 'compilation_error',
            };
        }

        // Determine error type from runtime result
        let errorType: ErrorType | undefined;
        if (run.signal === 'SIGKILL' || run.signal === 'SIGXCPU') {
            errorType = 'time_limit_exceeded';
        } else if (run.code !== 0 && run.stderr) {
            errorType = 'runtime_error';
        }

        return {
            stdout: run.stdout || '',
            stderr: run.stderr || '',
            output: run.output || '',
            exitCode: run.code ?? 0,
            signal: run.signal || null,
            errorType,
        };
    } catch (error: any) {
        // Network / timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return {
                stdout: '',
                stderr: 'Execution timed out. Your code took too long to run.',
                output: '',
                exitCode: 1,
                signal: 'TIMEOUT',
                errorType: 'time_limit_exceeded',
            };
        }

        console.error('Piston Execution Error:', error.response?.data || error.message);
        return {
            stdout: '',
            stderr: error.response?.data?.message || error.message || 'Code execution failed. Please try again.',
            output: '',
            exitCode: 1,
            signal: null,
            errorType: 'execution_error',
        };
    }
};
