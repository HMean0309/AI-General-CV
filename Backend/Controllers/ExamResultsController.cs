using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/exam-results")]
    public class ExamResultsController : CrudControllerBase<ExamResults>
    {
        public ExamResultsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(ExamResults entity) => entity.Id;
    }
}
