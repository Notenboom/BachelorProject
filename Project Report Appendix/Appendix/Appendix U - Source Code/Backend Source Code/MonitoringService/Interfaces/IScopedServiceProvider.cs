using MonitoringService.Utilities;

namespace MonitoringService.Interfaces
{
    public interface IScopedServiceProvider<T> where T : class
    {
        DisposableScope<T> GetScopedService();
    }
}