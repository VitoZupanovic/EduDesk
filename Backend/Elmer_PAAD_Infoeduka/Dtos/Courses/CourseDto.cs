using System.ComponentModel.DataAnnotations;

namespace Elmer_PAAD_Infoeduka.Dtos.Courses
{
    public class CourseDto
    {
        public long Id { get; set; }

        [Range(1, long.MaxValue)]
        public long? LecturerId { get; set; }

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = null!;

        [StringLength(255)]
        public string? ShortDescription { get; set; }

        public string? Details { get; set; }

        [Range(0, int.MaxValue)]
        public int EctsScore { get; set; }
    }
}