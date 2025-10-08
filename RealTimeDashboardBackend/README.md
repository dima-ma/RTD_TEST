# Real-Time Analytics Dashboard Backend

## Overview
A .NET 8 Web API that processes 1000+ sensor readings per second with real-time analytics and anomaly detection. Maintains 100,000 data points in memory with 24-hour auto-purging.

## Architecture Decisions
- **In-memory storage** using thread-safe ConcurrentQueue for maximum performance
- **Circular buffer design** to maintain exactly 100k readings without memory leaks
- **Background services** for data simulation and cleanup
- **SignalR WebSockets** for real-time frontend communication
- **Statistical anomaly detection** using 2-sigma thresholds

## Performance Features
- Processes **1000+ readings/second** sustained
- **100,000 data points** maximum in memory
- **24-hour data retention** with automatic purging
- **Real-time updates** via WebSocket with <100ms latency
- Built-in **load testing** and performance monitoring

## API Endpoints

### Data Access
- `GET /api/sensordata/recent` - Get recent sensor readings
- `GET /api/sensordata/stats` - Get aggregated statistics  
- `GET /api/sensordata/alerts` - Get anomaly alerts
- `GET /api/sensordata/health` - System health status

### Performance Testing
- `GET /api/performance/metrics` - Performance metrics and memory usage
- `POST /api/performance/load-test` - Run load test to validate throughput

## Real-Time Connection
- **SignalR Hub**: `wss://localhost:7xxx/dashboardHub`
- **Events**: `ReceiveReading`, `ReceiveStats`, `ReceiveAlerts`
- **Update Rate**: ~100 readings/second (throttled from 1000 for client performance)