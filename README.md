# Full-Stack Engineering Challenge - Foundation

This is the project foundation for a 72-hour engineering challenge. It is designed to be simple, reliable, and easily extensible.

## Project Structure

```
project/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   ├── public/
│   └── ...
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│   ├── tests/
│   └── ...
├── .gitignore
└── README.md
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- React Router (if needed)

### Backend
- Node.js
- Express
- TypeScript
- Jest & Supertest (for testing)

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

## Getting Started

### 1. Setup Environment Variables
First, create the `.env` files from their respective examples.

**Backend:**
```bash
cd backend
cp .env.example .env
```
Update the `.env` file with your local PostgreSQL connection details if a database is needed.

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Run the Project Locally

**Start Backend (runs on port 3000 by default):**
```bash
cd backend
npm run dev
```

**Start Frontend (runs on port 5173 by default):**
```bash
cd frontend
npm run dev
```

### 4. Running Tests

To run the backend tests:
```bash
cd backend
npm run test
```

### 5. Building for Production

**Backend:**
```bash
cd backend
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
```
