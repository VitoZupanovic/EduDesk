using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class CourseFile
{
    public long Id { get; set; }

    public long CourseId { get; set; }

    public string Name { get; set; } = null!;

    public string FileLink { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;
}
