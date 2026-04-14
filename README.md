# 🎫 TicketFlow: College Campus Event Booking System

A modern, full-stack, real-time ticket booking platform designed for college campuses. TicketFlow allows organizers to manage events and students to book tickets with live availability updates.

![Tech Stack](https://img.shields.io/badge/Stack-MERN+TS-blue)
![Realtime](https://img.shields.io/badge/Realtime-Socket.io-orange)
![UI](https://img.shields.io/badge/UI-Tailwind_v4-06B6D4)

## ✨ Features

- **🛡️ Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for **Students** (booking) and **Organizers** (event management).
- **⚡ Real-Time Synchronization**: Live "Available Seats" updates across all connected clients using **Socket.io**—no refresh needed.
- **🔒 Race-Condition Protection**: Implements **Atomic MongoDB Operators** (`$inc`) to ensure events are never overbooked, even with hundreds of simultaneous requests.
- **🎨 Modern Glassmorphic UI**: Sleek, dark-mode design built with **Tailwind CSS v4**, featuring smooth transitions, skeleton loaders, and responsive layouts.
- **🔑 Secure Authentication**: JWT-based sessions stored in **HTTP-only cookies** for maximum protection against XSS attacks.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS v4** (Styling)
- **Socket.io-client** (Real-time)
- **Lucide React** (Iconography)
- **Axios** (API Requests)

### Backend
- **Node.js** & **Express**
- **TypeScript** (Strict Mode)
- **Mongoose** (MongoDB Object Modeling)
- **Socket.io** (WebSockets)
- **Bcrypt** (Password Hashing)
- **JSON Web Token** (Authentication)
- **tsx** (Runtime execution)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Running locally on port 27017)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd TICKET_BOOKING_SYSTEM
   ```

2. **Install dependencies (Root, Backend, and Frontend):**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Environment Setup:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5004
   MONGO_URI=mongodb://127.0.0.1:27017/ticket-booking
   JWT_SECRET=your_super_secret_key
   FRONTEND_URL=http://localhost:5176
   NODE_ENV=development
   ```

### Running the Application

From the **root directory**, run:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5176](http://localhost:5176)
- **Backend API**: [http://localhost:5004](http://localhost:5004)

---

## 📁 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── middleware/      # Auth & RBAC
│   │   ├── models/          # Mongoose Schemas (User, Event, Ticket)
│   │   ├── routes/          # API Endpoints (Auth, Events, Bookings)
│   │   └── server.ts        # Entry point & Socket.io setup
├── frontend/
│   ├── src/
│   │   ├── components/ui/   # Reusable UI (EventCard, Modal)
│   │   ├── context/         # Auth & Socket State
│   │   ├── pages/           # Student Feed & Organizer Dashboard
│   │   ├── services/        # Axios API Configuration
│   │   └── App.tsx          # Routing & Protected Routes
└── package.json             # Root scripts for concurrently running servers
```

---

## 🧪 Crucial Logic: Concurrency Handling

To prevent overbooking, the system uses the following atomic logic in `bookingRoutes.ts`:

```typescript
const event = await Event.findOneAndUpdate(
  { _id: eventId, availableSeats: { $gt: 0 } }, // Condition: Must have seats
  { $inc: { availableSeats: -1 } },             // Action: Decrement atomically
  { new: true }
);
```
This ensures that if two users click "Book" at the exact same millisecond when only one seat is left, the database will only allow one update to succeed.

---

## 📝 License
This project is open-source and available under the MIT License.
# TICKET_BOOKING_SYSTEM
# TICKET_BOOKING_SYSTEM
# TICKET_BOOKING_SYSTEM
