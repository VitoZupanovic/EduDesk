using System.ComponentModel.DataAnnotations;

namespace Elmer_PAAD_Infoeduka.Dtos.Notifications;

public class NotificationDto
{
    public long? CourseId { get; set; }

    [Required]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    [Required]
    public string Text { get; set; } = null!;

    [Required]
    public DateTime ExpirationDate { get; set; }
}
