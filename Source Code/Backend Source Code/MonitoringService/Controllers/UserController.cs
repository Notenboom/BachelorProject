using Microsoft.AspNetCore.Mvc;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;

namespace MonitoringService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IStorageManager _storageManager;

        public UserController(IStorageManager storageManager)
        {
            _storageManager = storageManager;
        }

        [HttpPost]
        [Route("add_user")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            await _storageManager.AddDocumentWithAutoID("users", user);

            return Ok();
        }

        [HttpGet]
        [Route("get_user")]
        public async Task<IActionResult> GetUserById(string userID)
        {
            return Ok(JsonConvert.SerializeObject(await _storageManager.GetDocumentsWhere<User>("users", "user_id", userID)));
        }

        [HttpDelete]
        [Route("delete_user")]
        public async Task<IActionResult> DeleteUserWithId(string userID)
        {
            await _storageManager.DeleteDocumentWhereEqualTo("users", "user_id", userID);
            return Ok();
        }

        [HttpPatch]
        [Route("edit_user")]
        public async Task<IActionResult> EditExistingUser([FromBody] User user)
        {
            if (user.UserID == null)
            {
                return BadRequest("no-user-id");
            }

            await _storageManager.UpdateDocumentWhereEqualTo("users", "user_id", user.UserID, user);

            return Ok();
        }
    }
}