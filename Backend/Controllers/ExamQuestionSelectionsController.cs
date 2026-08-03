using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/exam-question-selections")]
    public class ExamQuestionSelectionsController : CrudControllerBase<ExamQuestionSelections>
    {
        public ExamQuestionSelectionsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(ExamQuestionSelections entity) => entity.Id;
    }
}
