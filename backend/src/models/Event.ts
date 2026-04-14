import { Schema, model, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  availableSeats: number;
  organizerId: Types.ObjectId;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  capacity: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Event = model<IEvent>('Event', eventSchema);
