using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/majors")]
    public class MajorsController : CrudControllerBase<Majors>
    {
        public MajorsController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(Majors entity) => entity.Id;
    }
}
