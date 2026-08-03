using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/subject-documents")]
    public class SubjectDocumentsController : CrudControllerBase<SubjectDocuments>
    {
        public SubjectDocumentsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(SubjectDocuments entity) => entity.Id;
    }
}
