using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class Course
{
    public long Id { get; set; }

    public long? LecturerId { get; set; }

    public string Name { get; set; } = null!;

    public string? ShortDescription { get; set; }

    public string? Details { get; set; }

    public int EctsScore { get; set; }

    public virtual ICollection<CourseFile> CourseFiles { get; set; } = new List<CourseFile>();

    public virtual User Lecturer { get; set; } = null!;

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<StudentCourseItem> StudentCourseItems { get; set; } = new List<StudentCourseItem>();
}
