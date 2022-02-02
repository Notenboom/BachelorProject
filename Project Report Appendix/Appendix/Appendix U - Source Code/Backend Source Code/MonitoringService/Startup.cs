using Google.Cloud.Diagnostics.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using MonitoringService.Utilities;

namespace MonitoringService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(config =>
            {
                config.AddConsole();
            });

            services.Configure<AppConfigurations>(Configuration);
            services.AddCors();
            services.AddControllersWithViews();

            services.AddSingleton<IStorageConnections, StorageConnections>();
            services.AddSingleton<IProcessingScheduler, ProcessinScheduler>();

            services.AddTransient<IStorageManager, StorageManager>();

            services.AddTransient<IScopedServiceProvider<IStorageManager>, ScopedServiceProvider<IStorageManager>>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddGoogle(app.ApplicationServices, GoogleCloudUtilities.GetProjectId());

            app.UseCors(builder => builder
            .WithOrigins(
#if DEBUG
                "http://localhost:3000"
#elif RELEASE
                "https://monitoringservicefe-veintwtilq-ey.a.run.app"
#endif
                )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });
        }
    }
}