using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/evaluation-criterias")]
    public class EvaluationCriteriasController : CrudControllerBase<EvaluationCriterias>
    {
        public EvaluationCriteriasController(ApplicationDbContext context) : base(context) { }

        protected override Guid GetId(EvaluationCriterias entity) => entity.Id;
    }
}
