# Yatha

A modern web application built with React, Tailwind CSS, and PHP.

## Project Structure

```
Yatha/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # PHP API
└── README.md
```

## Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **PHP** - Server-side language
- **MySQL** - Database
- **PDO** - Database abstraction layer

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PHP (v7.4 or higher)
- MySQL/MariaDB
- XAMPP/WAMP/MAMP (optional, for easy PHP setup)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure database connection:
   - Edit `config/database.php` with your MySQL credentials

3. Create the database:
   - Import `database/schema.sql` into your MySQL server

4. Start PHP development server:
```bash
php -S localhost:8000 -t .
```

The API will be available at `http://localhost:8000`

## Development

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API calls from frontend are proxied through Vite to the backend

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The built files will be in `frontend/dist/`

### Backend
Deploy the `backend/` folder to your PHP hosting server.

## API Endpoints

- `GET /` - Welcome message
- `GET /api/test` - Test endpoint

## License

MIT
