import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Edit3,
  ImageUp,
  Package,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { Database, Json } from "@/integrations/supabase/types";
import { BlogAdminPanel } from "@/components/admin/BlogAdminPanel";
import {
  catalog,
  collectionFiltersFor,
  collectionLabel,
  isKnownCollection,
  normalizeCollectionValue,
  slugifyProduct,
  type Collection,
} from "@/lib/catalog-data";
import { cropImageFile, mimeTypeToExtension, resizeImageFile, type CropArea } from "@/lib/image-processing";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type AdminProduct = ProductRow & { source: "catalog" | "database" };
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type AdminTab = "orders" | "products" | "blog";
type OrderStatus = "nouveau" | "confirme" | "prepare" | "livre" | "annule";

const blankProduct = {
  name: "",
  subtitle: "",
  collection: "scentlab",
  price: 0,
  notes_top: "",
  notes_heart: "",
  notes_base: "",
  description: "",
  image_url: "",
  image_urls: [] as string[],
  slug: "",
  in_stock: true,
  is_bestseller: false,
};
const blankOrder = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  total: 0,
  status: "nouveau",
  notes: "",
  itemsText: "",
};
const DELETED_PRODUCT_MARKER = "__2M_ADMIN_DELETED_PRODUCT__";
const adminTabs: Array<{ key: AdminTab; label: string; icon: typeof ShoppingBag }> = [
  { key: "orders", label: "Commandes", icon: ShoppingBag },
  { key: "products", label: "Produits", icon: Package },
  { key: "blog", label: "Blog", icon: Edit3 },
];
const orderStatuses: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "Toutes" },
  { value: "nouveau", label: "Nouveau" },
  { value: "confirme", label: "Confirmé" },
  { value: "prepare", label: "Préparé" },
  { value: "livre", label: "Livré" },
  { value: "annule", label: "Annulé" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — 2M Parfumerie" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostRow[]>([]);
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [productForm, setProductForm] = useState(blankProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState(blankOrder);
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    setSessionEmail(user?.email ?? null);
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: roleAllowed } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    setIsAdmin(Boolean(roleAllowed));
    if (roleAllowed) {
      const [{ data: productRows }, { data: orderRows }, { data: blogRows }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase
          .from("blog_posts")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);
      setProducts(mergeCatalogWithDatabaseProducts(productRows ?? []));
      setOrders(orderRows ?? []);
      setBlogPosts(blogRows ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(loadAdminData, 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword(auth);
    if (error) toast.error(error.message);
    else toast.success("Connexion réussie");
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: auth.email,
      password: auth.password,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (error) toast.error(error.message);
    else toast.success("Compte créé. Vérifiez votre email.");
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = productPayloadFromForm(productForm);
    const query = editingProductId
      ? supabase.from("products").update(payload).eq("id", editingProductId)
      : supabase.from("products").insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Produit enregistré");
      setProductForm(blankProduct);
      setEditingProductId(null);
      setShowProductForm(false);
      loadAdminData();
    }
  };

  const saveProductFromRow = async (product: AdminProduct, overrides: Partial<ProductInsert>) => {
    const payload = productPayloadFromRow(product, overrides);
    const query =
      product.source === "database"
        ? supabase.from("products").update(payload).eq("id", product.id)
        : supabase.from("products").insert(payload);
    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success("Produit mis à jour");
      loadAdminData();
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Supprimer ${product.name} ?`)) return;
    const query =
      product.source === "catalog"
        ? supabase.from("products").insert({
            ...productPayloadFromRow(product, {
              description: DELETED_PRODUCT_MARKER,
              in_stock: false,
              is_bestseller: false,
            }),
          })
        : supabase.from("products").delete().eq("id", product.id);
    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success("Produit supprimé");
      loadAdminData();
    }
  };

  const saveOrder = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const items = orderForm.itemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ label: line }));
    const { error } = await supabase.from("orders").insert({
      customer_name: orderForm.customer_name,
      customer_phone: orderForm.customer_phone,
      customer_address: orderForm.customer_address,
      total: Number(orderForm.total),
      status: orderForm.status,
      notes: orderForm.notes,
      items: items as Json,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Commande ajoutée");
      setOrderForm(blankOrder);
      setShowOrderForm(false);
      loadAdminData();
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Statut mis à jour");
      loadAdminData();
    }
  };

  const deleteOrder = async (order: OrderRow) => {
    if (!window.confirm(`Supprimer la commande #${order.order_number} ?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Commande supprimée");
      loadAdminData();
    }
  };

  if (loading)
    return (
      <AdminShell>
        <p className="text-muted-foreground">Chargement…</p>
      </AdminShell>
    );

  if (!sessionEmail) {
    return (
      <AdminShell>
        <form
          onSubmit={signIn}
          className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h1 className="font-display text-4xl text-foreground">Admin 2M</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connexion propriétaire uniquement.</p>
          <input
            className="mt-8 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
            placeholder="Email"
            type="email"
            value={auth.email}
            onChange={(e) => setAuth({ ...auth, email: e.target.value })}
            required
          />
          <input
            className="mt-3 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
            placeholder="Mot de passe"
            type="password"
            value={auth.password}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
            required
          />
          <Button className="mt-6 w-full" type="submit">
            Se connecter
          </Button>
          <Button className="mt-3 w-full" type="button" variant="outline" onClick={signUp}>
            Créer le compte admin
          </Button>
          <Button
            className="mt-3 w-full"
            type="button"
            variant="ghost"
            onClick={() =>
              lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin + "/admin",
              })
            }
          >
            Continuer avec Google
          </Button>
        </form>
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-6 text-center sm:p-8">
          <h1 className="font-display text-4xl text-foreground">Accès en attente</h1>
          <p className="mt-3 text-muted-foreground">
            Votre compte {sessionEmail} doit recevoir le rôle admin dans Lovable Cloud.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => supabase.auth.signOut()}>
            Déconnexion
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminChrome email={sessionEmail} activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "orders" && (
          <OrdersPanel
            orders={orders}
            orderForm={orderForm}
            setOrderForm={setOrderForm}
            saveOrder={saveOrder}
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
            showOrderForm={showOrderForm}
            setShowOrderForm={setShowOrderForm}
            saving={saving}
          />
        )}
        {activeTab === "products" && (
          <ProductsPanel
            products={products}
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            productForm={productForm}
            setProductForm={setProductForm}
            saveProduct={saveProduct}
            editingProductId={editingProductId}
            setEditingProductId={setEditingProductId}
            deleteProduct={deleteProduct}
            saveProductFromRow={saveProductFromRow}
            saving={saving}
          />
        )}
        {activeTab === "blog" && <BlogAdminPanel blogPosts={blogPosts} onRefresh={loadAdminData} />}
      </AdminChrome>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-4 text-foreground sm:px-6 lg:px-10">
      {children}
    </main>
  );
}

