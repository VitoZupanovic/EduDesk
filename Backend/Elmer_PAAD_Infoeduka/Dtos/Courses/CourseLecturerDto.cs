using System.ComponentModel.DataAnnotations;

namespace Elmer_PAAD_Infoeduka.Dtos.Courses
{
    public class CourseLecturerDto
    {
        [Range(1, long.MaxValue)]
        public long? LecturerId { get; set; }
    }
}