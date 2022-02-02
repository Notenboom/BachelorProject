using Google.Api.Gax;
using Google.Apis.Auth.OAuth2;
using Google.Apis.CloudIot.v1;
using Google.Apis.Services;
using System;

namespace MonitoringService.Utilities
{
    public static class GoogleCloudUtilities
    {
        public static string GetProjectId()
        {
#if DEBUG
            var projectId = Environment.GetEnvironmentVariable("PROJECT_ID");
#elif RELEASE
            var instance = Platform.Instance();
            var projectId = instance?.ProjectId;
#endif

            if (string.IsNullOrEmpty(projectId))
            {
                return null;
            }

            return projectId;
        }

        public static CloudIotService CreateAuthorizedClient()
        {
            var credential = GoogleCredential.GetApplicationDefaultAsync().Result;

            // Inject the Cloud IoT Core Service scope
            if (credential.IsCreateScopedRequired)
            {
                credential = credential.CreateScoped(new[] { CloudIotService.Scope.Cloudiot });
            }

            return new CloudIotService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                GZipEnabled = false
            });
        }
    }
}