using System;

namespace MonitoringService.Interfaces
{
    public interface IDevice
    {
        string Id { get; set; }

        string OwnerID { get; set; }

        string Name { get; set; }

        int? State { get; set; }

        DateTime? LastStateTime { get; set; }
    }
}