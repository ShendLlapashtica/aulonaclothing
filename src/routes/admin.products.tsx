import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  useProducts,
  useAddProduct,
  useRemoveProduct,
  useCategories,
  useAddCategory,
  useRemoveCategory,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/products";
import { Pencil, Trash2, Plus, X, Upload, Camera, Tag } from "lucide-react";
import { toast } from "sonner";

async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const products = useProducts();
  const categories = useCategories();
  const addProduct = useAddProduct();
  const removeProduct = useRemoveProduct();
  const addCategory = useAddCategory();
  const removeCategory = useRemoveCategory();
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: categories[0] ?? "",
    price: "",
    stock: "",
    sizes: "",
    image: "",
  });
  const [newCat, setNewCat] = useState("");
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({
      name: "",
      category: categories[0] ?? "",
      price: "",
      stock: "",
      sizes: "",
      image: "",
    });
    setPreview("");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Të lutem ngarko një foto");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Fotoja duhet të jetë nën 5MB");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch {
      toast("Ngarkimi i fotos dështoi");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const newProduct: Product = {
      id: `aul-${Date.now()}`,
      name: form.name,
      category: form.category || categories[0] || "Të Tjera",
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      image: form.image.trim() || products[0]?.image || "",
      isNew: true,
    };
    try {
      await addProduct.mutateAsync(newProduct);
      resetForm();
      setShowModal(false);
      toast("Produkti u shtua me sukses");
    } catch {
      toast("Produkti nuk u shtua, provoni përsëri");
    }
  };

  const remove = async (id: string) => {
    try {
      await removeProduct.mutateAsync(id);
      toast("Produkti u fshi");
    } catch {
      toast("Fshirja dështoi");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCat.trim();
    if (!trimmed) return;
    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast("Kategoria ekziston tashmë");
      return;
    }
    try {
      await addCategory.mutateAsync(trimmed);
      toast(`Kategoria "${trimmed}" u shtua`);
      setNewCat("");
    } catch {
      toast("Shtimi i kategorisë dështoi");
    }
  };

  const handleRemoveCategory = async (name: string) => {
    const inUse = products.some((p) => p.category === name);
    if (inUse) {
      toast(`"${name}" përdoret nga produkte — fshiji ato më parë`);
      return;
    }
    try {
      await removeCategory.mutateAsync(name);
      toast(`Kategoria "${name}" u hoq`);
    } catch {
      toast("Heqja e kategorisë dështoi");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Katalogu</p>
          <h1 className="font-serif text-3xl sm:text-4xl mt-2">Produktet</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-foreground text-background px-4 sm:px-6 py-3 text-xs tracking-widest uppercase hover:bg-caramel transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Shto Produkt
        </button>
      </div>

      {/* Categories manager */}
      <div className="bg-card border border-border p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-caramel" />
          <h2 className="font-serif text-xl">Kategoritë</h2>
          <span className="text-[10px] tracking-widest uppercase text-muted-foreground ml-auto">
            {categories.length} gjithsej
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            return (
              <span
                key={c}
                className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs"
              >
                <span>{c}</span>
                <span className="text-[10px] text-muted-foreground">({count})</span>
                <button
                  onClick={() => handleRemoveCategory(c)}
                  aria-label={`Fshi ${c}`}
                  className="text-muted-foreground hover:text-burgundy transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">Nuk ka kategori. Shto një më poshtë.</p>
          )}
        </div>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Emri i kategorisë së re (p.sh. Këpucë, Fundet)"
            className="flex-1 min-w-[200px] bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="bg-foreground text-background px-4 py-2 text-xs tracking-widest uppercase hover:bg-caramel transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Shto Kategori
          </button>
        </form>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs tracking-widest uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-normal">Foto</th>
              <th className="text-left px-5 py-3 font-normal">Emri</th>
              <th className="text-left px-5 py-3 font-normal">Kategoria</th>
              <th className="text-left px-5 py-3 font-normal">Masat</th>
              <th className="text-right px-5 py-3 font-normal">Çmimi</th>
              <th className="text-right px-5 py-3 font-normal">Stoku</th>
              <th className="text-right px-5 py-3 font-normal">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <img src={p.image} alt="" className="w-10 h-14 object-cover bg-secondary" />
                </td>
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.sizes.join(", ")}</td>
                <td className="px-5 py-3 text-right">{p.price.toFixed(2)} €</td>
                <td className="px-5 py-3 text-right">
                  <span className={p.stock < 6 ? "text-burgundy" : ""}>{p.stock}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-secondary" aria-label="Ndrysho">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="p-2 hover:bg-burgundy hover:text-background transition-colors"
                      aria-label="Fshi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleAdd}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-lg p-8 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">Ri</p>
                <h2 className="font-serif text-3xl mt-1">Shto Produkt</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Emri</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full bg-transparent border border-border px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                Kategoria
              </span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full bg-transparent border border-border px-3 py-2 focus:outline-none focus:border-foreground"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Menaxho kategoritë më lart për të shtuar të reja.
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">
                  Çmimi (€)
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full bg-transparent border border-border px-3 py-2 focus:outline-none focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">
                  Stoku
                </span>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1 w-full bg-transparent border border-border px-3 py-2 focus:outline-none focus:border-foreground"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                Masat (ndara me presje)
              </span>
              <input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="XS, S, M, L"
                className="mt-1 w-full bg-transparent border border-border px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </label>
            <div className="space-y-2">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                Fotoja e Produktit
              </span>
              <div className="flex items-start gap-3">
                {preview || form.image ? (
                  <div className="relative shrink-0">
                    <img
                      src={preview || form.image}
                      alt="preview"
                      className="w-20 h-28 object-cover bg-secondary border border-border"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/70 grid place-items-center text-[9px] tracking-widest uppercase text-muted-foreground text-center px-1">
                        Duke ngarkuar...
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, image: "" });
                        setPreview("");
                      }}
                      className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 hover:bg-burgundy hover:text-background transition-colors"
                      aria-label="Hiq foton"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-28 bg-secondary border border-dashed border-border grid place-items-center text-[10px] text-muted-foreground text-center shrink-0">
                    Nuk ka foto
                  </div>
                )}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="flex items-center justify-center gap-2 border border-border px-3 py-2 text-xs tracking-widest uppercase hover:bg-secondary transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" /> Galeria
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="flex items-center justify-center gap-2 border border-border px-3 py-2 text-xs tracking-widest uppercase hover:bg-secondary transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" /> Kamera
                  </button>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <input
                    value={
                      form.image.startsWith("blob:") || form.image.startsWith("data:")
                        ? ""
                        : form.image
                    }
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.value });
                      setPreview("");
                    }}
                    placeholder="ose ngjit URL https://..."
                    className="col-span-2 mt-1 w-full bg-transparent border border-border px-3 py-2 text-xs focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={addProduct.isPending || uploading}
              className="w-full bg-foreground text-background py-3 text-xs tracking-widest uppercase hover:bg-caramel transition-colors mt-2 disabled:opacity-50"
            >
              {addProduct.isPending ? "Duke ruajtur..." : "Ruaj Produktin"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
