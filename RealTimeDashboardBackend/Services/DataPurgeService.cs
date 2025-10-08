namespace RealTimeDashboardBackend.Services
{
    public class DataPurgeService : BackgroundService
    {
        private readonly ISensorDataService _dataService;
        private readonly ILogger<DataPurgeService> _logger;

        public DataPurgeService(ISensorDataService dataService, ILogger<DataPurgeService> logger)
        {
            _dataService = dataService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Data Purge Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var beforeCount = _dataService.GetTotalReadingsCount();
                    _dataService.PurgeOldData();
                    var afterCount = _dataService.GetTotalReadingsCount();
                    
                    if (beforeCount != afterCount)
                    {
                        _logger.LogInformation("Purged {PurgedCount} old readings. Current count: {CurrentCount}", 
                            beforeCount - afterCount, afterCount);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during data purge");
                }

                // Run purge every hour
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
}