using MonitoringService.Interfaces;
using MonitoringService.Models;
using Npgsql;
using RepoDb;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonitoringService.Utilities
{
    public class StorageManager : IStorageManager
    {
        private readonly IStorageConnections _storageConnection;

        public StorageManager(IStorageConnections storageConnections)
        {
            _storageConnection = storageConnections;
        }

        public async Task InsertConsumptionRecord(ConsumptionRecord consumptionRecord)
        {
            using var connection = new NpgsqlConnection(_storageConnection.PostgrSQLConnectionStringBuilder.ConnectionString);
            await connection.InsertAsync(consumptionRecord);
        }

        public async Task InsertConsumptionRecord(List<ConsumptionRecord> consumptionRecords)
        {
            using var connection = new NpgsqlConnection(_storageConnection.PostgrSQLConnectionStringBuilder.ConnectionString);
            await connection.InsertAllAsync(consumptionRecords);
        }

        public async Task<IEnumerable<ConsumptionRecord>> GetLatestConsumptionRecordConditional(string ownerId)
        {
            var statement = $"SELECT * FROM \"ConsumptionRecord\" WHERE \"OwnerId\" = '{ownerId}' ORDER BY \"Timestamp\" DESC LIMIT 1";

            using var connection = new NpgsqlConnection(_storageConnection.PostgrSQLConnectionStringBuilder.ConnectionString);
            return await connection.ExecuteQueryAsync<ConsumptionRecord>(statement);
        }

        public async Task<IEnumerable<ConsumptionRecord>> GetRangeConsumptionRecordConditional(string ownerId, string deviceId, DateTime from, DateTime to)
        {
            var statement = $"SELECT * FROM \"ConsumptionRecord\" WHERE \"Timestamp\" BETWEEN '{from}' AND '{to}' AND \"OwnerId\" = '{ownerId}' AND \"DeviceId\" = '{deviceId}'";

            using var connection = new NpgsqlConnection(_storageConnection.PostgrSQLConnectionStringBuilder.ConnectionString);
            return await connection.ExecuteQueryAsync<ConsumptionRecord>(statement);
        }

        public async Task GetConsumptionRecordsConditional(Func<ConsumptionRecord, bool> conditionalFunction)
        {
                using var connection = new NpgsqlConnection(_storageConnection.PostgrSQLConnectionStringBuilder.ConnectionString);
                var id = await connection.QueryAsync<ConsumptionRecord>(conditionalFunction);
        }

        public async Task<List<T>> GetDocumentsWhere<T>(string collectionName, string fieldPath, object compareValue)
        {
            var resultSnapshot = await _storageConnection.FirestoreConnection.Collection(collectionName).WhereEqualTo(fieldPath, compareValue).GetSnapshotAsync();

            var resultList = new List<T>();

            foreach (var documentSnapshot in resultSnapshot)
            {
                resultList.Add(documentSnapshot.ConvertTo<T>());
            }

            return resultList;
        }

        public async Task AddDocumentWithAutoID<T>(string collectionName, T documentData)
        {
            await _storageConnection.FirestoreConnection.Collection(collectionName).AddAsync(documentData);
        }

        public async Task DeleteDocumentWhereEqualTo(string collectionName, string fieldPath, object compareValue)
        {
            var resultSnapshot = await _storageConnection.FirestoreConnection.Collection(collectionName).WhereEqualTo(fieldPath, compareValue).GetSnapshotAsync();

            foreach (var documentSnapshot in resultSnapshot)
            {
                await _storageConnection.FirestoreConnection.Collection(collectionName).Document(documentSnapshot.Id).DeleteAsync();
            }
        }

        public async Task UpdateDocumentWhereEqualTo<T>(string collectionName, string fieldPath, object compareValue, T newValue)
        {
            var resultSnapshot = await _storageConnection.FirestoreConnection.Collection(collectionName).WhereEqualTo(fieldPath, compareValue).GetSnapshotAsync();

            foreach (var documentSnapshot in resultSnapshot)
            {
                if (documentSnapshot.Exists)
                {
                    await _storageConnection.FirestoreConnection.Collection(collectionName).Document(documentSnapshot.Id).SetAsync(newValue);
                }
            }
        }
    }
}