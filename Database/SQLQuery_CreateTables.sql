CREATE TABLE UserTypeItem
(
    Id INT PRIMARY KEY,
    Type NVARCHAR(50) NOT NULL UNIQUE
);
GO


CREATE TABLE [User]
(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    RoleId INT NOT NULL,

    CONSTRAINT FK_User_UserTypeItem
        FOREIGN KEY (RoleId) REFERENCES UserTypeItem(Id)
);
GO


CREATE TABLE Course
(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    LecturerId BIGINT NULL,
    Name NVARCHAR(150) NOT NULL,
    ShortDescription NVARCHAR(255) NULL,
    Details NVARCHAR(MAX) NULL,
    EctsScore INT NOT NULL,

    CONSTRAINT FK_Course_User_Lecturer
        FOREIGN KEY (LecturerId) REFERENCES [User](Id),

    CONSTRAINT CK_Course_EctsScore
        CHECK (EctsScore >= 0)
);
GO

CREATE TABLE [Notification]
(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    CreatorId BIGINT NOT NULL,
    CourseId BIGINT NULL,
    Title NVARCHAR(255) NOT NULL,
    [Text] NVARCHAR(MAX) NOT NULL,
    PublishDate DATETIME NOT NULL DEFAULT GETDATE(),
    ExpirationDate DATETIME NOT NULL,

    CONSTRAINT FK_Notification_User_Creator
        FOREIGN KEY (CreatorId) REFERENCES [User](Id),

    CONSTRAINT FK_Notification_Course
        FOREIGN KEY (CourseId) REFERENCES Course(Id),

    CONSTRAINT CK_Notification_Dates
        CHECK (ExpirationDate >= PublishDate)
);
GO


CREATE TABLE StudentCourseItem
(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    StudentId BIGINT NOT NULL,
    CourseId BIGINT NOT NULL,
    EnrolledAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_StudentCourseItem_User_Student
        FOREIGN KEY (StudentId) REFERENCES [User](Id),

    CONSTRAINT FK_StudentCourseItem_Course
        FOREIGN KEY (CourseId) REFERENCES Course(Id),

    CONSTRAINT UQ_StudentCourseItem_Student_Course
        UNIQUE (StudentId, CourseId)
);
GO


CREATE TABLE CourseFiles
(
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    CourseId BIGINT NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    FileLink NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_CourseFiles_Course
        FOREIGN KEY (CourseId) REFERENCES Course(Id)
);
GO