using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class Notification
{
    public long Id { get; set; }

    public long CreatorId { get; set; }

    public long? CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string Text { get; set; } = null!;

    public DateTime PublishDate { get; set; }

    public DateTime ExpirationDate { get; set; }

    public virtual Course? Course { get; set; }

    public virtual User Creator { get; set; } = null!;
}
