using CloudNative.CloudEvents;
using Google.Cloud.Functions.Framework;
using Google.Cloud.Functions.Hosting;
using Google.Events.Protobuf.Cloud.PubSub.V1;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Functions
{
    // Dependency injection configuration, executed during server startup.
    public class Startup : FunctionsStartup
    {
        public override void ConfigureServices(WebHostBuilderContext context, IServiceCollection services)
        {
            // Make an HttpClient available to our function via dependency injection.
            // There are many options here; see
            // https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests
            // for more details.
            services.AddHttpClient<ICloudEventFunction<MessagePublishedData>, Function>();
        }
    }

    // Function, decorated with the FunctionsStartup attribute to specify the startup class
    // for dependency injection.
    [FunctionsStartup(typeof(Startup))]
    public class Function : ICloudEventFunction<MessagePublishedData>
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;

        public Function(ILogger<Function> logger) =>
            _logger = logger;

        public Function(HttpClient httpClient) =>
            _httpClient = httpClient;

        public async Task HandleAsync(CloudEvent cloudEvent, MessagePublishedData data, CancellationToken cancellationToken)
        {
            try
            {
                using (var response = _httpClient.PostAsync("https://bachelorproject-324708.ey.r.appspot.com/api/data/ingest_data", 
                    new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json")
               ))
                {
                    try
                    {
                        response.Result.EnsureSuccessStatusCode();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError($"Tried sending request to backend but got {response.Result.StatusCode} status code");
                    }
                }
            }
            catch(Exception ex)
            {
                _logger.LogError($"Tried sending a request but encountered an error.\nError: {ex.Message}\nStackTrace: {ex.StackTrace}");
            }

          /*  try
            {
                using (var response = _httpClient.PostAsync("https://d4055aaa-a10c-43ad-9233-b5624d01080d.mock.pstmn.io/ingest_data",
                    new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json")
               ))
                {
                    try
                    {
                        response.Result.EnsureSuccessStatusCode();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError($"Tried sending request to backend but got {response.Result.StatusCode} status code");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Tried sending a request but encountered an error.\nError: {ex.Message}\nStackTrace: {ex.StackTrace}");
            }*/
        }
    }
}