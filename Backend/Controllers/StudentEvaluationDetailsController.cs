using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/student-evaluation-details")]
    public class StudentEvaluationDetailsController : CrudControllerBase<StudentEvaluationDetails>
    {
        public StudentEvaluationDetailsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(StudentEvaluationDetails entity) => entity.Id;
    }
}
