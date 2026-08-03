using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-schedules")]
    public class SubjectSchedulesController : CrudControllerBase<SubjectSchedules>
    {
        public SubjectSchedulesController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectSchedules entity) => entity.Id;
    }
}
