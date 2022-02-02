using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MonitoringService.Controllers;
using MonitoringService.Interfaces;
using MonitoringService.Models;
using Moq;
using System;
using System.Collections.Generic;
using System.Text.Json;
using Xunit;

namespace MonitoringServiceTests.Controllers
{
    public class DataControllerTests
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly Mock<IProcessingScheduler> _processingScheduleMock = new Mock<IProcessingScheduler>();
        private readonly Mock<IStorageManager> _storageManagerMock = new Mock<IStorageManager>();

        public DataControllerTests()
        {
            IServiceCollection services = new ServiceCollection();

            services.AddSingleton(provider => _processingScheduleMock.Object);
            services.AddTransient(provider => _storageManagerMock.Object);

            _serviceProvider = services.BuildServiceProvider();
        }

        [Fact]
        public void IngestData_WhenMessageEmpty()
        {
            // Arrange
            var dataController = new DataController(_serviceProvider.GetRequiredService<IProcessingScheduler>(), _serviceProvider.GetRequiredService<IStorageManager>());
            JsonElement message = new JsonElement();

            // Act
            Action act = () => dataController.IngestData(message);

            // Assert
            act.Should().ThrowExactly<InvalidOperationException>("Operation is not valid due to the current state of the object.");
        }

        [Fact]
        public void IngestData_WhenMessageIncorrect()
        {
            // Arrange
            var dataController = new DataController(_serviceProvider.GetRequiredService<IProcessingScheduler>(), _serviceProvider.GetRequiredService<IStorageManager>());
            JsonElement message = JsonDocument.Parse(@"{""TestItem"": ""testResult""}").RootElement;

            // Act
            Action act = () => dataController.IngestData(message);

            // Assert
            act.Should().ThrowExactly<KeyNotFoundException>("The given key was not present in the dictionary.");
        }

        [Fact]
        public void IngestData_WhenMessageCorrect()
        {
            // Arrange
            var dataController = new DataController(
                                        _serviceProvider.GetRequiredService<IProcessingScheduler>(), 
                                        _serviceProvider.GetRequiredService<IStorageManager>());

            JsonElement message = JsonDocument.Parse(@"{""Message"":{""Data"":[97,110,111,116,104,101,114,32,108,97,115,116,32,105,109,112,111,114,116,97,110,116,32,109,101,115,115,97,103,101],""Attributes"":{},""MessageId"":""{0}"",""PublishTime"":{""Seconds"":{1},""Nanos"":{2}},""OrderingKey"":"""",""TextData"":""{\""DeviceId\"": \""proper_device_id_1\"",\""Consumption\"": 30}""},""Subscription"":""""}").RootElement;

            // Act
            dataController.IngestData(message);

            // Assert
            _processingScheduleMock.Verify(
                mock => mock.ScheduleWork(
                    It.Is<Message>((item) =>
                        item.MessageId.Equals("3240392496288454") &
                        item.PublishTime.Nanos == 417000000 &
                        item.PublishTime.Seconds == 1634928943)),
                Times.Once);
        }
    }
}