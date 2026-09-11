"use client";

import React, { useState } from "react";
import { useProductStore } from "@/store/product-store";
import { Product } from "@/types/product";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, AlertTriangle, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export const ProductsView = () => {
  const { products, addProduct, updateProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editMinStock, setEditMinStock] = useState(0);
  const [editTaxRate, setEditTaxRate] = useState(0);
  const [editUnit, setEditUnit] = useState("pcs");

  // New Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Watches");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [minStockAlert, setMinStockAlert] = useState(3);
  const [taxRate, setTaxRate] = useState(18);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    addProduct({
      name,
      category,
      sku: sku || `LUX-${name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      barcode: `890123456${Math.floor(Math.random() * 900 + 100)}`,
      price: Number(price),
      costPrice: Number(costPrice) || Math.round(Number(price) * 0.7),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
      unit: "pcs",
      taxRate: Number(taxRate),
    });
    setShowAddModal(false);
    setName("");
    setPrice(0);
    setStock(10);
  };

  // Open Edit Modal with product data pre-filled
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category);
    setEditSku(prod.sku);
    setEditPrice(prod.price);
    setEditCostPrice(prod.costPrice || 0);
    setEditStock(prod.stock);
    setEditMinStock(prod.minStockAlert);
    setEditTaxRate(prod.taxRate);
    setEditUnit(prod.unit || "pcs");
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editName,
      category: editCategory,
      sku: editSku,
      price: Number(editPrice),
      costPrice: Number(editCostPrice),
      stock: Number(editStock),
      minStockAlert: Number(editMinStock),
      taxRate: Number(editTaxRate),
      unit: editUnit,
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Inventory"
        subtitle={`Managing ${products.length} luxury items & stock thresholds`}
        action={
          <Button variant="gold" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add New Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-xl border border-gold-500/15">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or SKU..."
            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                selectedCat === cat
                  ? "bg-gold-500 text-obsidian-950 font-bold"
                  : "bg-obsidian-900 text-slate-400 border border-gold-500/10 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>SKU</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Selling Price</TableCell>
            <TableCell>Tax (GST)</TableCell>
            <TableCell>Stock Level</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((prod) => {
            const isLow = prod.stock <= prod.minStockAlert;
            return (
              <TableRow key={prod.id}>
                <TableCell className="font-mono font-bold text-gold-400">{prod.sku}</TableCell>
                <TableCell className="font-semibold text-slate-100">{prod.name}</TableCell>
                <TableCell className="text-xs text-slate-300">{prod.category}</TableCell>
                <TableCell className="font-bold text-slate-100">{formatCurrency(prod.price)}</TableCell>
                <TableCell className="text-xs text-slate-400">{prod.taxRate}%</TableCell>
                <TableCell className="font-mono font-bold text-slate-200">{prod.stock} {prod.unit}</TableCell>
                <TableCell>
                  {isLow ? (
                    <Badge variant="due" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="paid">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openEditModal(prod)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 hover:text-gold-300 transition-all text-[11px] font-bold"
                    title="Edit product"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Product to Inventory">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="SKU / Model #" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Selling Price (₹) *" type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} required />
            <Input label="Cost Price (₹)" type="number" value={costPrice || ""} onChange={(e) => setCostPrice(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Stock *" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            <Input label="Min Alert" type="number" value={minStockAlert} onChange={(e) => setMinStockAlert(Number(e.target.value))} />
            <Input label="GST Rate %" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={`Edit Product — ${editingProduct?.name ?? ""}`}
      >
        <form onSubmit={handleEditSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Product Name *" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <Input label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={editSku} onChange={(e) => setEditSku(e.target.value)} />
            <Input label="Unit (pcs/sheet/sqft)" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Selling Price (₹) *" type="number" value={editPrice || ""} onChange={(e) => setEditPrice(Number(e.target.value))} required />
            <Input label="Cost Price (₹)" type="number" value={editCostPrice || ""} onChange={(e) => setEditCostPrice(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Stock" type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} />
            <Input label="Min Alert" type="number" value={editMinStock} onChange={(e) => setEditMinStock(Number(e.target.value))} />
            <Input label="GST Rate %" type="number" value={editTaxRate} onChange={(e) => setEditTaxRate(Number(e.target.value))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditingProduct(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
