namespace Elmer_PAAD_Infoeduka.Dtos.CourseFiles;

public class CourseFileDetailsDto
{
    public long Id { get; set; }

    public long CourseId { get; set; }

    public string CourseName { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string FileLink { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
