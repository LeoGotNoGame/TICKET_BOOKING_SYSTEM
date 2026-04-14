import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  availableSeats: number;
}

const EventCard: React.FC<{ event: Event }> = ({ event: initialEvent }) => {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('seatUpdate', (data: { eventId: string; availableSeats: number }) => {
      if (data.eventId === event._id) {
        setEvent((prev) => ({ ...prev, availableSeats: data.availableSeats }));
      }
    });

    return () => {
      socket.off('seatUpdate');
    };
  }, [socket, event._id]);

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings', { eventId: event._id });
      alert('Ticket booked successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">Date: {new Date(event.date).toLocaleDateString()}</span>
        <span className={`text-sm font-bold ${event.availableSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
          Available: {event.availableSeats} / {event.capacity}
        </span>
      </div>
      <button
        onClick={handleBook}
        disabled={loading || event.availableSeats === 0}
        className={`w-full py-2 rounded-md font-bold text-white transition-colors 
          ${event.availableSeats > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {loading ? 'Booking...' : event.availableSeats > 0 ? 'Book Now' : 'Sold Out'}
      </button>
    </div>
  );
};

export default EventCard;
