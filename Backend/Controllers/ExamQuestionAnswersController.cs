using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/exam-question-answers")]
    public class ExamQuestionAnswersController : CrudControllerBase<ExamQuestionAnswers>
    {
        public ExamQuestionAnswersController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(ExamQuestionAnswers entity) => entity.Id;
    }
}
