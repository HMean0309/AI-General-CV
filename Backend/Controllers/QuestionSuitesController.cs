using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/question-suites")]
    public class QuestionSuitesController : CrudControllerBase<QuestionSuites>
    {
        public QuestionSuitesController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(QuestionSuites entity) => entity.Id;
    }
}
