using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/semester-tuitions")]
    public class SemesterTuitionsController : CrudControllerBase<SemesterTuitions>
    {
        public SemesterTuitionsController(ApplicationDbContext context) : base(context) { }

        protected override string[]? ReadRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SemesterTuitions entity) => entity.Id;
    }
}
