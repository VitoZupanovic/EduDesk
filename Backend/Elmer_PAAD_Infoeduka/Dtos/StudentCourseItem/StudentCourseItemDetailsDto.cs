using System.Runtime.InteropServices.JavaScript;

namespace Elmer_PAAD_Infoeduka.Dtos.StudentCourseItem;

public class StudentCourseItemDetailsDto
{
    public long Id { get; set; }
    public long StudentId { get; set; }
    public string StudentFullName { get; set; }
    public string StudentEmail { get; set; }
    public long CourseId { get; set; }
    public string CourseName { get; set; }
}