using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/form-requests")]
    public class FormRequestsController : CrudControllerBase<FormRequests>
    {
        public FormRequestsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminTeacherStudent;

        protected override Guid GetId(FormRequests entity) => entity.Id;
    }
}
