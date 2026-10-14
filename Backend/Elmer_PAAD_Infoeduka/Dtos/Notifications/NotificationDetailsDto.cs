namespace Elmer_PAAD_Infoeduka.Dtos.Notifications;

public class NotificationDetailsDto
{
    public long Id { get; set; }

    public long CreatorId { get; set; }

    public string CreatorFullName { get; set; } = null!;

    public string CreatorEmail { get; set; } = null!;

    public long? CourseId { get; set; }

    public string? CourseName { get; set; }

    public string Title { get; set; } = null!;

    public string Text { get; set; } = null!;

    public DateTime PublishDate { get; set; }

    public DateTime ExpirationDate { get; set; }
}
