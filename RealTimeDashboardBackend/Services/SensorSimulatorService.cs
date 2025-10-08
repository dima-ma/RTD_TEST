using RealTimeDashboardBackend.Models;
using RealTimeDashboardBackend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace RealTimeDashboardBackend.Services
{
    public class SensorSimulatorService : BackgroundService
    {
        private readonly ISensorDataService _dataService;
        private readonly IHubContext<DashboardHub> _hubContext;
        private readonly ILogger<SensorSimulatorService> _logger;
        private readonly Random _random = new();
        private readonly string[] _sensorTypes = { "Temperature", "Humidity", "Pressure", "Vibration" };
        private readonly string[] _sensorIds;

        public SensorSimulatorService(
            ISensorDataService dataService, 
            IHubContext<DashboardHub> hubContext,
            ILogger<SensorSimulatorService> logger)
        {
            _dataService = dataService;
            _hubContext = hubContext;
            _logger = logger;
            
            // Generate 20 sensor IDs for simulation
            _sensorIds = Enumerable.Range(1, 20)
                .Select(i => $"SENSOR_{i:D3}")
                .ToArray();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Sensor Simulator Service started");

            // Target: 1000 readings per second
            var targetInterval = TimeSpan.FromMilliseconds(1); // 1ms = 1000/sec
            var batchSize = 10; // Process in batches for efficiency
            var batchInterval = TimeSpan.FromMilliseconds(10); // 10ms batches

            while (!stoppingToken.IsCancellationRequested)
            {
                var startTime = DateTime.UtcNow;
                
                // Generate batch of readings
                var readings = new List<SensorReading>();
                for (int i = 0; i < batchSize; i++)
                {
                    readings.Add(GenerateReading());
                }

                // Process batch
                foreach (var reading in readings)
                {
                    _dataService.AddReading(reading);
                }

                // Send real-time updates (throttled to avoid overwhelming clients)
                if (_random.NextDouble() < 0.1) // 10% chance to send update
                {
                    await SendRealtimeUpdate(readings.Last());
                }

                // Maintain target rate
                var elapsed = DateTime.UtcNow - startTime;
                var delay = batchInterval - elapsed;
                if (delay > TimeSpan.Zero)
                {
                    await Task.Delay(delay, stoppingToken);
                }
            }
        }

        private SensorReading GenerateReading()
        {
            var sensorId = _sensorIds[_random.Next(_sensorIds.Length)];
            var sensorType = _sensorTypes[_random.Next(_sensorTypes.Length)];
            
            // Generate realistic values based on sensor type
            double value = sensorType switch
            {
                "Temperature" => GenerateTemperature(),
                "Humidity" => GenerateHumidity(),
                "Pressure" => GeneratePressure(),
                "Vibration" => GenerateVibration(),
                _ => _random.NextDouble() * 100
            };

            return new SensorReading
            {
                SensorId = sensorId,
                Value = value,
                Timestamp = DateTime.UtcNow,
                SensorType = sensorType
            };
        }

        private double GenerateTemperature()
        {
            // Normal temperature around 22°C with occasional spikes
            var baseTemp = 22.0;
            var normalVariation = (_random.NextDouble() - 0.5) * 10; // ±5°C
            
            // 5% chance of anomaly
            if (_random.NextDouble() < 0.05)
            {
                return baseTemp + (_random.NextDouble() - 0.5) * 40; // Extreme values
            }
            
            return baseTemp + normalVariation;
        }

        private double GenerateHumidity()
        {
            var baseHumidity = 45.0;
            var variation = (_random.NextDouble() - 0.5) * 30;
            
            if (_random.NextDouble() < 0.03)
            {
                return Math.Max(0, Math.Min(100, baseHumidity + (_random.NextDouble() - 0.5) * 80));
            }
            
            return Math.Max(0, Math.Min(100, baseHumidity + variation));
        }

        private double GeneratePressure()
        {
            var basePressure = 1013.25; // Standard atmospheric pressure
            var variation = (_random.NextDouble() - 0.5) * 50;
            
            if (_random.NextDouble() < 0.02)
            {
                return basePressure + (_random.NextDouble() - 0.5) * 200;
            }
            
            return basePressure + variation;
        }

        private double GenerateVibration()
        {
            var baseVibration = 0.5;
            var variation = (_random.NextDouble() - 0.5) * 1.0;
            
            if (_random.NextDouble() < 0.08) // More frequent vibration anomalies
            {
                return baseVibration + _random.NextDouble() * 5;
            }
            
            return Math.Max(0, baseVibration + variation);
        }

        private async Task SendRealtimeUpdate(SensorReading reading)
        {
            try
            {
                await _hubContext.Clients.All.SendAsync("ReceiveReading", reading);
                
                // Send aggregated stats every few updates
                if (_random.NextDouble() < 0.3)
                {
                    var stats = _dataService.GetAggregatedStats(TimeSpan.FromMinutes(1));
                    await _hubContext.Clients.All.SendAsync("ReceiveStats", stats);
                }

                // Send alerts
                var recentAlerts = _dataService.GetRecentAlerts(5);
                if (recentAlerts.Any())
                {
                    await _hubContext.Clients.All.SendAsync("ReceiveAlerts", recentAlerts);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time update");
            }
        }
    }
}