using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

namespace WebApplication2.Controllers
{
    /// <summary>
    /// Controller for managing companies.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="CompanyController"/> class.
        /// </summary>
        /// <param name="context">The application's database context.</param>
        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all companies.
        /// </summary>
        /// <returns>A list of companies.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
        {
            return await _context.Companies                
                .Include(c => c.Country)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific company by its ID.
        /// </summary>
        /// <param name="id">The ID of the company.</param>
        /// <returns>The requested company.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompany(int id)
        {
            
            var company = await _context.Companies
                .Include (c => c.Country)
                .Include (c => c.Urls)
                .FirstOrDefaultAsync(c => c.CompanyId == id);
            

            if (company == null)
            {
                return NotFound();
            }

            return company;
        }

        /// <summary>
        /// Creates a new company.
        /// </summary>
        /// <param name="company">The company to create.</param>
        /// <returns>The created company.</returns>
        [HttpPost]
        public async Task<ActionResult<Company>> CreateCompany(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompany), new { id = company.CompanyId }, company);
        }

        /// <summary>
        /// Updates an existing company.
        /// </summary>
        /// <param name="id">The ID of the company to update.</param>
        /// <param name="company">The updated company data.</param>
        /// <returns>No content if successful, or NotFound if the company does not exist.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(int id, Company company)
        {
            if (id != company.CompanyId)
            {
                return BadRequest("Company ID mismatch.");
            }

            _context.Entry(company).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) 
            {
                if (!await CompanyExists(id))
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
        /// Deletes a specific company.
        /// </summary>
        /// <param name="id">The ID of the company to delete.</param>
        /// <returns>No content if successful, or NotFound if the company does not exist.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Checks if a company exists.
        /// </summary>
        /// <param name="id">The ID of the company.</param>
        /// <returns>True if the company exists; otherwise, false.</returns>
        private async Task<bool> CompanyExists(int id)
        {
            return await _context.Companies.AnyAsync(c => c.CompanyId == id);
        }
    }
}