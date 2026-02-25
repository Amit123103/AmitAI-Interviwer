import mongoose from 'mongoose';

const OnsiteLoopSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['In Progress', 'Completed'],
        default: 'In Progress'
    },
    rounds: [{
        roundId: String, // internal id from config
        roundName: String,
        type: {
            type: String,
            enum: ['coding', 'system-design', 'behavioral', 'aptitude', 'technical'],
            required: true
        },
        description: String,
        competencies: [String],
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report'
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending'
        }
    }],
    finalDecision: {
        recommendation: {
            type: String,
            enum: ['Strong Hire', 'Hire', 'Leaning Hire', 'Leaning No Hire', 'No Hire', 'Strong No Hire', 'Pending'],
            default: 'Pending'
        },
        justification: String,
        committeeFeedback: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('OnsiteLoop', OnsiteLoopSchema);
