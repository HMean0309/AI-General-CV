using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/question-answers")]
    public class QuestionAnswersController : CrudControllerBase<QuestionAnswers>
    {
        public QuestionAnswersController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(QuestionAnswers entity) => entity.Id;
    }
}
