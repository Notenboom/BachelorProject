using Microsoft.Extensions.DependencyInjection;
using MonitoringService.Interfaces;

namespace MonitoringService.Utilities
{
    public class ScopedServiceProvider<T> : IScopedServiceProvider<T> where T : class
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ScopedServiceProvider(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        /// <summary>
        /// Gets the requested service and the scope for it.
        /// </summary>
        /// <returns>Disposable Scope Class containing the service.</returns>
        public DisposableScope<T> GetScopedService()
        {
            var scope = _scopeFactory.CreateScope();
            var requestedService = scope.ServiceProvider.GetRequiredService<T>();
            return new DisposableScope<T>(scope, requestedService);
        }
    }
}