function AdminChrome({
  email,
  activeTab,
  setActiveTab,
  children,
}: {
  email: string;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="rounded-lg border border-border bg-card p-3 shadow-card sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-2xl text-foreground">
              2M Parfumerie <span className="italic text-accent">Admin</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{email}</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${activeTab === tab.key ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground"}`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => supabase.auth.signOut()}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <div className="py-6 sm:py-8">{children}</div>
    </div>
  );
}

function ProductsPanel({
  products,
  showProductForm,
  setShowProductForm,
  productForm,
  setProductForm,
  saveProduct,
  editingProductId,
  setEditingProductId,
  deleteProduct,
  saveProductFromRow,
  saving,
}: {
  products: AdminProduct[];
  showProductForm: boolean;
  setShowProductForm: (show: boolean) => void;
  productForm: typeof blankProduct;
  setProductForm: Dispatch<SetStateAction<typeof blankProduct>>;
  saveProduct: (event: FormEvent) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  deleteProduct: (product: AdminProduct) => void;
  saveProductFromRow: (product: AdminProduct, overrides: Partial<ProductInsert>) => void;
  saving: boolean;
}) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<Collection | "all">("all");
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = [product.name, product.subtitle, product.collection]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCollection =
          collection === "all" || normalizeCollectionValue(product.collection) === collection;
        return matchesQuery && matchesCollection;
      }),
    [products, query, collection],
  );
  // Catégories prévues + catégories créées dans l'admin.
  const categoryFilters = useMemo(
    () =>
      collectionFiltersFor(
        products
          .filter((product) => product.description !== "__2M_ADMIN_DELETED_PRODUCT__")
          .map((product) => ({ collection: normalizeCollectionValue(product.collection) })),
      ),
    [products],
  );

  const editProduct = (product: AdminProduct) => {
    setEditingProductId(product.source === "database" ? product.id : null);
    setProductForm({
      name: product.name,
      subtitle: product.subtitle ?? "",
      collection: product.collection,
      price: product.price,
      notes_top: product.notes_top ?? "",
      notes_heart: product.notes_heart ?? "",
      notes_base: product.notes_base ?? "",
      description: product.description ?? "",
      image_url: product.image_url ?? "",
      image_urls: product.image_urls ?? imageListFromPrimary(product.image_url),
      slug: product.slug,
      in_stock: Boolean(product.in_stock),
      is_bestseller: Boolean(product.is_bestseller),
    });
    setShowProductForm(true);
  };

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">Produits</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredProducts.length} produits affichés sur {products.length}
          </p>
        </div>
        <Button
          className="min-h-12 w-full sm:w-auto"
          onClick={() => {
            setEditingProductId(null);
            setProductForm(blankProduct);
            setShowProductForm(!showProductForm);
          }}
        >
          {showProductForm ? <X /> : <Plus />} {showProductForm ? "Fermer" : "Nouveau produit"}
        </Button>
      </div>

      <Dialog
        open={showProductForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowProductForm(false);
            setEditingProductId(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:rounded-lg">
          <DialogTitle className="sr-only">
            {editingProductId ? "Modifier produit" : "Ajouter produit"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire de {editingProductId ? "modification" : "création"} de produit
          </DialogDescription>
          <ProductForm
            form={productForm}
            setForm={setProductForm}
            onSubmit={saveProduct}
            editing={Boolean(editingProductId)}
            saving={saving}
            categories={categoryFilters.filter((filter) => filter.value !== "all")}
          />
        </DialogContent>
      </Dialog>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="min-h-12 w-full rounded-md border border-border bg-card py-3 pl-11 pr-4 text-foreground"
            placeholder="Rechercher un produit"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="min-h-12 rounded-md border border-border bg-card px-4 text-foreground"
          aria-label="Filtre de collection"
          value={collection}
          onChange={(event) => setCollection(event.target.value as Collection | "all")}
        >
          {categoryFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border border-border bg-card p-4 shadow-card"
          >
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-placeholder">
                {primaryImage(product) && (
                  <img
                    src={primaryImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="line-clamp-2 font-semibold text-foreground">{product.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {collectionLabel(normalizeCollectionValue(product.collection))}
                    </p>
                  </div>
                  <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                    {product.source === "catalog" ? "Catalogue" : "Admin"}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-accent">
                  {product.price.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => saveProductFromRow(product, { in_stock: !product.in_stock })}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${product.in_stock ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground"}`}
              >
                {product.in_stock ? "En stock" : "Rupture"}
              </button>
              <button
                type="button"
                onClick={() =>
                  saveProductFromRow(product, { is_bestseller: !product.is_bestseller })
                }
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${product.is_bestseller ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-muted-foreground"}`}
              >
                Bestseller
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => editProduct(product)}>
                <Edit3 /> Modifier
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => deleteProduct(product)}
              >
                <Trash2 /> Supprimer
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OrdersPanel({
  orders,
  orderForm,
  setOrderForm,
  saveOrder,
  updateOrderStatus,
  deleteOrder,
  showOrderForm,
  setShowOrderForm,
  saving,
}: {
  orders: OrderRow[];
  orderForm: typeof blankOrder;
  setOrderForm: (form: typeof blankOrder) => void;
  saveOrder: (event: FormEvent) => void;
  updateOrderStatus: (id: string, status: string) => void;
  deleteOrder: (order: OrderRow) => void;
  showOrderForm: boolean;
  setShowOrderForm: (show: boolean) => void;
  saving: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const haystack = [
          order.order_number,
          order.customer_name,
          order.customer_phone || "",
          order.customer_address,
          order.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) && (status === "all" || order.status === status)
        );
      }),
    [orders, query, status],
  );

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">Commandes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredOrders.length} commandes affichées sur {orders.length}
          </p>
        </div>
        <Button
          className="min-h-12 w-full sm:w-auto"
          onClick={() => setShowOrderForm(!showOrderForm)}
        >
          {showOrderForm ? <X /> : <Plus />} {showOrderForm ? "Fermer" : "Ajouter commande"}
        </Button>
      </div>

      {showOrderForm && (
        <div className="mb-6">
          <OrderForm form={orderForm} setForm={setOrderForm} onSubmit={saveOrder} saving={saving} />
        </div>
      )}

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="min-h-12 w-full rounded-md border border-border bg-card py-3 pl-11 pr-4 text-foreground"
            placeholder="Rechercher nom, téléphone, numéro"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="min-h-12 rounded-md border border-border bg-card px-4 text-foreground"
          aria-label="Filtre de statut des commandes"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}
        >
          {orderStatuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filteredOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-lg border border-border bg-card p-4 shadow-card"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Commande #{order.order_number}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <select
                aria-label={`Statut de la commande ${order.order_number}`}
                value={order.status ?? "nouveau"}
                onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                className="min-h-11 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground"
              >
                {orderStatuses
                  .filter((item) => item.value !== "all")
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <InfoBlock label="Client" value={order.customer_name || "Non renseigné"} />
              <InfoBlock label="Téléphone" value={order.customer_phone || "" || "Non renseigné"} />
              <InfoBlock label="Adresse" value={order.customer_address || "Non renseignée"} />
              <InfoBlock
                label="Total"
                value={`${order.total.toLocaleString("fr-FR")} FCFA`}
                strong
              />
            </div>
            <div className="mt-4 rounded-md bg-surface p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Articles</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {orderItems(order.items).map((item, index) => (
                  <li key={`${order.id}-${index}`}>• {item}</li>
                ))}
              </ul>
            </div>
            {order.notes && (
              <p className="mt-3 text-sm text-muted-foreground">Note : {order.notes}</p>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {order.customer_phone && (
                <Button
                  type="button"
                  className="flex-1 bg-whatsapp text-primary-foreground hover:bg-whatsapp-hover"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${normalizePhone(order.customer_phone || "")}`,
                      "_blank",
                    )
                  }
                >
                  <WhatsAppLogo tone="light" className="size-4" /> WhatsApp
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => deleteOrder(order)}
              >
                <Trash2 /> Supprimer
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoBlock({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className={strong ? "font-semibold text-accent" : "text-foreground"}>{value}</p>
    </div>
  );
}

function ProductForm({
  form,
  setForm,
  onSubmit,
  editing,
  saving,
  categories,
}: {
  form: typeof blankProduct;
  setForm: Dispatch<SetStateAction<typeof blankProduct>>;
  onSubmit: (event: FormEvent) => void;
  editing: boolean;
  saving: boolean;
  categories: { label: string; value: Collection }[];
}) {
  type ImageEditorMode = "crop" | "resize";
  type CropPreset = "square" | "landscape";

  const cropPresets: Array<{
    key: CropPreset;
    label: string;
    description: string;
    width: number;
    height: number;
  }> = [
    { key: "square", label: "Carré 1:1", description: "Idéal pour les vignettes produit", width: 1200, height: 1200 },
    { key: "landscape", label: "Large 4:5", description: "Mieux pour les visuels éditoriaux", width: 1600, height: 2000 },
  ];

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [imageQueueIndex, setImageQueueIndex] = useState(0);
  const [imageEditorMode, setImageEditorMode] = useState<ImageEditorMode>("crop");
  const [cropPreset, setCropPreset] = useState<CropPreset>("square");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [outputWidth, setOutputWidth] = useState(1200);
  const [outputHeight, setOutputHeight] = useState(1200);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const hideNotesForHaqqi = form.collection === "haqqi";

  const currentImage = imageQueue[imageQueueIndex] ?? null;

  useEffect(() => {
    if (!currentImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(currentImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [currentImage]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (imageEditorMode === "crop") {
      const preset = cropPresets.find((item) => item.key === cropPreset) ?? cropPresets[0];
      setOutputWidth(preset.width);
      setOutputHeight(preset.height);
      return;
    }

    setOutputWidth(1600);
    setOutputHeight(1600);
  }, [currentImage, cropPreset, imageEditorMode]);

  const startImageUpload = (files: FileList) => {
    const imageFiles = Array.from(files);
    if (!imageFiles.length) return;

    const invalidFile = imageFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      toast.error("Choisissez uniquement des fichiers image.");
      return;
    }

    setImageQueue(imageFiles);
    setImageQueueIndex(0);
    setCropPreset("square");
    setImageEditorOpen(true);
  };

  const closeImageEditor = () => {
    if (uploadingImage) {
      return;
    }

    setImageEditorOpen(false);
    setImageQueue([]);
    setImageQueueIndex(0);
    setCropPreset("square");
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const applyCropPreset = (preset: CropPreset) => {
    setCropPreset(preset);
    const presetData = cropPresets.find((item) => item.key === preset);
    if (presetData) {
      setOutputWidth(presetData.width);
      setOutputHeight(presetData.height);
    }
  };

  const uploadPreparedImage = async (file: File, processedBlob: Blob) => {
    const extension = mimeTypeToExtension(processedBlob.type || file.type || "image/jpeg");
    const baseName = slugify(form.name || file.name.replace(/\.[^.]+$/, "")) || "produit";
    const filePath = `public/${baseName}-${Date.now()}-${imageQueueIndex}.${extension}`;
    const processedFile = new File([processedBlob], `${baseName}.${extension}`, {
      type: processedBlob.type || file.type || "image/jpeg",
    });

    const { error } = await supabase.storage.from("product-images").upload(filePath, processedFile, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    setForm((current) => {
      const imageUrls = normalizeImageList([...current.image_urls, data.publicUrl]);
      return {
        ...current,
        image_url: current.image_url || imageUrls[0] || "",
        image_urls: imageUrls,
      };
    });
  };

  const processCurrentImage = async () => {
    if (!currentImage) return;

    if (imageEditorMode === "crop" && !croppedAreaPixels) {
      toast.error("Définissez un cadrage avant de valider.");
      return;
    }

    setUploadingImage(true);

    try {
      const processedBlob =
        imageEditorMode === "crop"
          ? await cropImageFile(currentImage, croppedAreaPixels as CropArea, {
              outputWidth,
              outputHeight,
              mimeType: currentImage.type,
            })
          : await resizeImageFile(currentImage, {
              maxWidth: outputWidth,
              maxHeight: outputHeight,
              mimeType: currentImage.type,
            });

      await uploadPreparedImage(currentImage, processedBlob);

      const nextIndex = imageQueueIndex + 1;
      if (nextIndex < imageQueue.length) {
        setImageQueueIndex(nextIndex);
        return;
      }

      toast.success(imageQueue.length > 1 ? "Images ajoutées" : "Image ajoutée");
      closeImageEditor();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'envoyer l'image.";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-6"
    >
      <h2 className="mb-4 font-display text-3xl text-foreground">
        {editing ? "Modifier produit" : "Ajouter produit"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Nom"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
          required
        />
        <Field
          label="Sous-titre / inspiration"
          value={form.subtitle}
          onChange={(value) => setForm({ ...form, subtitle: value })}
        />
        <CategoryField form={form} setForm={setForm} categories={categories} />
        <Field
          label="Prix FCFA"
          type="number"
          value={String(form.price)}
          onChange={(value) => setForm({ ...form, price: Number(value) })}
          required
        />
        <Field
          label="Slug"
          value={form.slug}
          onChange={(value) => setForm({ ...form, slug: value })}
        />
        <Field
          label="Image URL"
          value={form.image_url}
          onChange={(value) => setForm({ ...form, image_url: value })}
        />
        <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
          Image produit
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <input
              className="sr-only"
              id="product-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = event.target.files;
                if (files) startImageUpload(files);
                event.target.value = "";
              }}
              disabled={uploadingImage || imageEditorOpen}
            />
            <label
              htmlFor="product-image-upload"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-btn transition-all duration-300 hover:scale-[1.02] hover:bg-accent-hover"
            >
              <ImageUp className="size-4" /> {uploadingImage ? "Envoi…" : "Uploader"}
            </label>
            <span className="break-all rounded-md border border-border bg-background px-4 py-3 text-sm font-normal text-muted-foreground">
              {form.image_urls.length ? `${form.image_urls.length} image(s) ajoutée(s)` : "Aucune image sélectionnée"}
            </span>
          </div>
          <Dialog open={imageEditorOpen} onOpenChange={(open) => (open ? setImageEditorOpen(true) : closeImageEditor())}>
            <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Préparer l’image</DialogTitle>
                <DialogDescription>
                  Recadrez ou redimensionnez l’image avant l’envoi pour garder un rendu cohérent dans la boutique.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_320px]">
                <div className="space-y-3">
                  <div className="relative h-[360px] overflow-hidden rounded-lg border border-border bg-black/5">
                    {previewUrl ? (
                      <>
                        {imageEditorMode === "crop" ? (
                          <>
                            <Cropper
                              image={previewUrl}
                              crop={crop}
                              zoom={zoom}
                              aspect={outputWidth / outputHeight}
                              cropShape="rect"
                              showGrid
                              restrictPosition
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels as Area)}
                            />
                            <div className="pointer-events-none absolute inset-0">
                              <div className="absolute inset-4 rounded-2xl border border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]" />
                              <div className="absolute left-4 top-4 size-6 border-l-2 border-t-2 border-white/90" />
                              <div className="absolute right-4 top-4 size-6 border-r-2 border-t-2 border-white/90" />
                              <div className="absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-white/90" />
                              <div className="absolute bottom-4 right-4 size-6 border-b-2 border-r-2 border-white/90" />
                              <div className="absolute inset-x-4 top-4 rounded-2xl bg-gradient-to-b from-black/10 to-transparent" />
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center p-4">
                            <img
                              src={previewUrl}
                              alt="Prévisualisation de l'image"
                              className="max-h-full max-w-full rounded-md object-contain shadow-card"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Chargement de l’aperçu…
                      </div>
                    )}
                  </div>

                  {imageEditorMode === "crop" && (
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {cropPresets.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => applyCropPreset(preset.key)}
                          className={`rounded-lg border px-3 py-3 text-left transition-colors ${cropPreset === preset.key ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground"}`}
                        >
                          <span className="block text-sm font-semibold">{preset.label}</span>
                          <span className="mt-1 block text-xs leading-5">{preset.description}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      className="w-full accent-accent"
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      Glissez l’image pour repositionner le cadrage. Les coins de la fenêtre indiquent la zone exportée.
                    </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-background p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Fichier en cours</p>
                    <p className="break-all text-sm text-muted-foreground">
                      {currentImage ? `${imageQueueIndex + 1}/${imageQueue.length} · ${currentImage.name}` : "Aucun fichier"}
                    </p>
                  </div>

                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Mode
                    <select
                      className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
                      aria-label="Mode de préparation de l'image"
                      value={imageEditorMode}
                      onChange={(event) => {
                        const nextMode = event.target.value as ImageEditorMode;
                        setImageEditorMode(nextMode);
                        if (nextMode === "crop") {
                          applyCropPreset("square");
                        }
                      }}
                    >
                      <option value="crop">Recadrer</option>
                      <option value="resize">Redimensionner</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Largeur
                      <input
                        className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
                        type="number"
                        min="1"
                        value={outputWidth}
                        onChange={(event) => setOutputWidth(Number(event.target.value) || 1)}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Hauteur
                      <input
                        className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
                        type="number"
                        min="1"
                        value={outputHeight}
                        onChange={(event) => setOutputHeight(Number(event.target.value) || 1)}
                      />
                    </label>
                  </div>

                  <p className="text-xs leading-5 text-muted-foreground">
                    L’image finale sera exportée à ces dimensions maximum. En mode recadrage, le ratio de sortie est appliqué au cadre.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button type="button" variant="outline" onClick={closeImageEditor} disabled={uploadingImage}>
                  Annuler
                </Button>
                <div className="flex gap-2">
                  {imageQueueIndex > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImageQueueIndex((current) => Math.max(0, current - 1))}
                      disabled={uploadingImage}
                    >
                      Retour
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setImageQueueIndex((current) => Math.min(imageQueue.length - 1, current + 1))}
                    disabled={uploadingImage || imageQueueIndex + 1 >= imageQueue.length}
                  >
                    Passer
                  </Button>
                  <Button type="button" onClick={processCurrentImage} disabled={uploadingImage || !currentImage}>
                    {uploadingImage ? "Traitement…" : imageQueueIndex + 1 < imageQueue.length ? "Valider et continuer" : "Valider et envoyer"}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {form.image_urls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.image_urls.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-md border border-border bg-background">
                  <img src={url} alt="Aperçu produit" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const image_urls = form.image_urls.filter((item) => item !== url);
                      setForm({ ...form, image_urls, image_url: form.image_url === url ? image_urls[0] || "" : form.image_url });
                    }}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-card text-foreground shadow-card"
                    aria-label="Retirer l'image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </label>
        {!hideNotesForHaqqi && (
          <>
            <Field
              label="Notes de tête"
              value={form.notes_top}
              onChange={(value) => setForm({ ...form, notes_top: value })}
            />
            <Field
              label="Notes de cœur"
              value={form.notes_heart}
              onChange={(value) => setForm({ ...form, notes_heart: value })}
            />
            <Field
              label="Notes de fond"
              value={form.notes_base}
              onChange={(value) => setForm({ ...form, notes_base: value })}
            />
            <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
              Description
              <textarea
                className="min-h-28 rounded-md border border-border bg-background px-4 py-3 text-foreground"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
          </>
        )}
        {hideNotesForHaqqi && (
          <p className="sm:col-span-2 text-sm leading-6 text-muted-foreground">
            Haqqi utilise uniquement le nom du parfum dans le dashboard pour garder l’édition plus compacte.
          </p>
        )}
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-4 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={(event) => setForm({ ...form, in_stock: event.target.checked })}
          />{" "}
          En stock
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-4 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.is_bestseller}
            onChange={(event) => setForm({ ...form, is_bestseller: event.target.checked })}
          />{" "}
          Bestseller
        </label>
      </div>
      <Button className="mt-4 min-h-12 w-full sm:w-auto" type="submit" disabled={saving}>
        <Save /> {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

function OrderForm({
  form,
  setForm,
  onSubmit,
  saving,
}: {
  form: typeof blankOrder;
  setForm: (form: typeof blankOrder) => void;
  onSubmit: (event: FormEvent) => void;
  saving: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-6"
    >
      <h2 className="mb-4 font-display text-3xl text-foreground">Ajouter commande</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Nom client"
          value={form.customer_name}
          onChange={(value) => setForm({ ...form, customer_name: value })}
        />
        <Field
          label="Téléphone"
          value={form.customer_phone}
          onChange={(value) => setForm({ ...form, customer_phone: value })}
        />
        <Field
          label="Adresse"
          value={form.customer_address}
          onChange={(value) => setForm({ ...form, customer_address: value })}
        />
        <Field
          label="Total FCFA"
          type="number"
          value={String(form.total)}
          onChange={(value) => setForm({ ...form, total: Number(value) })}
          required
        />
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Statut
          <select
            className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
            aria-label="Statut de commande"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {orderStatuses
              .filter((item) => item.value !== "all")
              .map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
          Articles
          <textarea
            className="min-h-24 rounded-md border border-border bg-background px-4 py-3 text-foreground"
            placeholder="Un produit par ligne"
            value={form.itemsText}
            onChange={(event) => setForm({ ...form, itemsText: event.target.value })}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
          Notes
          <textarea
            className="min-h-20 rounded-md border border-border bg-background px-4 py-3 text-foreground"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
      </div>
      <Button className="mt-4 min-h-12 w-full sm:w-auto" type="submit" disabled={saving}>
        <Plus /> {saving ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      <input
        className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function productPayloadFromForm(form: typeof blankProduct): ProductInsert {
  const image_urls = normalizeImageList([form.image_url, ...form.image_urls]);
  const payload = {
    ...form,
    image_url: image_urls[0] || "",
    image_urls,
    price: Number(form.price),
    slug: slugify(form.slug || form.name),
  };
  return form.collection === "haqqi"
    ? {
        ...payload,
        notes_top: "",
        notes_heart: "",
        notes_base: "",
        description: "",
      }
    : payload;
}

function productPayloadFromRow(
  product: AdminProduct,
  overrides: Partial<ProductInsert>,
): ProductInsert {
  const payload = {
    name: product.name,
    subtitle: product.subtitle,
    collection: product.collection,
    price: product.price,
    notes_top: product.notes_top,
    notes_heart: product.notes_heart,
    notes_base: product.notes_base,
    description: product.description,
    image_url: primaryImage(product),
    image_urls: normalizeImageList(product.image_urls ?? imageListFromPrimary(product.image_url)),
    slug: product.slug,
    in_stock: Boolean(product.in_stock),
    is_bestseller: Boolean(product.is_bestseller),
    ...overrides,
  };
  return payload.collection === "haqqi"
    ? {
        ...payload,
        notes_top: "",
        notes_heart: "",
        notes_base: "",
        description: "",
      }
    : payload;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeImageList(urls: Array<string | null | undefined>) {
  return Array.from(new Set(urls.map((url) => url?.trim()).filter(Boolean) as string[]));
}

function imageListFromPrimary(imageUrl: string | null | undefined) {
  return normalizeImageList([imageUrl]);
}

function primaryImage(product: Pick<AdminProduct, "image_url" | "image_urls">) {
  return normalizeImageList([...(product.image_urls ?? []), product.image_url])[0] || "";
}

function mergeCatalogWithDatabaseProducts(databaseProducts: ProductRow[]): AdminProduct[] {
  const databaseBySlug = new Map(databaseProducts.map((product) => [product.slug, product]));
  const catalogSlugs = new Set(catalog.map(slugifyProduct));
  const catalogProducts = catalog.flatMap<AdminProduct>((product) => {
    const slug = slugifyProduct(product);
    const savedProduct = databaseBySlug.get(slug);
    if (savedProduct?.description === DELETED_PRODUCT_MARKER) return [];
    if (savedProduct) {
      return [
        {
          ...savedProduct,
          notes_top: savedProduct.collection === "haqqi" ? "" : savedProduct.notes_top,
          notes_heart: savedProduct.collection === "haqqi" ? "" : savedProduct.notes_heart,
          notes_base: savedProduct.collection === "haqqi" ? "" : savedProduct.notes_base,
          description: savedProduct.collection === "haqqi" ? "" : savedProduct.description,
          source: "database" as const,
        },
      ];
    }

    return [{
      id: `catalog-${slug}`,
      name: product.name,
      subtitle: product.ref,
      collection: product.collection,
      price: product.price,
      notes_top: product.headNotes,
      notes_heart: product.heartNotes,
      notes_base: product.baseNotes,
      description: product.description,
      image_url: product.image,
      image_urls: [product.image],
      slug,
      in_stock: true,
      is_bestseller: false,
      created_at: null,
      updated_at: null,
      source: "catalog",
    }];
  });
  const extraDatabaseProducts = databaseProducts
    .filter((product) => !catalogSlugs.has(product.slug) && product.description !== DELETED_PRODUCT_MARKER)
    .map((product) => ({
      ...product,
      notes_top: product.collection === "haqqi" ? "" : product.notes_top,
      notes_heart: product.collection === "haqqi" ? "" : product.notes_heart,
      notes_base: product.collection === "haqqi" ? "" : product.notes_base,
      description: product.collection === "haqqi" ? "" : product.description,
      source: "database" as const,
    }));
  return [...catalogProducts, ...extraDatabaseProducts];
}

function orderItems(items: Json): string[] {
  if (Array.isArray(items))
    return items.map((item) =>
      typeof item === "object" && item && "label" in item ? String(item.label) : String(item),
    );
  if (typeof items === "string") return [items];
  return ["Articles non détaillés"];
}

function formatDate(value: string | null) {
  if (!value) return "Date non renseignée";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("221") ? digits : `221${digits}`;
}

const NEW_CATEGORY = "__nouvelle_categorie__";

// Choix de la catégorie, avec la possibilité d'en créer une nouvelle.
function CategoryField({
  form,
  setForm,
  categories,
}: {
  form: typeof blankProduct;
  setForm: Dispatch<SetStateAction<typeof blankProduct>>;
  categories: { label: string; value: Collection }[];
}) {
  const current = normalizeCollectionValue(form.collection);
  const listed = categories.some((category) => category.value === current);
  const [creating, setCreating] = useState(false);
  const showInput = creating || (!listed && Boolean(form.collection.trim()));

  const pick = (next: string) => {
    if (next === NEW_CATEGORY) {
      setCreating(true);
      setForm((value) => ({ ...value, collection: "" }));
      return;
    }
    setCreating(false);
    // Une catégorie créée dans l'admin est enregistrée sous son nom (ex. « Musc Blanc »).
    const stored = isKnownCollection(next) ? next : collectionLabel(next);
    setForm((value) =>
      next === "haqqi"
        ? { ...value, collection: stored, notes_top: "", notes_heart: "", notes_base: "", description: "" }
        : { ...value, collection: stored },
    );
  };

  return (
    <div className="grid items-start gap-2 text-sm font-medium text-foreground sm:col-span-2 sm:grid-cols-2 sm:gap-3">
      <label className="grid gap-2">
        Catégorie
        <select
          className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
          value={showInput ? NEW_CATEGORY : current}
          onChange={(event) => pick(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Nouvelle catégorie…</option>
        </select>
      </label>
      {showInput && (
        <label className="grid gap-2">
          Nom de la nouvelle catégorie
          <input
            className="min-h-12 rounded-md border border-border bg-background px-4 text-foreground"
            value={form.collection}
            onChange={(event) => setForm((value) => ({ ...value, collection: event.target.value }))}
            placeholder="Ex. Musc Blanc"
            required
            autoFocus
          />
          <span className="text-xs font-normal text-muted-foreground">
            Elle apparaîtra dans la boutique, le menu Collections et le pied de page dès que ce produit
            sera enregistré.
          </span>
        </label>
      )}
    </div>
  );
}
