using Microsoft.AspNetCore.Mvc;
using RealTimeDashboardBackend.Services;
using RealTimeDashboardBackend.Models;

namespace RealTimeDashboardBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SensorDataController : ControllerBase
    {
        private readonly ISensorDataService _sensorDataService;
        private readonly ILogger<SensorDataController> _logger;

        public SensorDataController(ISensorDataService sensorDataService, ILogger<SensorDataController> logger)
        {
            _sensorDataService = sensorDataService;
            _logger = logger;
        }

        [HttpGet("recent")]
        public ActionResult<IEnumerable<SensorReading>> GetRecentReadings([FromQuery] int count = 1000)
        {
            try
            {
                var readings = _sensorDataService.GetRecentReadings(count);
                return Ok(readings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent readings");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("stats")]
        public ActionResult<AggregatedStats> GetAggregatedStats([FromQuery] int windowMinutes = 5)
        {
            try
            {
                var window = TimeSpan.FromMinutes(windowMinutes);
                var stats = _sensorDataService.GetAggregatedStats(window);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving aggregated stats");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("alerts")]
        public ActionResult<IEnumerable<AnomalyAlert>> GetRecentAlerts([FromQuery] int count = 100)
        {
            try
            {
                var alerts = _sensorDataService.GetRecentAlerts(count);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alerts");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("health")]
        public ActionResult<object> GetHealthStatus()
        {
            try
            {
                var totalReadings = _sensorDataService.GetTotalReadingsCount();
                var recentStats = _sensorDataService.GetAggregatedStats(TimeSpan.FromMinutes(1));
                
                return Ok(new
                {
                    TotalReadings = totalReadings,
                    ReadingsPerMinute = recentStats.Count,
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving health status");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("simulate")]
        public ActionResult SimulateReading([FromBody] SensorReading reading)
        {
            try
            {
                if (reading == null)
                    return BadRequest("Invalid reading data");

                reading.Timestamp = DateTime.UtcNow;
                _sensorDataService.AddReading(reading);
                
                return Ok(new { Message = "Reading added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding simulated reading");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
