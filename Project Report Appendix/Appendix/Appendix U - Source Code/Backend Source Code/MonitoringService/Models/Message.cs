namespace MonitoringService.Models
{
    public class Message
    {
        public string MessageId { get; set; }
        public byte[] Data { get; set; }
        public PublishTime PublishTime { get; set; }
        public  object TextData { get; set; }
    }

    public class PublishTime
    {
        public long Seconds { get; set; }
        public long Nanos { get; set; }
    }
}