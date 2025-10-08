# Real-Time Analytics Dashboard

A high-performance React dashboard for monitoring real-time sensor data with SignalR integration.

## Features

- **Real-time data streaming** via SignalR WebSocket connections
- **High-performance charts** using Recharts with optimized rendering
- **Memory-efficient data management** with circular buffers (100K+ data points)
- **Live anomaly detection** and alert system
- **Performance monitoring** and load testing capabilities
- **Responsive design** with Tailwind CSS
- **TypeScript** for type safety and better developer experience

## Requirements

- Node.js 18+ 
- .NET Core backend running on `https://localhost:7284`

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure backend URL (optional):**
```bash
cp .env.example .env
# Edit .env to match your backend URL if different from https://localhost:7284
```

3. **Start development server:**
```bash
npm run dev
```