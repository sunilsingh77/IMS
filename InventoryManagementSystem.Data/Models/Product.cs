﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryManagementSystem.Data.Models
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        //[Required]
        //[MaxLength(150)]
        //public string Description { get; set; }
        //[Required]
        //public bool OutOfStock { get; set; }
        //[Required]
        //public string ImageUrl { get; set; }
        [Required]
        public double Price { get; set; }

        [Required]
        public int Quantity { get; set; }

    }
}
