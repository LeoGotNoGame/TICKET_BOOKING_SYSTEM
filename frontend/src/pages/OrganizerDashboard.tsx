import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCcw } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/ui/Modal';
import type { EventType } from '../components/ui/EventCard';

const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setCapacity(0);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventType) => {
    setEditingId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(event.date).toISOString().slice(0, 16)); // Format for datetime-local
    setCapacity(event.capacity);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, { title, description, date, capacity });
        showToast('Event updated successfully');
      } else {
        await api.post('/events', { title, description, date, capacity });
        showToast('Event created successfully');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      showToast('Event deleted');
      fetchEvents();
    } catch (error) {
      showToast('Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
          <p className="text-gray-400">Manage your campus events</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                <th className="p-4 font-semibold">Event Name</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Capacity</th>
                <th className="p-4 font-semibold">Available Seats</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No events found. Create one!</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event._id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-200">
                    <td className="p-4 font-medium">{event.title}</td>
                    <td className="p-4 text-sm">{new Date(event.date).toLocaleString()}</td>
                    <td className="p-4">{event.capacity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${event.availableSeats === 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {event.availableSeats}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => openEditModal(event)} className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-blue-400">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="p-2 bg-white/10 hover:bg-red-500/20 rounded transition-colors text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Event' : 'Create New Event'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea 
              required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date & Time</label>
              <input 
                type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Capacity</label>
              <input 
                type="number" required min="1" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">
              {submitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Simple Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
