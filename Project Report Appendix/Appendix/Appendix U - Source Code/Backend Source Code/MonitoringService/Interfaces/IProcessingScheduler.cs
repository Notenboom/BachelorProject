using MonitoringService.Models;
using System;
using System.Threading.Tasks;

namespace MonitoringService.Interfaces
{
    public interface IProcessingScheduler
    {

        /// <summary>
        /// Takes an incoming event and schedules it to the according queue based on the type
        /// </summary>
        /// <param name="message"></param>
        /// <param name="timestamp"></param>
        /// <returns></returns>
        Task ScheduleWork(Message message);
    }
}