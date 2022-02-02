using Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using MonitoringService.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonitoringService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly IStorageManager _storageManager;
        private readonly ILogger<DeviceController> _logger;
        private readonly IOptions<AppConfigurations> _appConfigurations;

        public DeviceController(IStorageManager storageManager, ILogger<DeviceController> logger, IOptions<AppConfigurations> appConfigurations)
        {
            _storageManager = storageManager;
            _logger = logger;
            _appConfigurations = appConfigurations;
        }

        [HttpGet]
        [Route("get_device")]
        public async Task<IActionResult> GetDevice(string userId)
        {
            var devices = await _storageManager.GetDocumentsWhere<Device>("devices", "owner_id", userId);

            if (devices.Count <= 0)
            {
                return Ok(JsonConvert.SerializeObject(devices));
            }

            var cloudRegion = "europe-west1";
            var registryId = "PoC_Registry";

            var cloudIot = GoogleCloudUtilities.CreateAuthorizedClient();

            foreach (var device in devices)
            {
                var name = $"projects/{GoogleCloudUtilities.GetProjectId()}/locations/{cloudRegion}/registries/{registryId}/devices/{device.Id}";

                try
                {
                    var deviceState = await cloudIot.Projects.Locations.Registries.Devices.Get(name).ExecuteAsync();
                    var errorTime = deviceState.LastErrorTime == null ? DateTime.MinValue : DateTime.Parse((string)deviceState.LastErrorTime).ToUniversalTime();
                    var stateTime = deviceState.LastStateTime == null ? DateTime.MinValue : (DateTime)deviceState.LastStateTime;

                    if (stateTime > errorTime)
                    {
                        device.LastStateTime = stateTime;
                        device.State = 0;
                    }
                    else if(deviceState.LastErrorStatus == null)
                    {
                        device.State = -1;
                    }
                    else if (deviceState.LastErrorStatus.Message.Contains("broke or was closed by the client"))
                    {
                        device.LastStateTime = errorTime;
                        device.State = 1;
                    }
                    else
                    {
                        device.State = -1;
                    }
                }
                catch (GoogleApiException ex)
                {
                    _logger.LogError($"Tried fetching device {device.Id} state, but encountered an error.\nError:{ex.Message}\nStackTrace:{ex.StackTrace}");
                    device.State = -1;
                }
            }

            return Ok(JsonConvert.SerializeObject(devices));
        }

        [HttpPost]
        [Route("register_device")]
        public async Task<IActionResult> RegisterNewDevice([FromBody] Device device)
        {
            var devices = await _storageManager.GetDocumentsWhere<Device>("devices", "id", device.Id);

            if (devices.Where(device => device.Id.Equals(device.Id) && device.OwnerID.Equals(device.OwnerID)).Any())
            {
                return BadRequest("device-already-registered");
            }
            else if (devices.Where(device => device.Id.Equals(device.Id) && !device.OwnerID.Equals(device.OwnerID)).Any())
            {
                return BadRequest("device-registerd-with-another-user");
            }

            var users = await _storageManager.GetDocumentsWhere<User>("users", "user_id", device.OwnerID);

            if (users.Count() <= 0)
            {
                return BadRequest("no-such-user");
            }

            var user = users.FirstOrDefault();

            user.DevicesId.Add(device.Id);

            var cloudRegion = "europe-west1";
            var registryId = "PoC_Registry";

            var cloudIot = GoogleCloudUtilities.CreateAuthorizedClient();
            var parent = $"projects/{GoogleCloudUtilities.GetProjectId()}/locations/{cloudRegion}/registries/{registryId}";

            try
            {
                var keyText = _appConfigurations.Value.PublicKey;
                var body = new Google.Apis.CloudIot.v1.Data.Device()
                {
                    Id = device.Id
                };

                body.Credentials = new List<Google.Apis.CloudIot.v1.Data.DeviceCredential>
                {
                    new Google.Apis.CloudIot.v1.Data.DeviceCredential()
                    {
                        PublicKey = new Google.Apis.CloudIot.v1.Data.PublicKeyCredential()
                        {
                            Key = keyText,
                            Format = "RSA_PEM"
                        },
                    }
                };

                var newDevice = await cloudIot.Projects.Locations.Registries.Devices.Create(body, parent).ExecuteAsync();
            }
            catch (GoogleApiException e)
            {
                _logger.LogError($"Tried registering a new device but encountered an error.\nError: {e.Message}\nStackTrace: {e.StackTrace}");
                return StatusCode(500);
            }

            await _storageManager.AddDocumentWithAutoID("devices", new Device()
            {
                Id = device.Id,
                OwnerID = device.OwnerID,
                Name = device.Name
            });

            await _storageManager.UpdateDocumentWhereEqualTo("users", "user_id", device.OwnerID, user);

            return Ok();
        }
    }
}