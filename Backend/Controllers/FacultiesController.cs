using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/faculties")]
    public class FacultiesController : CrudControllerBase<Faculties>
    {
        public FacultiesController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(Faculties entity) => entity.Id;
    }
}
