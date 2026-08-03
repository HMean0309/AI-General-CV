using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-teaching-exams")]
    public class SubjectTeachingExamsController : CrudControllerBase<SubjectTeachingExams>
    {
        public SubjectTeachingExamsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectTeachingExams entity) => entity.Id;
    }
}
