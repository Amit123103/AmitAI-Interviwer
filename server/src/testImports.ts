import express from 'express';
import * as path from 'path';

async function testImports() {
    const routes = [
        './routes/auth',
        './routes/profile',
        './routes/reportRoutes',
        './routes/executionRoutes',
        './routes/paymentRoutes',
        './routes/onsiteRoutes',
        './routes/forumRoutes',
        './routes/analyticsRoutes',
        './routes/reviewRoutes',
        './routes/negotiationRoutes',
        './routes/systemRoutes',
        './routes/settingsRoutes',
        './routes/gamificationRoutes',
        './routes/resumeRoutes',
        './routes/practiceRoutes',
        './routes/questionRoutes',
        './routes/companyRoutes',
        './routes/adminRoutes'
    ];

    for (const route of routes) {
        try {
            console.log(`Testing import: ${route}...`);
            await import(route);
            console.log(`✅ Success: ${route}`);
        } catch (error: any) {
            console.error(`❌ Failed: ${route}`);
            console.error(error.message);
            if (error.stack) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
    console.log('All imports successful!');
}

testImports();
