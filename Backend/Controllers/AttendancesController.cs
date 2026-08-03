using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/attendances")]
    public class AttendancesController : CrudControllerBase<Attendances>
    {
        public AttendancesController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(Attendances entity) => entity.Id;
    }
}
