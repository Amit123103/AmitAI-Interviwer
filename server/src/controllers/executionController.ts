import { Request, Response } from 'express';
import { executionService } from '../services/executionService';
import { isLanguageSupported, getSupportedLanguages } from '../services/execution';

export const runCode = async (req: Request, res: Response) => {
    try {
        const { language, code, stdin } = req.body;

        if (!language || !code) {
            return res.status(400).json({ error: 'Language and code are required.' });
        }

        if (!isLanguageSupported(language)) {
            return res.status(400).json({
                error: `Language "${language}" is not supported.`,
                supported: getSupportedLanguages(),
            });
        }

        const result = await executionService.runScript(code, language, stdin || '');

        res.json({
            run: {
                stdout: result.stdout,
                stderr: result.stderr,
                output: result.output,
                exitCode: result.exitCode,
                errorType: result.errorType,
            },
            error: result.error,
        });

    } catch (error: any) {
        console.error('Execution Controller Error:', error.message);
        res.status(500).json({ error: error.message || 'Execution failed.' });
    }
};
