using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/semester-plans")]
    public class SemesterPlansController : CrudControllerBase<SemesterPlans>
    {
        public SemesterPlansController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(SemesterPlans entity) => entity.Id;
    }
}
