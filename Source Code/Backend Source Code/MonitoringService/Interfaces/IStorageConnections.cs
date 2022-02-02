using Google.Cloud.Firestore;
using Npgsql;

namespace MonitoringService.Interfaces
{
    public interface IStorageConnections
    {
        FirestoreDb FirestoreConnection { get; }
        NpgsqlConnectionStringBuilder PostgrSQLConnectionStringBuilder { get; }
    }
}