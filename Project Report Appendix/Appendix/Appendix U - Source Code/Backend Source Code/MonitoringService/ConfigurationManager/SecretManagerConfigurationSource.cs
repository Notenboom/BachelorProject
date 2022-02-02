using Microsoft.Extensions.Configuration;

namespace MonitoringService.ConfigurationManager
{
    public class SecretManagerConfigurationSource : IConfigurationSource
    {
        public IConfigurationProvider Build(IConfigurationBuilder configurationBuilder)
        {
            return new SecretManagerConfigurationProvider();
        }
    }
}