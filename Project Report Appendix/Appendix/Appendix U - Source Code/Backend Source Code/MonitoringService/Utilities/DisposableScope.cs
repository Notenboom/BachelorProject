using Microsoft.Extensions.DependencyInjection;
using System;

namespace MonitoringService.Utilities
{
    /// <summary>
    /// A wrapper class for getting a service and a scope for it.
    /// </summary>
    /// <typeparam name="T">Service Type.</typeparam>
    public class DisposableScope<T> : IDisposable
        where T : class
    {
        private readonly IServiceScope _scope;
        public T Service { get; }

        public DisposableScope(IServiceScope scope, T service)
        {
            _scope = scope;
            Service = service;
        }

        public void Dispose()
        {
            _scope.Dispose();
        }
    }
}