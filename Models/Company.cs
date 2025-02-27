namespace WebApplication2.Models
{
    public class Company
    {
        public int CompanyId { get; set; }
        public string Name { get; set; }
        public int? CountryId { get; set; }
        public int? Established { get; set; }
        public string? Address { get; set; }
        public string? Email  { get; set; }


        //Navigation property for froeign key
        public Country? Country { get; set; }

        public ICollection<Url>? Urls { get; set; }

       


    }
}
