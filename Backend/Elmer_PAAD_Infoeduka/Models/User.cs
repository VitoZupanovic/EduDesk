using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class User
{
    public long Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int RoleId { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual UserTypeItem Role { get; set; } = null!;

    public virtual ICollection<StudentCourseItem> StudentCourseItems { get; set; } = new List<StudentCourseItem>();
}
