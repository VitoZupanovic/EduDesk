using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.JavaScript;

namespace Elmer_PAAD_Infoeduka.Dtos.StudentCourseItem;

public class StudentCourseItemDto
{
    [Required]
    public long StudentId { get; set; }
    
    [Required]
    public long CourseId { get; set; }
}