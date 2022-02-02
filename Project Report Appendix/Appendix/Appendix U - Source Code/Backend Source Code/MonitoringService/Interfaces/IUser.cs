using System.Collections.Generic;

namespace MonitoringService.Interfaces
{
    public interface IUser
    {
        string UserID { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }
        string Email { get; set; }
        int Gender { get; set; }
        List<string> DevicesId { get; set; }
    }
}