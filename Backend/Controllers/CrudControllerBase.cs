using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Authorization;
using TayDoApi.Data;

namespace TayDoApi.Controllers
{
    /// <summary>
    /// Controller CRUD dùng chung cho mọi entity: GET (có phân trang), GET by id, POST, PUT, DELETE.
    /// Mỗi entity chỉ cần kế thừa lớp này (xem các file Controllers/*Controller.cs).
    /// Yêu cầu JWT hợp lệ (đăng nhập qua api/auth/login) cho mọi endpoint.
    ///
    /// Phân quyền: override <see cref="ReadRoles"/> / <see cref="WriteRoles"/> ở lớp con để giới hạn
    /// theo Role. Để null nghĩa là "bất kỳ ai đã đăng nhập đều được" (áp dụng mặc định cho Read).
    /// </summary>
    [ApiController]
    [Authorize]
    public abstract class CrudControllerBase<TEntity> : ControllerBase where TEntity : class
    {
        protected readonly ApplicationDbContext _context;

        protected CrudControllerBase(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>Role được phép GET (đọc dữ liệu). Null = mọi user đã đăng nhập.</summary>
        protected virtual string[]? ReadRoles => null;

        /// <summary>Role được phép POST/PUT/DELETE (ghi dữ liệu). Mặc định chỉ Admin.</summary>
        protected virtual string[] WriteRoles => Roles.AdminOnly;

        private bool HasRole(string[]? allowedRoles)
        {
            if (allowedRoles == null) return true;
            return allowedRoles.Any(r => User.IsInRole(r));
        }

        // GET api/xxx?page=1&pageSize=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TEntity>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (!HasRole(ReadRoles)) return Forbid();

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 500) pageSize = 50;

            var query = _context.Set<TEntity>().AsNoTracking();

            // --- Lọc dữ liệu động theo Query Parameters ---
            var properties = typeof(TEntity).GetProperties();
            foreach (var queryParam in Request.Query)
            {
                var key = queryParam.Key;
                if (key.Equals("page", StringComparison.OrdinalIgnoreCase) || 
                    key.Equals("pageSize", StringComparison.OrdinalIgnoreCase))
                    continue;

                var prop = properties.FirstOrDefault(p => p.Name.Equals(key, StringComparison.OrdinalIgnoreCase));
                if (prop != null)
                {
                    var valStr = queryParam.Value.ToString();
                    if (!string.IsNullOrEmpty(valStr))
                    {
                        try
                        {
                            var propType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

                            if (propType == typeof(Guid))
                            {
                                var guidVal = Guid.Parse(valStr);
                                query = query.Where(e => EF.Property<Guid>(e, prop.Name) == guidVal);
                            }
                            else if (propType == typeof(int))
                            {
                                var intVal = int.Parse(valStr);
                                query = query.Where(e => EF.Property<int>(e, prop.Name) == intVal);
                            }
                            else if (propType == typeof(bool))
                            {
                                var boolVal = bool.Parse(valStr);
                                query = query.Where(e => EF.Property<bool>(e, prop.Name) == boolVal);
                            }
                            else if (propType == typeof(string))
                            {
                                query = query.Where(e => EF.Property<string>(e, prop.Name) == valStr);
                            }
                        }
                        catch
                        {
                            // Bỏ qua nếu lỗi parse
                        }
                    }
                }
            }

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            Response.Headers["X-Total-Count"] = total.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(items);
        }

        // GET api/xxx/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<TEntity>> GetById(Guid id)
        {
            if (!HasRole(ReadRoles)) return Forbid();

            var entity = await _context.Set<TEntity>().FindAsync(id);
            if (entity == null) return NotFound();
            return Ok(entity);
        }

        // POST api/xxx
        [HttpPost]
        public async Task<ActionResult<TEntity>> Create([FromBody] TEntity entity)
        {
            if (!HasRole(WriteRoles)) return Forbid();

            _context.Set<TEntity>().Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = GetId(entity) }, entity);
        }

        // PUT api/xxx/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] TEntity entity)
        {
            if (!HasRole(WriteRoles)) return Forbid();
            if (id != GetId(entity)) return BadRequest("Id trong route không khớp với Id trong body.");

            _context.Entry(entity).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Set<TEntity>().FindAsync(id);
                if (exists == null) return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE api/xxx/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!HasRole(WriteRoles)) return Forbid();

            var entity = await _context.Set<TEntity>().FindAsync(id);
            if (entity == null) return NotFound();

            _context.Set<TEntity>().Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Mỗi entity phải khai báo cách lấy khóa chính Id (Guid) của nó.</summary>
        protected abstract Guid GetId(TEntity entity);
    }
}
