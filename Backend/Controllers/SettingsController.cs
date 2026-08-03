using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/settings")]
    public class SettingsController : CrudControllerBase<Settings>
    {
        public SettingsController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(Settings entity) => entity.Id;
    }
}
