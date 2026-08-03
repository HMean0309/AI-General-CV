using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/password-resets")]
    public class PasswordResetsController : CrudControllerBase<PasswordResets>
    {
        public PasswordResetsController(ApplicationDbContext context) : base(context) { }

        protected override string[]? ReadRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(PasswordResets entity) => entity.Id;
    }
}
