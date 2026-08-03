using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/teacher-faculties")]
    public class TeacherFacultiesController : CrudControllerBase<TeacherFaculties>
    {
        public TeacherFacultiesController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(TeacherFaculties entity) => entity.Id;
    }
}
