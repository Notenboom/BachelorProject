using Microsoft.AspNetCore.Mvc;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using MoreLinq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace MonitoringService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly IProcessingScheduler _processScheduler;
        private readonly IStorageManager _storageManager;

        public DataController(IProcessingScheduler processScheduler, IStorageManager storageManager)
        {
            _processScheduler = processScheduler;
            _storageManager = storageManager;
        }

        [HttpPost]
        [Route("ingest_data")]
        public IActionResult IngestData([FromBody] JsonElement deviceMessage)
        {
            var message = JsonConvert.DeserializeObject<Message>(deviceMessage.GetProperty("Message").GetRawText());

            _processScheduler.ScheduleWork(message);

            return Ok();
        }

        [HttpGet]
        [Route("get_latest_data")]
        public async Task<IActionResult> GetLatestData(string ownerId)
        {
            var record = await _storageManager.GetLatestConsumptionRecordConditional(ownerId);

            return Ok(JsonConvert.SerializeObject(record.FirstOrDefault()));
        }

        [HttpGet]
        [Route("get_data")]
        public async Task<IActionResult> GetDataBetween(string ownerId, long from, long to, [FromQuery] string[] deviceIds)
        {
            var fromObject = DateTimeOffset.FromUnixTimeSeconds(from).DateTime;
            var toObject = DateTimeOffset.FromUnixTimeSeconds(to).DateTime;

            var records = new Dictionary<string, IEnumerable<ConsumptionRecord>>();

            foreach (var deviceId in deviceIds)
            {
                var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, fromObject, toObject);
                records.Add(deviceId, record);
            }

            return Ok(JsonConvert.SerializeObject(records));
        }

        [HttpGet]
        [Route("get_aggregated_0")]
        public async Task<IActionResult> GetAggregatedData(string ownerId, int month, int year, [FromQuery] string[] deviceIds)
        {
            var today = DateTime.Now;
            var firstDay = new DateTime(year, month, 1);
            var lastDay = today.Year == year && today.Month == month ? today : firstDay.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59);

            var records = new Dictionary<string, IEnumerable<object>>();

            foreach (var deviceId in deviceIds)
            {
                var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, firstDay, lastDay);

                var groupedResult = record
                    .GroupBy(item => item.Timestamp.Day)
                    .Select(g => new
                    {
                        x = g.Key,
                        y = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue))
                    });

                records.Add(deviceId, groupedResult);
            }

            return Ok(JsonConvert.SerializeObject(records));
        }

        [HttpGet]
        [Route("get_aggregated_1")]
        public async Task<IActionResult> GetAggregatedData(string ownerId, int year, [FromQuery] string[] deviceIds)
        {
            var today = DateTime.Now;
            var firstDay = new DateTime(year, 1, 1);
            var lastDay = today.Year == year ? today : firstDay.AddYears(1).AddDays(-1).AddHours(23).AddMinutes(59);

            var records = new Dictionary<string, IEnumerable<object>>();

            foreach (var deviceId in deviceIds)
            {
                var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, firstDay, lastDay);

                var groupedResult = record
                    .GroupBy(item => item.Timestamp.Month)
                    .Select(g => new
                    {
                        x = g.Key,
                        y = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue))
                    });

                records.Add(deviceId, groupedResult);
            }

            return Ok(JsonConvert.SerializeObject(records));
        }

        [HttpGet]
        [Route("get_aggregated_2")]
        public async Task<IActionResult> GetAggregatedData(string ownerId, [FromQuery] string[] deviceIds)
        {
            var records = new Dictionary<string, IEnumerable<object>>();
            var today = DateTime.Now;

            foreach (var deviceId in deviceIds)
            {
                var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, DateTime.MinValue, today);

                var groupedResult = record
                    .GroupBy(item => item.Timestamp.Year)
                    .Select(g => new
                    {
                        x = g.Key,
                        y = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue))
                    });

                records.Add(deviceId, groupedResult);
            }

            return Ok(JsonConvert.SerializeObject(records));
        }

        [HttpGet]
        [Route("get_device_comparation")]
        public async Task<IActionResult> GetDeviceComparation(string ownerId, long from, long to, [FromQuery] string[] deviceIds)
        {
            var records = new Dictionary<string, IEnumerable<object>>();
            var fromObject = DateTimeOffset.FromUnixTimeSeconds(from).DateTime;
            var toObject = DateTimeOffset.FromUnixTimeSeconds(to).DateTime;

            toObject = (toObject - fromObject) <= TimeSpan.FromDays(1) ? fromObject.AddDays(1) : toObject;

            var total = 0.0;
            var devicesTotal = new List<dynamic>();

            foreach (var deviceId in deviceIds)
            {
                var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, fromObject, toObject);

                var deviceTotal = record.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 2));

                var returnObject = new
                {
                    DeviceId = deviceId,
                    Total = deviceTotal,

                    MaxDay = record
                            .GroupBy(item => item.Timestamp.DayOfYear)
                            .Select(g => new
                            {
                                Date = g.First().Timestamp,
                                Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                            })
                            .MaxBy(item => item.Value).First(),

                    MinDay = record
                            .GroupBy(item => item.Timestamp.DayOfYear)
                            .Select(g => new
                            {
                                Date = g.First().Timestamp,
                                Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                            })
                            .MinBy(item => item.Value).First(),

                    AverageDay = Math.Round(
                            record
                                .GroupBy(item => item.Timestamp.DayOfYear)
                                .Select(g => new
                                {
                                    Day = g.Key,
                                    Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                                })
                                .Average(item => item.Value), 4),

                    MaxHour = record
                            .GroupBy(item => new
                            {
                                Date = item.Timestamp.DayOfYear,
                                Hour = item.Timestamp.Hour
                            })
                            .Select(g => new
                            {
                                Date = g.First().Timestamp,
                                Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                            })
                            .MaxBy(item => item.Value).First(),

                    MinHour = record
                            .GroupBy(item => new
                            {
                                Date = item.Timestamp.DayOfYear,
                                Hour = item.Timestamp.Hour
                            })
                            .Select(g => new
                            {
                                Date = g.First().Timestamp,
                                Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                            })
                            .MinBy(item => item.Value).First(),

                    AverageHour = Math.Round(
                            record
                                .GroupBy(item => new
                                {
                                    Date = item.Timestamp.DayOfYear,
                                    Hour = item.Timestamp.Hour
                                })
                                .Select(g => new
                                {
                                    Hour = g.Key,
                                    Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                                })
                                .Average(item => item.Value), 4)
                };

                devicesTotal.Add(returnObject);

                total += deviceTotal;
                total = Math.Round(total, 4);
            }

            var proportions = devicesTotal
            .Select(item => new
            {
                x = item.DeviceId,
                y = Math.Round((double)(item.Total / total) * 100, 2)
            });

            return Ok(JsonConvert.SerializeObject(new

            {
                Total = total,
                DevicesTotal = devicesTotal,
                DevicesProportions = proportions
            }));
        }

        [HttpGet]
        [Route("get_period_comparation")]
        public async Task<IActionResult> GetDeviceComparation(string ownerId, [FromQuery] string[] periods, [FromQuery] string[] deviceIds)
        {
            var dayAveragePeriods = new List<double>();
            var hourAveragePeriods = new List<double>();
            var totalPeriods = new List<double>();

            foreach (var period in periods)
            {
                var splitValues = period.Split('_');
                var fromObject = DateTimeOffset.FromUnixTimeSeconds(int.Parse(splitValues[0])).DateTime;
                var toObject = DateTimeOffset.FromUnixTimeSeconds(int.Parse(splitValues[1])).DateTime;
                toObject = (toObject - fromObject) <= TimeSpan.FromDays(1) ? fromObject.AddDays(1) : toObject;

                var periodTotal = 0.0;
                var devicesAverageDay = new List<IEnumerable<dynamic>>();
                var devicesAverageHour = new List<IEnumerable<dynamic>>();

                foreach (var deviceId in deviceIds)
                {
                    var record = await _storageManager.GetRangeConsumptionRecordConditional(ownerId, deviceId, fromObject, toObject);

                    periodTotal += record
                                    .Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 2));

                    devicesAverageDay.Add(record
                                    .GroupBy(item => item.Timestamp.DayOfYear)
                                    .Select(g => new
                                    {
                                        Day = g.Key,
                                        Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                                    }));

                    devicesAverageHour.Add(record
                                    .GroupBy(item => new
                                    {
                                        Date = item.Timestamp.DayOfYear,
                                        Hour = item.Timestamp.Hour
                                    })
                                    .Select(g => new
                                    {
                                        DateHour = g.Key,
                                        Value = g.Aggregate(0.0, (total, next) => total + next.Consumption, (finalValue) => Math.Round(finalValue, 4))
                                    }));
                }

                dayAveragePeriods.Add(
                    devicesAverageDay
                        .Select(item => item.Average(innerItem => (double)innerItem.Value))
                        .Average()
                    );

                hourAveragePeriods.Add(
                    devicesAverageHour
                        .Select(deviceGroup => deviceGroup.Average(item => (double)item.Value))
                        .Average()
                    );

                totalPeriods.Add(periodTotal);


            }

            var totalSelected = totalPeriods.Sum();
            var totalPeriodsProportions = totalPeriods.Select(item => item / totalSelected);

            return Ok(new { DayAveragePeriods = dayAveragePeriods, HourAveragePeriods = hourAveragePeriods, TotalPeriods = totalPeriods, TotalPeriodsProportional = totalPeriodsProportions });
        }
    }
}