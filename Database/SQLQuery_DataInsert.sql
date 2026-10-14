use EduDeskDb
go

INSERT INTO UserTypeItem (Id,Type) VALUES 
(1,'Admin'),
(2,'Lecturer'),
(3, 'Student')
go

INSERT INTO [User] (FirstName, LastName, PasswordHash, Email, RoleID) VALUES
('Alice', 'Admin', '$2b$10$7aQJ9gW8YdGfVY8xkYkE3e1nZ5e1uFzqXzY5b8KqT1sWcF9nKpK6W', 'alice.admin@example.com', 1),
('John', 'Smith', '$2b$10$3mKzQp7YfJ2r9sX8aLkDweVZcXb5h9N0kLz8Q1eFvTnWcUoPqR7Sa', 'john.smith@example.com', 2),
('Emma', 'Johnson', '$2b$10$9XkLmN2pQ4rT7vY8zA1bCdeFgHiJkLmNoPqRsTuVwXyZ1234567890', 'emma.johnson@example.com', 2),
('Michael', 'Brown', '$2b$10$B7nFq3dXyZpLk8R2sT9vWcUoPqR7Sa1bCdeFgHiJkLmNoPqRsTuVw', 'michael.brown@example.com', 2),
('Liam', 'Williams', '$2b$10$HkL9pQ2rT7vY8zA1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQp7YfJ2r', 'liam.williams@example.com', 3),
('Olivia', 'Jones', '$2b$10$PqRsTuVwXyZ1234567890B7nFq3dXyZpLk8R2sT9vWcUoPqR7Sa1', 'olivia.jones@example.com', 3),
('Noah', 'Garcia', '$2b$10$Y8zA1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQp7YfJ2r9sX8aLkDwe', 'noah.garcia@example.com', 3),
('Ava', 'Miller', '$2b$10$kLmNoPqRsTuVwXyZ3mKzQp7YfJ2r9sX8aLkDweVZcXb5h9N0kLz8', 'ava.miller@example.com', 3),
('Elijah', 'Davis', '$2b$10$ZpLk8R2sT9vWcUoPqR7Sa1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQ', 'elijah.davis@example.com', 3),
('Sophia', 'Rodriguez', '$2b$10$1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQp7YfJ2r9sX8aLkDweVZcX', 'sophia.rodriguez@example.com', 3),
('James', 'Martinez', '$2b$10$8YkLmN2pQ4rT7vY8zA1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQp7Yf', 'james.martinez@example.com', 3),
('Isabella', 'Hernandez', '$2b$10$5mKzQp7YfJ2r9sX8aLkDweVZcXb5h9N0kLz8Q1eFvTnWcUoPqR7S', 'isabella.hernandez@example.com', 3),
('Benjamin', 'Lopez', '$2b$10$2XkLmN2pQ4rT7vY8zA1bCdeFgHiJkLmNoPqRsTuVwXyZ3mKzQp7Y', 'benjamin.lopez@example.com', 3),
('Mia', 'Gonzalez', '$2b$10$4B7nFq3dXyZpLk8R2sT9vWcUoPqR7Sa1bCdeFgHiJkLmNoPqRsTu', 'mia.gonzalez@example.com', 3)
go


INSERT INTO Course (Name, ShortDescription, LecturerId, Details, EctsScore) VALUES
('Algorithm design and analysis', 'Emphasis on teaching techniques for the design and analysis of efficient algorithms, emphasizing methods of application.', 2, 'Topics include divide-and-conquer, randomization, dynamic programming, greedy algorithms, incremental improvement, complexity, and cryptography.', 7),
('Introduction to numerical analysis', 'This course analyzed the basic techniques for the efficient numerical solution of problems in science and engineering. ', 3, null, 6),
('Introduction to robotics', 'This course provides an overview of robot mechanisms, dynamics, and intelligent controls. ', 4, null, 5)
go

INSERT INTO StudentCourseItem (StudentId, CourseId, EnrolledAt)
VALUES
(5, 1, '2025-07-01 09:15:00'),
(6, 2, '2025-08-03 10:30:00'),
(7, 3, '2025-08-05 08:45:00'),
(8, 1, '2025-08-07 11:20:00'),
(9, 2, '2025-09-10 09:50:00'),
(10, 3, '2025-09-12 12:10:00'),
(11, 1, '2025-09-15 08:00:00'),
(12, 2, '2025-10-18 10:05:00'),
(13, 3, '2025-10-20 09:35:00'),
(14, 1, '2025-10-22 11:55:00');

go

INSERT INTO CourseFiles (CourseId, [Name], FileLink, CreatedAt)
VALUES
(1, 'Lecture1.pdf', '/files/course1/lecture1.pdf', '2025-10-01 09:00:00'),
(1, 'Lecture2.pdf', '/files/course1/lecture2.pdf', '2025-10-05 10:00:00'),
(2, 'Intro.pdf', '/files/course2/intro.pdf', '2025-10-02 11:30:00'),
(2, 'Exercises.pdf', '/files/course2/exercises.pdf', '2025-10-06 12:00:00'),
(3, 'RoboticsBasics.pdf', '/files/course3/robotics_basics.pdf', '2025-10-03 08:45:00'),
(3, 'LabGuide.pdf', '/files/course3/lab_guide.pdf', '2025-10-07 13:15:00');

go

INSERT INTO [Notification] (CreatorId, CourseId, Title, [Text], PublishDate, ExpirationDate)
VALUES
(1, 1, 'Lecture Cancelled', 'Tomorrows lecture is cancelled.', '2025-11-03 08:00:00', '2025-11-04 23:59:00'),
(1, 2, 'Homework Assigned', 'Homework 1 has been published.', '2025-11-05 12:00:00', '2025-11-15 23:59:00'),
(1, 3, 'Project Deadline', 'Project deadline is extended.', '2025-11-06 09:45:00', '2025-11-20 23:59:00'),
(2, 1, 'Exam Announcement', 'Final exam will be held next week.', '2025-11-01 09:00:00', '2025-11-10 23:59:00'),
(3, 2, 'New Materials Uploaded', 'Check the portal for new materials.', '2025-11-02 10:30:00', '2025-11-12 23:59:00'),
(4, 3, 'Lab Session Info', 'Lab groups are now available.', '2025-11-01 11:15:00', '2025-11-10 23:59:00');


