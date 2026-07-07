// client/src/menu/pages/MenuList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import MenuTabs from "../MenuTabs";
import {
  fetchMenuItems,
  fetchCategories,
  fetchSubCategories,
  fetchKitchenSections,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
} from "../menuApi";

// ==============================================
// Small building blocks
// ==============================================

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ canManage, onAdd }) => (
  <div className="text-center py-20 px-6">
    <div className="text-5xl mb-4">🍲</div>
    <h3 className="text-lg font-semibold text-gray-800">No menu items yet</h3>
    <p className="text-gray-500 mt-1 mb-6">
      Add your first dish, set a price, and it'll show up here.
    </p>
    {canManage && (
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Add your first item
      </button>
    )}
  </div>
);

const FoodTypeDot = ({ foodType }) => {
  const color =
    foodType === "VEG"
      ? "border-green-600"
      : foodType === "EGG"
      ? "border-amber-500"
      : "border-red-600";
  const dot =
    foodType === "VEG"
      ? "bg-green-600"
      : foodType === "EGG"
      ? "bg-amber-500"
      : "bg-red-600";

  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 ${color} rounded-sm flex-shrink-0`}
      title={foodType.replace("_", "-")}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    </span>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    OUT_OF_STOCK: "bg-amber-100 text-amber-700",
    INACTIVE: "bg-gray-100 text-gray-500",
    DELETED: "bg-red-100 text-red-700",
  };
  const labels = {
    ACTIVE: "Active",
    OUT_OF_STOCK: "Out of Stock",
    INACTIVE: "Inactive",
    DELETED: "Deleted",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

// ==============================================
// Menu Item Form Modal
// ==============================================

const MenuItemFormModal = ({ initial, categories, kitchenSections, onClose, onSaved }) => {
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name || "");
  const [shortName, setShortName] = useState(initial?.shortName || "");
  const [sku, setSku] = useState(initial?.sku || "");
  const [barcode, setBarcode] = useState(initial?.barcode || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [subCategoryId, setSubCategoryId] = useState(initial?.subCategoryId || "");
  const [subCategories, setSubCategories] = useState([]);
  const [kitchenSectionId, setKitchenSectionId] = useState(initial?.kitchenSectionId || "");
  const [foodType, setFoodType] = useState(initial?.foodType || "VEG");
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice ?? "");
  const [costPrice, setCostPrice] = useState(initial?.costPrice ?? "");
  const [gstPercent, setGstPercent] = useState(initial?.gstPercent ?? 0);
  const [serviceCharge, setServiceCharge] = useState(initial?.serviceCharge ?? "");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initial?.prepTimeMinutes ?? "");
  const [description, setDescription] = useState(initial?.description || "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [isSeasonal, setIsSeasonal] = useState(initial?.isSeasonal ?? false);
  const [isHiddenFromPOS, setIsHiddenFromPOS] = useState(initial?.isHiddenFromPOS ?? false);
  const [status, setStatus] = useState(initial?.status || "ACTIVE");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl || "");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load sub-categories whenever the selected category changes
  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    fetchSubCategories(categoryId).then((result) => {
      if (result.ok) setSubCategories(result.data.data || []);
    });
  }, [categoryId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim() || !sku.trim() || !categoryId || sellingPrice === "") {
      setError("Name, SKU, category, and selling price are required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "menu-items");
        if (!uploadResult.ok) {
          throw new Error(uploadResult.data?.message || "Image upload failed");
        }
        finalImageUrl = uploadResult.data.data.url;
      }

      const payload = {
        name: name.trim(),
        shortName: shortName.trim() || null,
        sku: sku.trim(),
        barcode: barcode.trim() || null,
        categoryId,
        subCategoryId: subCategoryId || null,
        kitchenSectionId: kitchenSectionId || null,
        foodType,
        sellingPrice: Number(sellingPrice),
        costPrice: costPrice === "" ? null : Number(costPrice),
        gstPercent: Number(gstPercent) || 0,
        serviceCharge: serviceCharge === "" ? null : Number(serviceCharge),
        prepTimeMinutes: prepTimeMinutes === "" ? null : Number(prepTimeMinutes),
        description: description.trim() || null,
        isAvailable,
        isSeasonal,
        isHiddenFromPOS,
        status,
        imageUrl: finalImageUrl || null,
      };

      const result = isEdit
        ? await updateMenuItem(initial.id, payload)
        : await createMenuItem(payload);

      if (!result.ok) {
        throw new Error(result.data?.errors?.join(", ") || result.data?.message || "Failed to save item");
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300 text-2xl">🖼️</span>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Biryani"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Name</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="For KOT/receipt display"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. BIR-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId("");
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub Category</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                disabled={!categoryId || subCategories.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {!categoryId ? "Select category first" : subCategories.length === 0 ? "None available" : "None"}
                </option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kitchen Section</label>
              <select
                value={kitchenSectionId}
                onChange={(e) => setKitchenSectionId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {kitchenSections.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Type</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="VEG">Veg</option>
                <option value="NON_VEG">Non-Veg</option>
                <option value="EGG">Egg</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price *</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost Price</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">GST %</label>
              <input
                type="number"
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Charge</label>
              <input
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prep Time (minutes)</label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional short description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isAvailable
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {isAvailable ? "Available" : "Unavailable"}
                <span
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    isAvailable ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isAvailable ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Seasonal Item</label>
              <button
                type="button"
                onClick={() => setIsSeasonal(!isSeasonal)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSeasonal
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {isSeasonal ? "Seasonal" : "Regular"}
                <span
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    isSeasonal ? "bg-amber-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isSeasonal ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hidden from POS</label>
              <button
                type="button"
                onClick={() => setIsHiddenFromPOS(!isHiddenFromPOS)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isHiddenFromPOS
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {isHiddenFromPOS ? "Hidden from POS" : "Visible in POS"}
                <span
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    isHiddenFromPOS ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isHiddenFromPOS ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// Delete Confirm Modal
// ==============================================

const DeleteConfirmModal = ({ item, onClose, onConfirmed }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const result = await deleteMenuItem(item.id);
    if (!result.ok) {
      setError(result.data?.message || "Failed to delete item");
      setDeleting(false);
      return;
    }
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Delete menu item?</h2>
        <p className="text-gray-500 text-sm mt-2">
          "{item.name}" will be marked as deleted and hidden from the menu.
        </p>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mt-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// Main Page
// ==============================================

const MenuList = () => {
  const { canManageMenu, canDeleteMenuItems } = useAuth();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [kitchenSections, setKitchenSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const canManage = canManageMenu();
  const canDelete = canDeleteMenuItems();

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [itemsResult, categoriesResult, kitchenSectionsResult] = await Promise.all([
      fetchMenuItems({
        ...(search ? { search } : {}),
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
        ...(foodTypeFilter ? { foodType: foodTypeFilter } : {}),
        ...(availabilityFilter !== "" ? { isAvailable: availabilityFilter } : {}),
      }),
      fetchCategories(),
      fetchKitchenSections(),
    ]);

    if (itemsResult.ok) {
      setItems(itemsResult.data.data || []);
    } else {
      setError(itemsResult.data?.message || "Failed to load menu items");
    }

    if (categoriesResult.ok) {
      setCategories(categoriesResult.data.data || []);
    }

    if (kitchenSectionsResult.ok) {
      setKitchenSections(kitchenSectionsResult.data.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, foodTypeFilter, availabilityFilter]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSaved = () => {
    setFormOpen(false);
    setEditingItem(null);
    loadData();
  };

  const handleDeleteConfirmed = () => {
    setDeletingItem(null);
    loadData();
  };

  const categoryOptions = useMemo(
    () => [{ id: "", name: "All Categories" }, ...categories],
    [categories]
  );

  return (
    <div>
      <MenuTabs />

      <div className="flex items-center justify-end mb-4">
        {canManage && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <FiPlus /> Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or barcode"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={foodTypeFilter}
          onChange={(e) => setFoodTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Veg / Non-Veg / Egg</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non-Veg</option>
          <option value="EGG">Egg</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Available / Unavailable</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState canManage={canManage} onAdd={handleAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Status</th>
                  {(canManage || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-300 text-lg">🍽️</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FoodTypeDot foodType={item.foodType} />
                            <span className="font-medium text-gray-900 truncate">{item.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{Number(item.sellingPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.status} />
                    </td>
                    {(canManage || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          {canManage && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <MenuItemFormModal
          initial={editingItem}
          categories={categories}
          kitchenSections={kitchenSections}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {deletingItem && (
        <DeleteConfirmModal
          item={deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default MenuList;