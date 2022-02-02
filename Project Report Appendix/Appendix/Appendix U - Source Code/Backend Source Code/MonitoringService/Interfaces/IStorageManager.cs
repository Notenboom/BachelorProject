using MonitoringService.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonitoringService.Interfaces
{
    public interface IStorageManager
    {
        /// <summary>
        /// Get documents where <paramref name="fieldPath"/> equals to <paramref name="compareValue"/> from the <paramref name="collectionName"/>
        /// </summary>
        /// <typeparam name="T">Type of object expected</typeparam>
        /// <param name="collectionName">Name of the collection where to perform the look up</param>
        /// <param name="fieldPath">Name of the field that is compared</param>
        /// <param name="compareValue">Value to be compared with documents' fields</param>
        /// <returns>List of objects returned from the lookup</returns>
        Task<List<T>> GetDocumentsWhere<T>(string collectionName, string fieldPath, object compareValue);

        /// <summary>
        /// Creates a new document in the given <paramref name="collection"/> with auto id containing given <paramref name="documentData"/>
        /// </summary>
        /// <param name="collection">Collection where to create the document</param>
        /// <param name="documentData">Data that the document should contain</param>
        /// <returns>Task</returns>
        Task AddDocumentWithAutoID<T>(string collectionName, T documentData);

        /// <summary>
        /// Deltes a document in the given <paramref name="collectionName"/> with the <paramref name="fieldPath"/> value equaling <paramref name="compareValue"/>
        /// </summary>
        /// <param name="collectionName"></param>
        /// <param name="fieldPath"></param>
        /// <param name="compareValue"></param>
        /// <returns></returns>
        Task DeleteDocumentWhereEqualTo(string collectionName, string fieldPath, object compareValue);

        /// <summary>
        /// Edits existing focuments from the given <paramref name="collectionName"/> where <paramref name="fieldPath"/> equals <paramref name="compareValue"/> with the <paramref name="newValue"/>
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="collectionName"></param>
        /// <param name="fieldPath"></param>
        /// <param name="compareValue"></param>
        /// <param name="newValue"></param>
        /// <remarks>If not all fields of the document are provided, missing fields will be set to null - can be used for deleting fields.</remarks>
        /// <returns></returns>
        Task UpdateDocumentWhereEqualTo<T>(string collectionName, string fieldPath, object compareValue, T newValue);

        /// <summary>
        /// Inserts consumption record objects into the database.
        /// </summary>
        /// <param name="consumptionRecord">object to insert</param>
        /// <returns></returns>
        Task InsertConsumptionRecord(ConsumptionRecord consumptionRecord);

        /// <summary>
        /// Insert a enumerable of consumption records into the database.
        /// </summary>
        /// <param name="consumptionRecords">enumerable of objects</param>
        /// <returns></returns>
        Task InsertConsumptionRecord(List<ConsumptionRecord> consumptionRecords);

        /// <summary>
        /// Gets all the consumption records after applying the filter <paramref name="conditionalFunction"/> function.
        /// </summary>
        /// <param name="conditionalFunction"></param>
        /// <returns></returns>
        Task GetConsumptionRecordsConditional(Func<ConsumptionRecord, bool> conditionalFunction);

        Task<IEnumerable<ConsumptionRecord>> GetLatestConsumptionRecordConditional(string ownerId);

        Task<IEnumerable<ConsumptionRecord>> GetRangeConsumptionRecordConditional(string ownerId, string deviceId, DateTime from, DateTime to);
    }
}