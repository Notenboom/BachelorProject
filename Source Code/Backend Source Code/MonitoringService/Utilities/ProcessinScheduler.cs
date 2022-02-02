using Microsoft.Extensions.Logging;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace MonitoringService.Utilities
{
    public class ProcessinScheduler : IProcessingScheduler
    {
        private readonly IScopedServiceProvider<IStorageManager> _storageManagerScopeProvider; 
        private readonly ILogger<ProcessinScheduler> _logger;

        private readonly ConcurrentDictionary<string, Message> _beingProcessedMessages = new ConcurrentDictionary<string, Message>();
        private readonly ConcurrentDictionary<string, Message> _waitingMessages = new ConcurrentDictionary<string, Message>(); 

        public ProcessinScheduler(ILogger<ProcessinScheduler> logger, IScopedServiceProvider<IStorageManager> storageManagerScopeProvider)
        {
            _storageManagerScopeProvider = storageManagerScopeProvider;
            _logger = logger;
        }

        public async Task ScheduleWork(Message message)
        {
            _logger.LogInformation($"Consumption message {message.MessageId} is being scheduled.");

            if(_beingProcessedMessages.Count <= 1 && _beingProcessedMessages.TryAdd(message.MessageId, message))
            {
                _logger.LogInformation($"Consumption messsage {message.MessageId} is being processed.");

                try
                {
                    var consumptionRecord = JsonConvert.DeserializeObject<ConsumptionRecord>(message.TextData.ToString());
                    consumptionRecord.Timestamp = DateTimeOffset.FromUnixTimeSeconds(message.PublishTime.Seconds).DateTime;

                    using var storageManagerScope = _storageManagerScopeProvider.GetScopedService();
                    var identifiedDevice = await storageManagerScope.Service.GetDocumentsWhere<Device>("devices", "id", consumptionRecord.DeviceId);

                    if(identifiedDevice.Count() <= 0)
                    {
                        _logger.LogWarning($"Tried processing message {message.MessageId} but could not identify device/owner. Skipping the message.");
                    }
                    else
                    {
                        consumptionRecord.OwnerId = identifiedDevice.FirstOrDefault().OwnerID; 
                        await storageManagerScope.Service.InsertConsumptionRecord(consumptionRecord);
                    }
                }
                catch(Exception ex)
                {
                    _logger.LogError($"Tried processing message {message.MessageId} but encountered an error.\nError: {ex.Message}\nStackTrace: {ex.StackTrace}");
                }

                _beingProcessedMessages.TryRemove(message.MessageId, out Message processedMessage);

                if(_waitingMessages.Count > 0 && _waitingMessages.TryRemove(_waitingMessages.Keys.FirstOrDefault(), out Message waitingMessage))
                {
                    await ScheduleWork(waitingMessage);
                }
            }
            else
            {
                _waitingMessages.TryAdd(message.MessageId, message);
            }

        }
    }
}