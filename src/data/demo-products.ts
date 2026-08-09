import { Product } from "@/types/product";

export const INITIAL_PRODUCTS: Product[] = [
  { id: "prod-1", name: "Royal Oak Chronograph Gold", category: "Watches", sku: "LUX-W-001", barcode: "890123456001", price: 24500, costPrice: 18000, stock: 2, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-10" },
  { id: "prod-2", name: "Nautilus Steel Blue Dial", category: "Watches", sku: "LUX-W-002", barcode: "890123456002", price: 32000, costPrice: 24000, stock: 1, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-12" },
  { id: "prod-3", name: "Submariner Date Black Cerachrom", category: "Watches", sku: "LUX-W-003", barcode: "890123456003", price: 14500, costPrice: 10500, stock: 8, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-15" },
  { id: "prod-4", name: "Daytona Rose Gold Oysterflex", category: "Watches", sku: "LUX-W-004", barcode: "890123456004", price: 28500, costPrice: 21000, stock: 3, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-18" },
  { id: "prod-5", name: "Speedmaster Professional Moonwatch", category: "Watches", sku: "LUX-W-005", barcode: "890123456005", price: 6800, costPrice: 5000, stock: 12, minStockAlert: 4, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-20" },
  { id: "prod-6", name: "Santos de Cartier Large Model", category: "Watches", sku: "LUX-W-006", barcode: "890123456006", price: 7400, costPrice: 5500, stock: 5, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-22" },
  { id: "prod-7", name: "Reverso Tribute Small Seconds", category: "Watches", sku: "LUX-W-007", barcode: "890123456007", price: 9200, costPrice: 7000, stock: 4, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-25" },
  { id: "prod-8", name: "Overseas Automatic Dual Time", category: "Watches", sku: "LUX-W-008", barcode: "890123456008", price: 22800, costPrice: 17000, stock: 2, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "9101", createdAt: "2026-01-28" },

  { id: "prod-9", name: "Solitaire Diamond Ring 1.5 Carat", category: "Jewelry", sku: "LUX-J-001", barcode: "890123456009", price: 18500, costPrice: 13000, stock: 5, minStockAlert: 2, unit: "pcs", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-01" },
  { id: "prod-10", name: "Kashmir Sapphire Gold Necklace", category: "Jewelry", sku: "LUX-J-002", barcode: "890123456010", price: 12400, costPrice: 9000, stock: 3, minStockAlert: 2, unit: "pcs", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-03" },
  { id: "prod-11", name: "Emerald Cut Platinum Studs", category: "Jewelry", sku: "LUX-J-003", barcode: "890123456011", price: 4500, costPrice: 3200, stock: 15, minStockAlert: 5, unit: "pair", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-05" },
  { id: "prod-12", name: "Temple Art Kundan Choker", category: "Jewelry", sku: "LUX-J-004", barcode: "890123456012", price: 9800, costPrice: 7200, stock: 6, minStockAlert: 2, unit: "pcs", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-08" },
  { id: "prod-13", name: "Baguette Cut Tennis Bracelet", category: "Jewelry", sku: "LUX-J-005", barcode: "890123456013", price: 6200, costPrice: 4400, stock: 10, minStockAlert: 3, unit: "pcs", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-10" },
  { id: "prod-14", name: "South Sea Pearl Drop Earrings", category: "Jewelry", sku: "LUX-J-006", barcode: "890123456014", price: 3400, costPrice: 2300, stock: 14, minStockAlert: 4, unit: "pair", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-12" },
  { id: "prod-15", name: "Rose Gold Love Bangle", category: "Jewelry", sku: "LUX-J-007", barcode: "890123456015", price: 7800, costPrice: 5800, stock: 2, minStockAlert: 3, unit: "pcs", taxRate: 3, hsnCode: "7113", createdAt: "2026-02-14" },

  { id: "prod-16", name: "Togo Leather Birkin 30 Gold", category: "Handbags", sku: "LUX-H-001", barcode: "890123456016", price: 16500, costPrice: 11000, stock: 1, minStockAlert: 2, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-15" },
  { id: "prod-17", name: "Clemence Kelly 28 Noir", category: "Handbags", sku: "LUX-H-002", barcode: "890123456017", price: 14200, costPrice: 9800, stock: 2, minStockAlert: 2, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-16" },
  { id: "prod-18", name: "Classic Flap Medium Lambskin", category: "Handbags", sku: "LUX-H-003", barcode: "890123456018", price: 9500, costPrice: 6800, stock: 4, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-18" },
  { id: "prod-19", name: "Lady Dior Cannage Calfskin", category: "Handbags", sku: "LUX-H-004", barcode: "890123456019", price: 5800, costPrice: 4000, stock: 7, minStockAlert: 3, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-20" },
  { id: "prod-20", name: "Monogram Canvas Speedy Bandoulière", category: "Handbags", sku: "LUX-H-005", barcode: "890123456020", price: 2450, costPrice: 1700, stock: 18, minStockAlert: 5, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-22" },
  { id: "prod-21", name: "Intrecciato Leather Tote", category: "Handbags", sku: "LUX-H-006", barcode: "890123456021", price: 3800, costPrice: 2600, stock: 9, minStockAlert: 4, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-02-25" },

  { id: "prod-22", name: "Creed Aventus Eau de Parfum 100ml", category: "Fragrances", sku: "LUX-F-001", barcode: "890123456022", price: 480, costPrice: 290, stock: 25, minStockAlert: 8, unit: "pcs", taxRate: 18, hsnCode: "3303", createdAt: "2026-03-01" },
  { id: "prod-23", name: "Baccarat Rouge 540 Extrait 70ml", category: "Fragrances", sku: "LUX-F-002", barcode: "890123456023", price: 620, costPrice: 380, stock: 18, minStockAlert: 6, unit: "pcs", taxRate: 18, hsnCode: "3303", createdAt: "2026-03-02" },
  { id: "prod-24", name: "Tom Ford Private Blend Oud Wood", category: "Fragrances", sku: "LUX-F-003", barcode: "890123456024", price: 420, costPrice: 250, stock: 30, minStockAlert: 10, unit: "pcs", taxRate: 18, hsnCode: "3303", createdAt: "2026-03-04" },
  { id: "prod-25", name: "Roja Parfums Elysium Pour Homme", category: "Fragrances", sku: "LUX-F-004", barcode: "890123456025", price: 390, costPrice: 230, stock: 16, minStockAlert: 5, unit: "pcs", taxRate: 18, hsnCode: "3303", createdAt: "2026-03-06" },
  { id: "prod-26", name: "Clive Christian No. 1 Imperial", category: "Fragrances", sku: "LUX-F-005", barcode: "890123456026", price: 850, costPrice: 520, stock: 8, minStockAlert: 4, unit: "pcs", taxRate: 18, hsnCode: "3303", createdAt: "2026-03-08" },

  { id: "prod-27", name: "Aviator Gold Frame Polarized", category: "Eyewear", sku: "LUX-E-001", barcode: "890123456027", price: 480, costPrice: 280, stock: 22, minStockAlert: 6, unit: "pcs", taxRate: 12, hsnCode: "9004", createdAt: "2026-03-10" },
  { id: "prod-28", name: "Square Oversized Acetate Frames", category: "Eyewear", sku: "LUX-E-002", barcode: "890123456028", price: 520, costPrice: 310, stock: 15, minStockAlert: 5, unit: "pcs", taxRate: 12, hsnCode: "9004", createdAt: "2026-03-12" },
  { id: "prod-29", name: "Titanium Rimless Prescription Frame", category: "Eyewear", sku: "LUX-E-003", barcode: "890123456029", price: 680, costPrice: 420, stock: 11, minStockAlert: 4, unit: "pcs", taxRate: 12, hsnCode: "9004", createdAt: "2026-03-14" },

  { id: "prod-30", name: "Handcrafted Pashmina Shawl Gold Zari", category: "Apparel", sku: "LUX-A-001", barcode: "890123456030", price: 1800, costPrice: 1100, stock: 14, minStockAlert: 5, unit: "pcs", taxRate: 5, hsnCode: "6214", createdAt: "2026-03-15" },
  { id: "prod-31", name: "Pure Banarasi Silk Saree Crimson", category: "Apparel", sku: "LUX-A-002", barcode: "890123456031", price: 2850, costPrice: 1750, stock: 9, minStockAlert: 4, unit: "pcs", taxRate: 5, hsnCode: "5007", createdAt: "2026-03-16" },
  { id: "prod-32", name: "Italian Wool Tuxedo Suit Custom", category: "Apparel", sku: "LUX-A-003", barcode: "890123456032", price: 3400, costPrice: 2100, stock: 6, minStockAlert: 3, unit: "set", taxRate: 12, hsnCode: "6203", createdAt: "2026-03-18" },
  { id: "prod-33", name: "Mulberry Silk Print Scarf", category: "Apparel", sku: "LUX-A-004", barcode: "890123456033", price: 540, costPrice: 320, stock: 28, minStockAlert: 8, unit: "pcs", taxRate: 5, hsnCode: "6214", createdAt: "2026-03-20" },

  { id: "prod-34", name: "Leather Formal Oxford Shoes", category: "Footwear", sku: "LUX-S-001", barcode: "890123456034", price: 1250, costPrice: 780, stock: 12, minStockAlert: 4, unit: "pair", taxRate: 18, hsnCode: "6403", createdAt: "2026-03-22" },
  { id: "prod-35", name: "Suede Driver Loafers Navy", category: "Footwear", sku: "LUX-S-002", barcode: "890123456035", price: 890, costPrice: 540, stock: 19, minStockAlert: 5, unit: "pair", taxRate: 18, hsnCode: "6403", createdAt: "2026-03-24" },
  { id: "prod-36", name: "Embellished Silk Heels Gold", category: "Footwear", sku: "LUX-S-003", barcode: "890123456036", price: 1450, costPrice: 890, stock: 7, minStockAlert: 3, unit: "pair", taxRate: 18, hsnCode: "6404", createdAt: "2026-03-25" },

  { id: "prod-37", name: "Alligator Leather Bi-Fold Wallet", category: "Accessories", sku: "LUX-AC-001", barcode: "890123456037", price: 680, costPrice: 390, stock: 35, minStockAlert: 10, unit: "pcs", taxRate: 18, hsnCode: "4202", createdAt: "2026-03-26" },
  { id: "prod-38", name: "Sterling Silver Cufflinks Onyx", category: "Accessories", sku: "LUX-AC-002", barcode: "890123456038", price: 420, costPrice: 240, stock: 40, minStockAlert: 10, unit: "pair", taxRate: 18, hsnCode: "7113", createdAt: "2026-03-27" },
  { id: "prod-39", name: "Reversible Calfskin Leather Belt", category: "Accessories", sku: "LUX-AC-003", barcode: "890123456039", price: 590, costPrice: 340, stock: 24, minStockAlert: 6, unit: "pcs", taxRate: 18, hsnCode: "4203", createdAt: "2026-03-28" },

  { id: "prod-40", name: "Limoges Porcelain Tea Set 12-Piece", category: "Home & Lifestyle", sku: "LUX-L-001", barcode: "890123456040", price: 2100, costPrice: 1350, stock: 4, minStockAlert: 2, unit: "set", taxRate: 18, hsnCode: "6911", createdAt: "2026-03-29" },
  { id: "prod-41", name: "Hand-Cut Crystal Decanter Set", category: "Home & Lifestyle", sku: "LUX-L-002", barcode: "890123456041", price: 1650, costPrice: 1000, stock: 8, minStockAlert: 3, unit: "set", taxRate: 18, hsnCode: "7013", createdAt: "2026-03-30" },
  { id: "prod-42", name: "Scented Soy Wax Candle Gold Vessel", category: "Home & Lifestyle", sku: "LUX-L-003", barcode: "890123456042", price: 180, costPrice: 95, stock: 50, minStockAlert: 15, unit: "pcs", taxRate: 18, hsnCode: "3406", createdAt: "2026-04-01" },

  { id: "prod-43", name: "Luxury Fountain Pen 18k Gold Nib", category: "Stationery", sku: "LUX-ST-001", barcode: "890123456043", price: 950, costPrice: 580, stock: 15, minStockAlert: 4, unit: "pcs", taxRate: 12, hsnCode: "9608", createdAt: "2026-04-02" },
  { id: "prod-44", name: "Full Grain Leather Executive Journal", category: "Stationery", sku: "LUX-ST-002", barcode: "890123456044", price: 260, costPrice: 140, stock: 32, minStockAlert: 8, unit: "pcs", taxRate: 12, hsnCode: "4820", createdAt: "2026-04-03" },

  { id: "prod-45", name: "Solid Rosewood Humidor Box", category: "Home & Lifestyle", sku: "LUX-L-004", barcode: "890123456045", price: 1400, costPrice: 850, stock: 6, minStockAlert: 2, unit: "pcs", taxRate: 18, hsnCode: "4420", createdAt: "2026-04-04" },
  { id: "prod-46", name: "Automatic Watch Winder Box 4-Slot", category: "Accessories", sku: "LUX-AC-004", barcode: "890123456046", price: 1850, costPrice: 1150, stock: 5, minStockAlert: 2, unit: "pcs", taxRate: 18, hsnCode: "9114", createdAt: "2026-04-05" },
  { id: "prod-47", name: "Cashmere Throw Blanket Sand", category: "Home & Lifestyle", sku: "LUX-L-005", barcode: "890123456047", price: 1200, costPrice: 720, stock: 11, minStockAlert: 4, unit: "pcs", taxRate: 12, hsnCode: "6301", createdAt: "2026-04-06" },
  { id: "prod-48", name: "Champagne Flutes Gold Rim Set of 6", category: "Home & Lifestyle", sku: "LUX-L-006", barcode: "890123456048", price: 490, costPrice: 280, stock: 16, minStockAlert: 5, unit: "set", taxRate: 18, hsnCode: "7013", createdAt: "2026-04-07" },
];
