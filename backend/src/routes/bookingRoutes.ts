import express from 'express';
import type { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { Ticket } from '../models/Ticket.js';
import { verifyToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Book a ticket
router.post('/book', verifyToken, async (req: Request, res: Response) => {
  const { eventId } = req.body;
  const userId = req.user!.id;

  try {
    // Prevent multiple active bookings for the same user & event if desired (optional logic, but skipping to keep simple unless requested)

    // 1. Atomic decrement of availableSeats with condition
    const event = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );

    if (!event) {
      res.status(400).json({ message: 'No seats available or event not found' });
      return;
    }

    // 2. Create Ticket
    const qrToken = crypto.randomBytes(20).toString('hex');
    const ticket = new Ticket({
      userId,
      eventId,
      qrToken,
      status: 'active'
    });
    await ticket.save();

    // 3. Emit Socket.io event for real-time update
    const io = req.app.get('io');
    io.emit('seatUpdate', { eventId, availableSeats: event.availableSeats });

    res.status(201).json({ message: 'Booking successful', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Booking failed', error });
  }
});

// Get user's tickets
router.get('/my-tickets', verifyToken, async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({ userId: req.user!.id, status: 'active' }).populate('eventId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error });
  }
});

// Cancel a ticket
router.delete('/cancel/:ticketId', verifyToken, async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findOne({ _id: ticketId, userId: req.user!.id, status: 'active' });

    if (!ticket) {
      res.status(404).json({ message: 'Active ticket not found' });
      return;
    }

    // Mark as cancelled
    ticket.status = 'cancelled';
    await ticket.save();

    // Increment available seats safely
    const event = await Event.findByIdAndUpdate(
      ticket.eventId,
      { $inc: { availableSeats: 1 } },
      { new: true }
    );

    if (event) {
      const io = req.app.get('io');
      io.emit('seatUpdate', { eventId: event._id, availableSeats: event.availableSeats });
    }

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling ticket', error });
  }
});

export default router;
