using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/students")]
    public class StudentsController : CrudControllerBase<Students>
    {
        public StudentsController(ApplicationDbContext context) : base(context) { }

        protected override string[]? ReadRoles => null;

        protected override Guid GetId(Students entity) => entity.Id;
    }
}
