using Google.Cloud.Firestore;
using Microsoft.Extensions.Options;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using Npgsql;

namespace MonitoringService.Utilities
{
    public class StorageConnections : IStorageConnections
    {
        private readonly IOptions<AppConfigurations> _appConfigurations;

        private FirestoreDb cachedDatabaseConnection = null;
        private NpgsqlConnectionStringBuilder cachedNpgsqlConnectionStringBuilder = null;

        public StorageConnections(IOptions<AppConfigurations> appConfigurations)
        {
            _appConfigurations = appConfigurations;
        }

        /// <summary>
        /// Get connection handle for Firebase Storage
        /// </summary>
        public FirestoreDb FirestoreConnection => GetFirestoreConnection();

        /// <summary>
        /// Gets connection string builder for the PostgreSQL Storage
        /// </summary>
        public NpgsqlConnectionStringBuilder PostgrSQLConnectionStringBuilder => GetNpgsqlConnectionStringBuilder();

        private NpgsqlConnectionStringBuilder GetNpgsqlConnectionStringBuilder()
        {
            if (cachedNpgsqlConnectionStringBuilder != null)
            {
                return cachedNpgsqlConnectionStringBuilder;
            }

            RepoDb.PostgreSqlBootstrap.Initialize();

            var connectionString = new NpgsqlConnectionStringBuilder()
            {
                SslMode = SslMode.Disable,
#if DEBUG
                Host = _appConfigurations.Value.DatabaseIP,
#elif RELEASE
                Host = "cloudsql",
#endif
                Username = _appConfigurations.Value.DatabaseUser,
                Password = _appConfigurations.Value.DatabasePass,
                Database = _appConfigurations.Value.DatabaseName
            };

            cachedNpgsqlConnectionStringBuilder = connectionString;

            return connectionString;
        }

        private FirestoreDb GetFirestoreConnection()
        {
            if (cachedDatabaseConnection == null)
            {
                cachedDatabaseConnection = FirestoreDb.Create(GoogleCloudUtilities.GetProjectId());
            }

            return cachedDatabaseConnection;
        }
    }
}