// client/src/menu/pages/Categories.jsx
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "../../auth/AuthContext";
import MenuTabs from "../MenuTabs";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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
    <div className="text-5xl mb-4">🍽️</div>
    <h3 className="text-lg font-semibold text-gray-800">No categories yet</h3>
    <p className="text-gray-500 mt-1 mb-6">
      Categories group your menu items — Starters, Biryani, Beverages, and so on.
    </p>
    {canManage && (
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Add your first category
      </button>
    )}
  </div>
);

// ==============================================
// Category Form Modal
// ==============================================

const CategoryFormModal = ({ initial, onClose, onSaved }) => {
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? 0);
  const [isEnabled, setIsEnabled] = useState(initial?.isEnabled ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl || "");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, "categories");
        if (!uploadResult.ok) {
          throw new Error(uploadResult.data?.message || "Image upload failed");
        }
        finalImageUrl = uploadResult.data.data.url;
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        isEnabled,
        imageUrl: finalImageUrl || null,
      };

      const result = isEdit
        ? await updateCategory(initial.id, payload)
        : await createCategory(payload);

      if (!result.ok) {
        throw new Error(result.data?.message || "Failed to save category");
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Category" : "Add Category"}
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image
            </label>
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional short description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-4">
            {/* Display order */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Display order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Enabled toggle */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isEnabled
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {isEnabled ? "Enabled" : "Disabled"}
                <span
                  className={`w-9 h-5 rounded-full relative transition-colors ${
                    isEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add category"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// Delete Confirm Modal
// ==============================================

const DeleteConfirmModal = ({ category, onClose, onConfirmed }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      setError(result.data?.message || "Failed to delete category");
      setDeleting(false);
      return;
    }
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Delete category?</h2>
        <p className="text-gray-500 text-sm mt-2">
          "{category.name}" will be permanently removed. Menu items inside it will
          need a new category.
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
// Category Card
// ==============================================

const CategoryCard = ({ category, canManage, canDelete, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-32 bg-gray-100 relative">
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
          🍽️
        </div>
      )}
      <span
        className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${
          category.isEnabled
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {category.isEnabled ? "Enabled" : "Disabled"}
      </span>
    </div>

    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {category.subCategories?.length || 0} sub-categories
        </span>

        {(canManage || canDelete) && (
          <div className="flex gap-2">
            {canManage && (
              <button
                onClick={() => onEdit(category)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(category)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ==============================================
// Main Page
// ==============================================

const Categories = () => {
  const { canManageMenu, canDeleteMenuItems } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const canManage = canManageMenu();
  const canDelete = canDeleteMenuItems();

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    const result = await fetchCategories();
    if (result.ok) {
      setCategories(result.data.data || []);
    } else {
      setError(result.data?.message || "Failed to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormSaved = () => {
    setFormOpen(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleDeleteConfirmed = () => {
    setDeletingCategory(null);
    loadCategories();
  };

  return (
    <div>
      <MenuTabs />

      <div className="flex items-center justify-end mb-4">
        {canManage && categories.length > 0 && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <FiPlus /> Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState canManage={canManage} onAdd={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              canManage={canManage}
              canDelete={canDelete}
              onEdit={handleEdit}
              onDelete={setDeletingCategory}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <CategoryFormModal
          initial={editingCategory}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {deletingCategory && (
        <DeleteConfirmModal
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirmed={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default Categories;