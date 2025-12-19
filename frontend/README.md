# Yatha Frontend

React application with Vite and Tailwind CSS.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/      # Reusable components
├── layouts/         # Layout components
├── pages/          # Page components
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles with Tailwind
```

## Styling

This project uses Tailwind CSS for styling. Custom components and utilities are defined in `src/index.css`.

## API Integration

API calls are configured to proxy through `/api` to the backend server running on port 8000.
