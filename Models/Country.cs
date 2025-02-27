using WebApplication2.Models;

namespace WebApplication2.Models
{
    public class Country
    {
        public int CountryId {  get; set; }
        public required string Name { get; set; }

        //Navigation properties
        public ICollection<Company>? Companies { get; set; }
        public ICollection<Url>? Urls { get; set; }
    }
}