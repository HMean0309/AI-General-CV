using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/student-evaluations")]
    public class StudentEvaluationsController : CrudControllerBase<StudentEvaluations>
    {
        public StudentEvaluationsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(StudentEvaluations entity) => entity.Id;
    }
}
