namespace Elmer_PAAD_Infoeduka.Dtos.Courses
{
    public class CourseDetailsDto
    {
        public long Id { get; set; }

        public long? LecturerId { get; set; }

        public string LecturerFullName { get; set; } = null!;

        public string LecturerEmail { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string? ShortDescription { get; set; }

        public string? Details { get; set; }

        public int EctsScore { get; set; }
    }
}