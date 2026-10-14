using System;
using System.Collections.Generic;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class UserTypeItem
{
    public int Id { get; set; }

    public string Type { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
