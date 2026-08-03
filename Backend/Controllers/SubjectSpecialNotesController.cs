using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-special-notes")]
    public class SubjectSpecialNotesController : CrudControllerBase<SubjectSpecialNotes>
    {
        public SubjectSpecialNotesController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectSpecialNotes entity) => entity.Id;
    }
}
