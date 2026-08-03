using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-teachings")]
    public class SubjectTeachingsController : CrudControllerBase<SubjectTeachings>
    {
        public SubjectTeachingsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectTeachings entity) => entity.Id;
    }
}
