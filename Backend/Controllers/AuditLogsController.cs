using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/audit-logs")]
    public class AuditLogsController : CrudControllerBase<AuditLogs>
    {
        public AuditLogsController(ApplicationDbContext context) : base(context) { }

        protected override string[]? ReadRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(AuditLogs entity) => entity.Id;
    }
}
