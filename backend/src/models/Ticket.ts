import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  bookingDate: Date;
  status: 'active' | 'cancelled';
  qrToken: string;
}

const ticketSchema = new Schema<ITicket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  qrToken: { type: String, required: true, unique: true },
}, { timestamps: true });

export const Ticket = model<ITicket>('Ticket', ticketSchema);
