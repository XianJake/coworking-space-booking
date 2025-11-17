# 🏢 CoWorkSpace Booking System

A complete, production-ready space booking system built with React, Node.js, Express, and PostgreSQL.

## ✨ Features

### 🎯 Core Features
- **Space Booking System** - Book workspaces by hour, half-day, full-day, week, or month
- **Real-time Availability** - Check seat availability before booking
- **50/50 Payment System** - Pay 50% deposit, remaining 50% after use
- **Membership Plans** - Subscribe for exclusive discounts (10-20% off)
- **Multiple Payment Methods** - GCash, Maya, Credit/Debit Cards
- **User Authentication** - Secure JWT-based login/signup
- **Admin Dashboard** - Manage all bookings, users, and spaces
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### 📦 Space Types
1. **Common Area** - 15 seats, open workspace
2. **Private Room** - 2 seats, quiet office space
3. **Collaboration Room** - 6-8 people, meeting room
4. **Premium Seat** - 5 seats, ergonomic workspace

### 🎨 Design
- Navy blue and orange theme (Airbnb/Luma inspired)
- Modern, clean UI with Tailwind CSS
- Intuitive user experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Database Setup

**Install PostgreSQL** (if not installed):
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

**Create Database:**
```bash
# Start PostgreSQL service
# Windows: Start from Services
# Mac: brew services start postgresql
# Linux: sudo service postgresql start

# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE coworking_db;

# Exit
\q
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=coworking_db
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Run migrations (creates tables and seeds data)
npm run migrate

# Start the server
npm run dev
```

Server will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
# Open a NEW terminal
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

## 👤 Demo Accounts

The system comes with pre-seeded demo accounts:

**Customer Account:**
- Email: `demo@customer.com`
- Password: `demo123`

**Admin Account:**
- Email: `admin@coworkspace.com`
- Password: `admin123`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup      - Create new user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get user profile (auth required)
```

### Space Endpoints
```
GET  /api/spaces           - Get all spaces
GET  /api/spaces/:id       - Get space by ID
GET  /api/spaces/availability - Check availability
POST /api/spaces           - Create space (admin only)
PUT  /api/spaces/:id       - Update space (admin only)
```

### Booking Endpoints
```
POST /api/bookings         - Create booking (auth required)
GET  /api/bookings/my-bookings - Get user bookings (auth required)
GET  /api/bookings         - Get all bookings (admin only)
GET  /api/bookings/:id     - Get booking by ID (auth required)
PUT  /api/bookings/:id/status - Update booking status (admin only)
PUT  /api/bookings/:id/cancel - Cancel booking (auth required)
```

### Payment Endpoints
```
POST /api/payments/deposit - Process deposit payment (auth required)
POST /api/payments/balance - Process balance payment (auth required)
GET  /api/payments/booking/:bookingId - Get booking payments
GET  /api/payments/my-payments - Get user payments (auth required)
```

### Membership Endpoints
```
GET  /api/membership/plans - Get all membership plans
POST /api/membership/subscribe - Subscribe to plan (auth required)
POST /api/membership/cancel - Cancel membership (auth required)
```

## 🎯 User Flows

### Customer Booking Flow
1. Browse available spaces
2. Select space and click "Book Now"
3. Choose duration (hourly/daily/weekly/monthly)
4. Select number of seats
5. Choose date and time
6. Select payment method
7. Pay 50% deposit
8. Receive booking confirmation
9. Use the space
10. Pay remaining 50% balance after use

### Admin Flow
1. Login to admin dashboard
2. View all bookings and statistics
3. Check-in customers when they arrive
4. Extend bookings if requested
5. Complete bookings and process balance payments
6. Manage spaces and pricing

## 🌐 Deployment

### Deploying to Vercel (Free)

**Backend (API):**
1. Create account on [Vercel](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. In backend folder: `vercel`
4. Follow prompts
5. Set environment variables in Vercel dashboard

**Frontend:**
1. Update `VITE_API_URL` in frontend/.env
2. In frontend folder: `vercel`
3. Follow prompts

**Database:**
Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for free PostgreSQL hosting

## 📁 Project Structure

```
coworking-space-booking/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── bookingController.js  # Booking logic
│   │   ├── paymentController.js  # Payment logic
│   │   ├── spaceController.js    # Space management
│   │   └── membershipController.js
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── migrations/
│   │   ├── createTables.js      # Database schema
│   │   ├── seedData.js          # Initial data
│   │   └── runMigrations.js     # Migration runner
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── spaceRoutes.js
│   │   └── membershipRoutes.js
│   ├── server.js                # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx       # Navigation component
    │   ├── contexts/
    │   │   └── AuthContext.jsx  # Authentication context
    │   ├── pages/
    │   │   ├── Home.jsx         # Homepage
    │   │   ├── Spaces.jsx       # Space listing
    │   │   ├── SpaceDetails.jsx # Space details
    │   │   ├── Booking.jsx      # Booking page
    │   │   ├── MyBookings.jsx   # User bookings
    │   │   ├── Membership.jsx   # Membership plans
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Signup.jsx       # Signup page
    │   │   └── AdminDashboard.jsx # Admin panel
    │   ├── utils/
    │   │   └── api.js           # API calls
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── package.json
    └── vite.config.js

```

## 🔧 Customization

### Adding New Space Types
1. Login as admin
2. Use the API endpoint: `POST /api/spaces`
3. Or add directly to database

### Changing Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    navy: '#1a365d',  // Change this
  },
  accent: {
    orange: '#ff6b35', // Change this
  },
}
```

### Payment Gateway Integration
Currently simulated. To integrate real payments:
1. Sign up for [PayMongo](https://paymongo.com)
2. Add credentials to `.env`
3. Update `backend/controllers/paymentController.js`

## 🐛 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in backend/.env
- Update proxy in frontend/vite.config.js

**Frontend can't reach backend:**
- Ensure backend is running on port 5000
- Check CORS settings in backend/server.js

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify PostgreSQL connection

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🎉 What's Next?

### Future Enhancements
- Email notifications
- SMS reminders
- QR code check-in
- Mobile app
- Calendar integration
- Reviews and ratings
- Waitlist system
- Group bookings
- Recurring bookings

---

**Built with ❤️ using React, Node.js, Express, and PostgreSQL**

🚀 Happy booking!
