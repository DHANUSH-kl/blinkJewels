"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  type: z.enum(["buy", "rent"], { required_error: "Select a type" }),
  rentalPrice: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
  categories: z.array(z.string()),
  tags: z.string(),
  isFeatured: z.boolean(),
  images: z.any().optional(),
});

interface ImageItem {
  url: string;
  public_id?: string;
  isExisting?: boolean;
  file?: File;
}

interface Category {
  _id: string;
  name: string;
  type: 'buy' | 'rent';
}

export default function ProductForm({ product }: any) {
  const editing = Boolean(product);
  const [imageItems, setImageItems] = useState<ImageItem[]>(
    product?.images?.map((img: any) => ({ ...img, isExisting: true })) || []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'select' | 'create' | 'edit'>('select');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.categories?.map((c: any) => c.toString()) || []
  );
  const [newCategory, setNewCategory] = useState({ name: "", type: "buy" as "buy" | "rent" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'buy' | 'rent'>('all');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...product,
      categories: product?.categories.map((c: any) => c.toString()) || [],
      tags: product?.tags?.join(", ") || "",
      isFeatured: product?.isFeatured || false,
      rentalPrice: product?.rentalPrice || "",
    },
  });

  const type = watch("type");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  // Update selected categories when form values change
  useEffect(() => {
    setValue("categories", selectedCategories);
  }, [selectedCategories, setValue]);

  const filteredCategories = categories.filter((cat) => {
    if (categoryFilter === 'all') return true;
    return cat.type === categoryFilter;
  });

  const getFilteredCategoriesForType = (filterType: 'buy' | 'rent') => {
    return categories.filter((cat) => cat.type === filterType);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: ImageItem[] = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        isExisting: false,
      }));
      setImageItems(prev => [...prev, ...newImages]);
      clearErrors("images");
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageItems(prev => {
      const newItems = [...prev];
      if (!newItems[index].isExisting) {
        URL.revokeObjectURL(newItems[index].url);
      }
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    setImageItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      return newItems;
    });
    
    setDraggedIndex(null);
  };

  const onSubmit = async (data: any) => {
    if (!editing && imageItems.length === 0) {
      setError("images", { message: "Upload at least 1 image" });
      return;
    }

    setIsUploading(true);

    try {
      const processedImages = await Promise.all(
        imageItems.map(async (item) => {
          if (item.isExisting) {
            return {
              url: item.url,
              public_id: item.public_id
            };
          } else if (item.file) {
            const formData = new FormData();
            formData.append("file", item.file);
            formData.append("filename", item.file.name);

            const res = await fetch("/api/upload-image", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error(`Failed to upload ${item.file.name}`);
            }

            const result = await res.json();
            return { url: result.secure_url, public_id: result.public_id };
          }
          return null;
        })
      );

      const validImages = processedImages.filter(Boolean);

      const body = {
        ...data,
        images: validImages,
        categories: selectedCategories,
        tags: data.tags.split(",").map((t: string) => t.trim()),
        rentalPrice: data.rentalPrice === "" ? undefined : Number(data.rentalPrice),
      };

      const method = editing ? "PUT" : "POST";
      const response = await fetch(`/api/admin/products/${editing ? product._id : ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      window.location.href = "/admin/products";
    } catch (error) {
      console.error("Error saving product:", error);
      setError("images", { message: "Failed to upload images. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });

    if (res.ok) {
      const updated = await fetch("/api/categories").then(res => res.json());
      setCategories(updated);
      setNewCategory({ name: "", type: "buy" });
      setCategoryModalMode('select');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) return;

    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: editingCategory._id, 
        name: newCategory.name,
        type: newCategory.type 
      }),
    });

    if (res.ok) {
      const updated = await fetch("/api/categories").then(res => res.json());
      setCategories(updated);
      setEditingCategory(null);
      setNewCategory({ name: "", type: "buy" });
      setCategoryModalMode('select');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryId }),
    });

    if (res.ok) {
      const updated = await fetch("/api/categories").then(res => res.json());
      setCategories(updated);
      // Remove deleted category from selected categories
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, type: category.type });
    setCategoryModalMode('edit');
  };

  const resetCategoryModal = () => {
    setCategoryModalMode('select');
    setEditingCategory(null);
    setNewCategory({ name: "", type: "buy" });
    setCategoryFilter('all');
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    resetCategoryModal();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-900 p-6 rounded-lg shadow-md">
        <div>
          <label className="block mb-1 text-sm">Title</label>
          <input
            {...register("title")}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors resize-none"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm">Price</label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm">Rental Price (optional)</label>
            <input
              type="number"
              step="0.01"
              {...register("rentalPrice")}
              className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
            />
            {errors.rentalPrice && <p className="text-red-400 text-sm mt-1">{errors.rentalPrice.message}</p>}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm">Stock</label>
          <input
            type="number"
            {...register("stock")}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
          />
          {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm">Type</label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
          >
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
          {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block mb-2 text-sm">
            Categories
            <button
              type="button"
              className="ml-3 px-3 py-1 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-500 transition-colors"
              onClick={() => setShowCategoryModal(true)}
            >
              Manage Categories
            </button>
          </label>
          
          {/* Selected Categories Display */}
          <div className="mb-3">
            {selectedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(categoryId => {
                  const category = categories.find(cat => cat._id === categoryId);
                  if (!category) return null;
                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-black rounded-full text-sm"
                    >
                      {category.name}
                      <span className="text-xs opacity-70">({category.type})</span>
                      <button
                        type="button"
                        onClick={() => handleCategoryToggle(categoryId)}
                        className="ml-1 text-black hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">No categories selected. Click "Manage Categories" to select.</p>
            )}
          </div>

          {/* Quick Select for Current Type */}
          <div className="bg-zinc-800 p-3 rounded border border-zinc-700">
            <p className="text-sm text-zinc-300 mb-2">Quick select for {type} categories:</p>
            <div className="flex flex-wrap gap-2">
              {getFilteredCategoriesForType(type).map(category => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategoryToggle(category._id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedCategories.includes(category._id)
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {getFilteredCategoriesForType(type).length === 0 && (
                <p className="text-zinc-500 text-sm">No {type} categories available.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm">Tags (comma-separated)</label>
          <input
            {...register("tags")}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors"
            placeholder="e.g. gold, ring, wedding"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("isFeatured")}
            className="w-4 h-4 text-yellow-400 bg-zinc-800 border-zinc-700 rounded focus:ring-yellow-400 focus:ring-2"
          />
          <label className="text-sm">Mark as Featured</label>
        </div>

        <div>
          <label className="block mb-2 text-sm">
            Product Images {!editing && <span className="text-red-400">*</span>}
            <span className="text-zinc-400 text-xs ml-2">
              {imageItems.length > 0 && `(${imageItems.length} image${imageItems.length > 1 ? 's' : ''})`}
            </span>
          </label>
          
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelection}
              className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-yellow-400 focus:outline-none transition-colors file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 file:cursor-pointer"
            />
            <p className="text-xs text-zinc-400 mt-1">
              Select multiple images. You can reorder them by dragging and remove individual images.
            </p>
          </div>

          {imageItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-zinc-800 rounded-lg">
              {imageItems.map((item, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`relative group cursor-move transition-all duration-200 hover:scale-105 ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-zinc-700 group-hover:border-yellow-400 transition-colors">
                    <Image
                      src={item.url}
                      fill
                      alt={`Product image ${index + 1}`}
                      className="object-cover"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      ×
                    </button>
                    
                    <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.isExisting ? 'Existing' : 'New'}
                    </div>
                    
                    <div className="absolute top-1 left-1 w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imageItems.length === 0 && (
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
              <div className="text-zinc-400 mb-2">📸</div>
              <p className="text-zinc-400 text-sm">No images selected</p>
              <p className="text-zinc-500 text-xs">Choose files above to add product images</p>
            </div>
          )}

          {errors.images && <p className="text-red-400 text-sm mt-2">{errors.images.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full px-4 py-3 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {editing ? 'Updating Product...' : 'Creating Product...'}
            </span>
          ) : (
            editing ? 'Update Product' : 'Create Product'
          )}
        </button>
      </form>

      {/* Enhanced Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-800 rounded-lg w-[600px] max-h-[80vh] overflow-hidden border border-zinc-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Category Management</h3>
                <button
                  onClick={closeCategoryModal}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Mode Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCategoryModalMode('select')}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    categoryModalMode === 'select'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  Select & Manage
                </button>
                <button
                  onClick={() => setCategoryModalMode('create')}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    categoryModalMode === 'create'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  Create New
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Select & Manage Mode */}
              {categoryModalMode === 'select' && (
                <div className="space-y-4">
                  {/* Filter Tabs */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        categoryFilter === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      All ({categories.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter('buy')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        categoryFilter === 'buy'
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Buy ({categories.filter(c => c.type === 'buy').length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter('rent')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        categoryFilter === 'rent'
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Rent ({categories.filter(c => c.type === 'rent').length})
                    </button>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-2">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <div
                          key={category._id}
                          className={`flex items-center justify-between p-3 rounded transition-colors ${
                            selectedCategories.includes(category._id)
                              ? 'bg-yellow-400/20 border border-yellow-400'
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category._id)}
                              onChange={() => handleCategoryToggle(category._id)}
                              className="w-4 h-4 text-yellow-400 bg-zinc-600 border-zinc-500 rounded focus:ring-yellow-400"
                            />
                            <div>
                              <span className="text-white font-medium">{category.name}</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                category.type === 'buy' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {category.type}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditCategory(category)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-400">
                        <p>No categories found</p>
                        <button
                          onClick={() => setCategoryModalMode('create')}
                          className="mt-2 text-yellow-400 hover:text-yellow-300 underline"
                        >
                          Create your first category
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Create Mode */}
              {categoryModalMode === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Enter category name"
                      className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Category Type</label>
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'buy' | 'rent' })}
                      className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    >
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategory.name.trim()}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              )}

              {/* Edit Mode */}
              {categoryModalMode === 'edit' && editingCategory && (
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-700 rounded">
                    <p className="text-sm text-zinc-300">Editing Category:</p>
                    <p className="text-white font-medium">{editingCategory.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Enter category name"
                      className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">Category Type</label>
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'buy' | 'rent' })}
                      className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-yellow-400 focus:outline-none transition-colors"
                    >
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCategory}
                      disabled={!newCategory.name.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Update Category
                    </button>
                    <button
                      onClick={() => setCategoryModalMode('select')}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-700 bg-zinc-800/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">
                  {selectedCategories.length} of {categories.length} categories selected
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetCategoryModal}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={closeCategoryModal}
                    className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}