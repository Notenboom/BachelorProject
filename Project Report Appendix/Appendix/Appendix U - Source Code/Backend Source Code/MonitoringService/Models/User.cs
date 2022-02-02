using Google.Cloud.Firestore;
using MonitoringService.Interfaces;
using System.Collections.Generic;

namespace MonitoringService.Models
{
    [FirestoreData]
    public class User : IUser
    {
        [FirestoreProperty("user_id")]
        public string UserID { get; set; }

        [FirestoreProperty("first_name")]
        public string FirstName { get; set; }

        [FirestoreProperty("last_name")]
        public string LastName { get; set; }

        [FirestoreProperty("email")]
        public string Email { get; set; }

        [FirestoreProperty("gender")]
        public int Gender { get; set; }

        [FirestoreProperty("devices")]
        public List<string> DevicesId { get; set; }


        /// <summary>
        /// Needed for google cloud firestore object creation
        /// </summary>
        public User()
        {

        }
    }
}