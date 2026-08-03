using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/semester-subjects")]
    public class SemesterSubjectsController : CrudControllerBase<SemesterSubjects>
    {
        public SemesterSubjectsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SemesterSubjects entity) => entity.Id;
    }
}
