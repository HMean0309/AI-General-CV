using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/exam-attempts")]
    public class ExamAttemptsController : CrudControllerBase<ExamAttempts>
    {
        public ExamAttemptsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminTeacherStudent;

        protected override Guid GetId(ExamAttempts entity) => entity.Id;
    }
}
