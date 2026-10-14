using System.ComponentModel.DataAnnotations;

namespace Elmer_PAAD_Infoeduka.Dtos.CourseFiles;

public class CourseFileDto
{
    [Required]
    public long CourseId { get; set; }

    [Required]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Required]
    public string FileLink { get; set; } = null!;
}
