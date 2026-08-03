using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/rooms")]
    public class RoomsController : CrudControllerBase<Rooms>
    {
        public RoomsController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(Rooms entity) => entity.Id;
    }
}
