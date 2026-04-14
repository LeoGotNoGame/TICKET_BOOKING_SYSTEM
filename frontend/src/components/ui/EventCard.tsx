import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Ticket } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import Modal from './Modal';

export interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  capacity: number;
  availableSeats: number;
}

interface EventCardProps {
  event: EventType;
  onBookSuccess?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event: initialEvent, onBookSuccess }) => {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleSeatUpdate = (data: { eventId: string; availableSeats: number }) => {
      if (data.eventId === event._id) {
        setEvent((prev) => ({ ...prev, availableSeats: data.availableSeats }));
      }
    };

    socket.on('seatUpdate', handleSeatUpdate);
    return () => {
      socket.off('seatUpdate', handleSeatUpdate);
    };
  }, [socket, event._id]);

  const handleConfirmBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings/book', { eventId: event._id });
      setToastMessage('Ticket Booked successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      setIsModalOpen(false);
      if (onBookSuccess) onBookSuccess();
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || 'Booking failed');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isSoldOut = event.availableSeats === 0;

  return (
    <>
      <div className="glass rounded-xl p-6 flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-blue-500/50 group">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{event.title}</h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1
              ${isSoldOut ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Ticket size={14} />
              {isSoldOut ? 'Sold Out' : `${event.availableSeats} Left`}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-6 line-clamp-2">{event.description}</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-300">
              <Calendar className="w-4 h-4 mr-3 text-blue-400" />
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Users className="w-4 h-4 mr-3 text-purple-400" />
              Capacity: {event.capacity}
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="w-4 h-4 mr-3 text-rose-400" />
              Campus Location
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSoldOut}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
            ${isSoldOut 
              ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30'}`}
        >
          {isSoldOut ? 'Unavailable' : 'Book Ticket'}
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Booking">
        <div className="space-y-4">
          <p className="text-gray-300">Are you sure you want to book a ticket for <strong>{event.title}</strong>?</p>
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg">
            <Calendar className="text-blue-400" />
            <span className="text-white">{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmBook} 
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Yes, Book It'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Simple Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default EventCard;
