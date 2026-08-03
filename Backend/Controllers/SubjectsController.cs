using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subjects")]
    public class SubjectsController : CrudControllerBase<Subjects>
    {
        public SubjectsController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(Subjects entity) => entity.Id;
    }
}
