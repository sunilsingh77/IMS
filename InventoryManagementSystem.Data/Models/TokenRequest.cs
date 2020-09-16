using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagementSystem.Data.Models
{
    public class TokenRequest
    {
        public string GrantType { get; set; } // password or refresh_token
        public string ClientId { get; set; }
        public string UserName { get; set; }
        public string RefreshToken { get; set; }
        public string Password { get; set; }
    }
}
