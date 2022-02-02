using Google.Cloud.Firestore;
using MonitoringService.Interfaces;
using System;

namespace MonitoringService.Models
{
    [FirestoreData]
    public class Device : IDevice
    {
        [FirestoreProperty("id")]
        public string Id { get; set; }
        [FirestoreProperty("owner_id")]
        public string OwnerID { get; set; }

        [FirestoreProperty("name")]
        public string Name { get; set; }

        [FirestoreProperty("state")]
        public int? State { get; set; }
        [FirestoreProperty("last_state_time")]
        public DateTime? LastStateTime { get; set; }
    }
}