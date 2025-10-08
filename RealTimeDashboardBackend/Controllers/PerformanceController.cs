using Microsoft.AspNetCore.Mvc;
using RealTimeDashboardBackend.Services;
using System.Diagnostics;

namespace RealTimeDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        private readonly ISensorDataService _sensorDataService;
        private readonly ILogger<PerformanceController> _logger;

        public PerformanceController(ISensorDataService sensorDataService, ILogger<PerformanceController> logger)
        {
            _sensorDataService = sensorDataService;
            _logger = logger;
        }

        [HttpGet("metrics")]
        public ActionResult<object> GetPerformanceMetrics()
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Test data retrieval performance
            var recentReadings = _sensorDataService.GetRecentReadings(10000);
            var retrievalTime = stopwatch.ElapsedMilliseconds;
            
            stopwatch.Restart();
            var stats = _sensorDataService.GetAggregatedStats(TimeSpan.FromMinutes(5));
            var aggregationTime = stopwatch.ElapsedMilliseconds;
            
            stopwatch.Restart();
            var alerts = _sensorDataService.GetRecentAlerts(100);
            var alertRetrievalTime = stopwatch.ElapsedMilliseconds;

            // Memory usage estimation
            var process = Process.GetCurrentProcess();
            var memoryUsage = process.WorkingSet64 / (1024 * 1024); // MB

            return Ok(new
            {
                TotalReadings = _sensorDataService.GetTotalReadingsCount(),
                MemoryUsageMB = memoryUsage,
                Performance = new
                {
                    DataRetrievalMs = retrievalTime,
                    AggregationMs = aggregationTime,
                    AlertRetrievalMs = alertRetrievalTime
                },
                Stats = stats,
                RecentAlertsCount = alerts.Count(),
                Timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("load-test")]
        public ActionResult<object> RunLoadTest([FromQuery] int duration = 10)
        {
            var stopwatch = Stopwatch.StartNew();
            var readingsAdded = 0;
            var targetDuration = TimeSpan.FromSeconds(duration);

            _logger.LogInformation("Starting load test for {Duration} seconds", duration);

            while (stopwatch.Elapsed < targetDuration)
            {
                // Simulate high-frequency data insertion
                for (int i = 0; i < 100; i++)
                {
                    var reading = new Models.SensorReading
                    {
                        SensorId = $"LOAD_TEST_{i % 10}",
                        Value = Random.Shared.NextDouble() * 100,
                        Timestamp = DateTime.UtcNow,
                        SensorType = "LoadTest"
                    };
                    
                    _sensorDataService.AddReading(reading);
                    readingsAdded++;
                }
                
                // Small delay to prevent overwhelming the system
                Thread.Sleep(1);
            }

            stopwatch.Stop();
            var readingsPerSecond = readingsAdded / stopwatch.Elapsed.TotalSeconds;

            return Ok(new
            {
                TestDurationSeconds = stopwatch.Elapsed.TotalSeconds,
                ReadingsAdded = readingsAdded,
                ReadingsPerSecond = Math.Round(readingsPerSecond, 2),
                TotalReadingsInSystem = _sensorDataService.GetTotalReadingsCount(),
                TestCompleted = DateTime.UtcNow
            });
        }
    }
}