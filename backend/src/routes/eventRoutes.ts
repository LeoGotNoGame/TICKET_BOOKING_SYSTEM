import express from 'express';
import type { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { verifyToken, isOrganizer } from '../middleware/auth.js';

const router = express.Router();

// Public: Fetch all events (with optional filtering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { title } = req.query;
    const filter: any = {};
    if (title) {
      filter.title = { $regex: title as string, $options: 'i' };
    }
    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Protected: Create event (Organizer only)
router.post('/', verifyToken, isOrganizer, async (req: Request, res: Response) => {
  try {
    const { title, description, date, capacity } = req.body;
    const event = new Event({
      title,
      description,
      date,
      capacity,
      availableSeats: capacity,
      organizerId: req.user!.id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Protected: Fetch single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return void res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Protected: Update event (Organizer only)
router.put('/:id', verifyToken, isOrganizer, async (req: Request, res: Response) => {
  try {
    const { title, description, date, capacity } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return void res.status(404).json({ message: 'Event not found' });
    if (event.organizerId.toString() !== req.user!.id) {
      return void res.status(403).json({ message: 'Unauthorized' });
    }

    // Recalculate available seats roughly based on capacity change
    const capacityDiff = capacity - event.capacity;
    event.capacity = capacity;
    event.availableSeats = Math.max(0, event.availableSeats + capacityDiff);
    event.title = title;
    event.description = description;
    event.date = date;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Protected: Delete event (Organizer only)
router.delete('/:id', verifyToken, isOrganizer, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return void res.status(404).json({ message: 'Event not found' });
    if (event.organizerId.toString() !== req.user!.id) {
      return void res.status(403).json({ message: 'Unauthorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

export default router;
