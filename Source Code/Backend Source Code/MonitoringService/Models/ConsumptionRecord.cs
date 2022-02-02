using System;

namespace MonitoringService.Models
{
    public class ConsumptionRecord
    {
        public DateTime Timestamp { get; set; }
        public string DeviceId { get; set; }
        public string OwnerId { get; set; }
        public double Consumption { get; set; }
    }
}