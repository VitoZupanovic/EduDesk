using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class StudentCourseItem
{
    public long Id { get; set; }

    public long StudentId { get; set; }

    public long CourseId { get; set; }

    public DateTime EnrolledAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual User Student { get; set; } = null!;
}
