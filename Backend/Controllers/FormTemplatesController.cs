using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/form-templates")]
    public class FormTemplatesController : CrudControllerBase<FormTemplates>
    {
        public FormTemplatesController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(FormTemplates entity) => entity.Id;
    }
}
