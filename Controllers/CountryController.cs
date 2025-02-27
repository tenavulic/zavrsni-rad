using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;


namespace WebApplication2.Controllers
{
    /// <summary>
    /// Controller for managing countries.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CountryController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="CountryController"/> class.
        /// </summary>
        /// <param name="context">The application's database context.</param>
        public CountryController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all countries.
        /// </summary>
        /// <returns>A list of countries.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Country>>> GetCountries()
        {
            return await _context.Countries.ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific country by its ID.
        /// </summary>
        /// <param name="id">The ID of the country.</param>
        /// <returns>The requested country.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Country>> GetCountry(int id)
        {
            var country = await _context.Countries.FindAsync(id);

            if (country == null)
            {
                return NotFound();
            }

            return country;
        }

        /// <summary>
        /// Creates a new country.
        /// </summary>
        /// <param name="country">The country to create.</param>
        /// <returns>The created country.</returns>
        [HttpPost]
        public async Task<ActionResult<Country>> CreateCountry(Country country)
        {
            _context.Countries.Add(country);
            await _context.SaveChangesAsync();

            // Returns a 201 status with a Location header pointing to the new resource.
            return CreatedAtAction(nameof(GetCountry), new { id = country.CountryId }, country);
        }

        /// <summary>
        /// Updates an existing country.
        /// </summary>
        /// <param name="id">The ID of the country to update.</param>
        /// <param name="country">The updated country data.</param>
        /// <returns>No content if successful, or NotFound if the country does not exist.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCountry(int id, Country country)
        {
            if (id != country.CountryId)
            {
                return BadRequest("Country ID mismatch.");
            }

            _context.Entry(country).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await CountryExists(id))
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
        /// Deletes a specific country.
        /// </summary>
        /// <param name="id">The ID of the country to delete.</param>
        /// <returns>No content if successful, or NotFound if the country does not exist.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCountry(int id)
        {
            var country = await _context.Countries.FindAsync(id);
            if (country == null)
            {
                return NotFound();
            }

            _context.Countries.Remove(country);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Checks if a country exists in the database.
        /// </summary>
        /// <param name="id">The ID of the country.</param>
        /// <returns>True if the country exists; otherwise, false.</returns>
        private async Task<bool> CountryExists(int id)
        {
            return await _context.Countries.AnyAsync(c => c.CountryId == id);
        }
    }
}