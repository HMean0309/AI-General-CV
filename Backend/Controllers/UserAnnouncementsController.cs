using Microsoft.AspNetCore.Mvc;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [Route("api/user-announcements")]
    public class UserAnnouncementsController : CrudControllerBase<UserAnnouncements>
    {
        public UserAnnouncementsController(ApplicationDbContext context) : base(context) { }

        protected override string[] WriteRoles => Roles.AdminAndTeacher;

        protected override Guid GetId(UserAnnouncements entity) => entity.Id;
    }
}
