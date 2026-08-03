using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-teaching-teachers")]
    public class SubjectTeachingTeachersController : CrudControllerBase<SubjectTeachingTeachers>
    {
        public SubjectTeachingTeachersController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectTeachingTeachers entity) => entity.Id;
    }
}
