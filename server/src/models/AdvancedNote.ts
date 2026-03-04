import mongoose, { Document, Schema } from 'mongoose';

export interface IPage {
    pageId: string;
    strokes: any[]; // Array of stroke objects from perfect-freehand / custom drawing implementation
    recognizedWords?: any[];
    text?: string;
    background: 'white' | 'ruled' | 'grid' | 'dark';
    createdAt: Date;
    updatedAt: Date;
}

export interface IAdvancedNote extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    previewText?: string;
    pages: IPage[];
    createdAt: Date;
    updatedAt: Date;
}

const pageSchema = new Schema<IPage>({
    pageId: { type: String, required: true },
    strokes: { type: [Schema.Types.Mixed] as any, default: [] },
    recognizedWords: { type: [Schema.Types.Mixed] as any, default: [] },
    text: { type: String, default: '' },
    background: { type: String, enum: ['white', 'ruled', 'grid', 'dark'], default: 'white' },
}, { timestamps: true });

const advancedNoteSchema = new Schema<IAdvancedNote>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'Untitled Note' },
    previewText: { type: String, default: '' },
    pages: { type: [pageSchema], default: [] },
}, { timestamps: true });

// Add text index for searching notes by title or preview text
advancedNoteSchema.index({ title: 'text', previewText: 'text' });
advancedNoteSchema.index({ userId: 1, updatedAt: -1 });

export const AdvancedNote = mongoose.model<IAdvancedNote>('AdvancedNote', advancedNoteSchema);
