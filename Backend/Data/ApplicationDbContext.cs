using Microsoft.EntityFrameworkCore;
using TayDoApi.Models;

namespace TayDoApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<AcademicYears> AcademicYears { get; set; }
        public DbSet<Attendances> Attendances { get; set; }
        public DbSet<AuditLogs> AuditLogs { get; set; }
        public DbSet<EvaluationCriterias> EvaluationCriterias { get; set; }
        public DbSet<ExamAttempts> ExamAttempts { get; set; }
        public DbSet<ExamQuestionAnswers> ExamQuestionAnswers { get; set; }
        public DbSet<ExamQuestionSelections> ExamQuestionSelections { get; set; }
        public DbSet<ExamResults> ExamResults { get; set; }
        public DbSet<Faculties> Faculties { get; set; }
        public DbSet<FormRequests> FormRequests { get; set; }
        public DbSet<FormTemplates> FormTemplates { get; set; }
        public DbSet<Majors> Majors { get; set; }
        public DbSet<PasswordResets> PasswordResets { get; set; }
        public DbSet<QuestionAnswers> QuestionAnswers { get; set; }
        public DbSet<Questions> Questions { get; set; }
        public DbSet<QuestionSuites> QuestionSuites { get; set; }
        public DbSet<Rooms> Rooms { get; set; }
        public DbSet<SemesterPlans> SemesterPlans { get; set; }
        public DbSet<SemesterSubjects> SemesterSubjects { get; set; }
        public DbSet<SemesterTuitions> SemesterTuitions { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<StudentEvaluationDetails> StudentEvaluationDetails { get; set; }
        public DbSet<StudentEvaluations> StudentEvaluations { get; set; }
        public DbSet<Students> Students { get; set; }
        public DbSet<SubjectDocuments> SubjectDocuments { get; set; }
        public DbSet<Subjects> Subjects { get; set; }
        public DbSet<SubjectSchedules> SubjectSchedules { get; set; }
        public DbSet<SubjectSpecialNotes> SubjectSpecialNotes { get; set; }
        public DbSet<SubjectStudents> SubjectStudents { get; set; }
        public DbSet<SubjectTeachingExams> SubjectTeachingExams { get; set; }
        public DbSet<SubjectTeachings> SubjectTeachings { get; set; }
        public DbSet<SubjectTeachingTeachers> SubjectTeachingTeachers { get; set; }
        public DbSet<TeacherFaculties> TeacherFaculties { get; set; }
        public DbSet<UserAnnouncements> UserAnnouncements { get; set; }
        public DbSet<UserDevices> UserDevices { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<UserCvs> UserCvs { get; set; }
        public DbSet<Projects> Projects { get; set; }
        public DbSet<Certificates> Certificates { get; set; }
        public DbSet<GeneratedCVs> GeneratedCVs { get; set; }
    }
}