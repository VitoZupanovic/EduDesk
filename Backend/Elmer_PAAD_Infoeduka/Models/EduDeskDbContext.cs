using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Models;

public partial class EduDeskDbContext : DbContext
{
    public EduDeskDbContext()
    {
    }

    public EduDeskDbContext(DbContextOptions<EduDeskDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseFile> CourseFiles { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<StudentCourseItem> StudentCourseItems { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserTypeItem> UserTypeItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConn");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Course__3214EC07ADB793FC");

            entity.ToTable("Course");

            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.ShortDescription).HasMaxLength(255);

            entity.HasOne(d => d.Lecturer).WithMany(p => p.Courses)
                .HasForeignKey(d => d.LecturerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Course_User_Lecturer");
        });

        modelBuilder.Entity<CourseFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CourseFi__3214EC07D50C171D");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(d => d.Course).WithMany(p => p.CourseFiles)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CourseFiles_Course");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notifica__3214EC07B2A8AA4F");

            entity.ToTable("Notification");

            entity.Property(e => e.ExpirationDate).HasColumnType("datetime");
            entity.Property(e => e.PublishDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Course).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Notification_Course");

            entity.HasOne(d => d.Creator).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.CreatorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notification_User_Creator");
        });

        modelBuilder.Entity<StudentCourseItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StudentC__3214EC073E8E68C2");

            entity.ToTable("StudentCourseItem");

            entity.HasIndex(e => new { e.StudentId, e.CourseId }, "UQ_StudentCourseItem_Student_Course").IsUnique();

            entity.Property(e => e.EnrolledAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Course).WithMany(p => p.StudentCourseItems)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_StudentCourseItem_Course");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentCourseItems)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_StudentCourseItem_User_Student");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC0728EE42F1");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "UQ__User__A9D10534F7DA4DEE").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_User_UserTypeItem");
        });

        modelBuilder.Entity<UserTypeItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserType__3214EC07D8535AC2");

            entity.ToTable("UserTypeItem");

            entity.HasIndex(e => e.Type, "UQ__UserType__F9B8A48B93D95501").IsUnique();

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Type).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
