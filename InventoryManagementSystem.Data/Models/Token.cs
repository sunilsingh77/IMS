using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagementSystem.Data.Models
{
    public class Token
    {
        [Key]
        public int Id { get; set; }

        // The ClientId, where it comes from
        [Required]
        public string ClientId { get; set; }

        // Value of the Token
        [Required]
        public string Value { get; set; }

        // Get the Token Creation Date
        [Required]
        public DateTime CreatedDate { get; set; }

        [Required]
        public DateTime LastModifiedDate { get; set; }

        [Required]
        public DateTime ExpiryTime { get; set; }

        // The UserId it was issued to
        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
}
