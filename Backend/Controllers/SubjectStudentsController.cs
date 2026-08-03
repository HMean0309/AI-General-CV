using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-students")]
    public class SubjectStudentsController : CrudControllerBase<SubjectStudents>
    {
        public SubjectStudentsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectStudents entity) => entity.Id;
    }
}
