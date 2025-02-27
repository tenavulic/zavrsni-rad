using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

namespace WebApplication2.Controllers
{
    /// <summary>
    /// Controller for managing Income records.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class IncomeController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="IncomeController"/> class.
        /// </summary>
        /// <param name="context">The application's database context.</param>
        public IncomeController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all Income records
        /// </summary>
        /// <returns>A list of Income entities.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
        {
            return await _context.Income.ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific Income record by its ID.
        /// </summary>
        /// <param name="id">The ID of the Income record.</param>
        /// <returns>The requested Income entity.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Income>> GetIncome(int id)
        {
            var income = await _context.Income.FindAsync(id);
            if (income == null)
            {
                return NotFound();
            }
            return income;
        }

        /// <summary>
        /// Creates a new Income record.
        /// </summary>
        /// <param name="income">The Income entity to create.</param>
        /// <returns>The created Income entity.</returns>
        [HttpPost]
        public async Task<ActionResult<Income>> CreateIncome(Income income)
        {
            _context.Income.Add(income);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetIncome), new { id = income.IncomeId }, income);
        }

        /// <summary>
        /// Updates an existing Income record.
        /// </summary>
        /// <param name="id">The ID of the Income record to update.</param>
        /// <param name="income">The updated Income entity.</param>
        /// <returns>No content if successful, or an error response if not.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncome(int id, Income income)
        {
            if (id != income.IncomeId)
            {
                return BadRequest("Income ID mismatch.");
            }

            _context.Entry(income).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await IncomeExists(id))
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
        /// Deletes a specific Income record.
        /// </summary>
        /// <param name="id">The ID of the Income record to delete.</param>
        /// <returns>No content if successful, or an error response if not.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            var income = await _context.Income.FindAsync(id);
            if (income == null)
            {
                return NotFound();
            }

            _context.Income.Remove(income);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Checks if an Income record exists.
        /// </summary>
        /// <param name="id">The ID of the Income record.</param>
        /// <returns>True if the record exists; otherwise, false.</returns>
        private async Task<bool> IncomeExists(int id)
        {
            return await _context.Income.AnyAsync(i => i.IncomeId == id);
        }
    }
}
