using Microsoft.EntityFrameworkCore;
using WebApplication2.Models;

namespace WebApplication2.Data
{
    public class AppDbContext : DbContext 
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        public DbSet <Country> Countries { get; set; }
        public DbSet <Company> Companies { get; set; }
        public DbSet <Url> Urls { get; set; }
        public DbSet <Income> Income { get; set; }

    }

}
