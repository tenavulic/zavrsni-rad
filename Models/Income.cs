using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication2.Models
{
    [Table("Income")]
    public class Income

    {
        public int IncomeId { get; set; }
        public int CompanyId { get; set; }
        public int Year { get; set; }
        public decimal? Amount  { get; set; }

        //Navigation property for foreign key
        public Company? Company { get; set; }
        
       

  
    }
}



