using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/user-devices")]
    public class UserDevicesController : CrudControllerBase<UserDevices>
    {
        public UserDevicesController(ApplicationDbContext context) : base(context) { }

        protected override string[]? ReadRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(UserDevices entity) => entity.Id;
    }
}
