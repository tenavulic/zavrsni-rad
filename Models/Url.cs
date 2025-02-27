using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models

{
    public class Url
    {
        [Key]
        public int UrlId { get; set; }

        [Column("Url")]
        public required string Link { get; set; }

        //Foreign keys
        public int CompanyId { get; set; }
        public int CountryId { get; set; }

        //Navigation properties
        public Company? Company { get; set; }
        public Country? Country { get; set; }
    }
}
