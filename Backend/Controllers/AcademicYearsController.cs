using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/academic-years")]
    public class AcademicYearsController : CrudControllerBase<AcademicYears>
    {
        public AcademicYearsController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(AcademicYears entity) => entity.Id;
    }
}
