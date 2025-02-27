using Microsoft.AspNetCore.Mvc;
using WebApplication2.Data;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Models;

namespace WebApplication2.Controllers
{
    /// <summary>
    /// Controller for managing Url entities.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UrlController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="UrlController"/> class.
        /// </summary>
        /// <param name="context">The application's database context.</param>
        public UrlController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all Urls.
        /// </summary>
        /// <returns>A list of Url entities.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Url>>> GetUrls()
        {
            return await _context.Urls
                .Include(u => u.Company)
                .Include(u => u.Country)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific Url by its value.
        /// </summary>
        /// <param name="id">Find the Url by it's Id.</param>
        /// <returns>The requested Url entity.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Url>> GetUrl(int id)
        {
            var url = await _context.Urls.FindAsync(id);
            if (url == null)
            {
                return NotFound();
            }
            return url;
        }

        /// <summary>
        /// Creates a new Url entity.
        /// </summary>
        /// <param name="url">The Url entity to create.</param>
        /// <returns>The created Url entity.</returns>
        [HttpPost]
        public async Task<ActionResult<Url>> CreateUrl(Url url)
        {
            _context.Urls.Add(url);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUrl), new { id = url.UrlId }, url);
        }


        /// <summary>
        /// Updates an existing Url entity.
        /// </summary>
        /// <param name="id">The Url id (primary key) to update.</param>
        /// <param name="url">The updated Url entity.</param>
        /// <returns>No content if successful, or an error response if not.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUrl(int id, Url url)
        {
            if (id != url.UrlId)
            {
                return BadRequest("Url ID mismatch.");
            }

            _context.Entry(url).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Urls.AnyAsync(u => u.UrlId == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        /// <summary>
        /// Deletes a specific Url entity.
        /// </summary>
        /// <param name="id">The Url id (primary key) to delete.</param>
        /// <returns>No content if successful, or an error response if not.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUrl(int id)
        {
            var url = await _context.Urls.FindAsync(id);
            if (url == null)
            {
                return NotFound();
            }

            _context.Urls.Remove(url);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Checks if a Url entity exists.
        /// </summary>
        /// <param name="id">The Url id (primary key).</param>
        /// <returns>True if the Url exists; otherwise, false.</returns>
        private async Task<bool> UrlExists(int id)
        {
            return await _context.Urls.AnyAsync(u => u.UrlId == id);
        }
    }
}

