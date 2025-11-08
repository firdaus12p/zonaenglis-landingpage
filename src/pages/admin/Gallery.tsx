import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Plus,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
} from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: "Kids" | "Teens" | "Intensive";
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "All" | "Kids" | "Teens" | "Intensive"
  >("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Kids" as "Kids" | "Teens" | "Intensive",
    description: "",
    order_index: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const API_BASE = "http://localhost:3001/api";

  // Fetch gallery items
  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/gallery`);
      const data = await response.json();
      setGalleryItems(data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      alert("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCurrentItem(null);
    setFormData({
      title: "",
      category: "Kids",
      description: "",
      order_index: 0,
    });
    setImageFile(null);
    setImagePreview("");
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setModalMode("edit");
    setCurrentItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description || "",
      order_index: item.order_index,
    });
    setImageFile(null);
    setImagePreview(`${API_BASE.replace("/api", "")}${item.image_url}`);
    setErrors({});
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, image: "File harus berupa gambar" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Ukuran file maksimal 5MB" });
        return;
      }

      setImageFile(file);
      setErrors({ ...errors, image: "" });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul wajib diisi";
    }

    if (modalMode === "create" && !imageFile) {
      newErrors.image = "Gambar wajib diupload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("order_index", formData.order_index.toString());

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const url =
        modalMode === "create"
          ? `${API_BASE}/gallery`
          : `${API_BASE}/gallery/${currentItem?.id}`;

      const response = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PUT",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan galeri");
      }

      alert(
        modalMode === "create"
          ? "Galeri berhasil ditambahkan"
          : "Galeri berhasil diupdate"
      );
      setShowModal(false);
      fetchGallery();
    } catch (error) {
      console.error("Error saving gallery:", error);
      alert(error instanceof Error ? error.message : "Gagal menyimpan galeri");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/gallery/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus galeri");
      }

      alert("Galeri berhasil dihapus");
      setShowDeleteConfirm(null);
      fetchGallery();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      alert("Gagal menghapus galeri");
    }
  };

  // Filter gallery items
  const filteredItems = galleryItems.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "All" || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "Kids":
        return "kids";
      case "Teens":
        return "teens";
      case "Intensive":
        return "sprint";
      default:
        return "default";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Galeri Kegiatan
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola galeri foto kegiatan Kids, Teens, dan Intensive
            </p>
          </div>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Galeri
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Galeri</p>
                <p className="text-2xl font-bold text-slate-900">
                  {galleryItems.length}
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Kids</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {galleryItems.filter((i) => i.category === "Kids").length}
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Teens</p>
                <p className="text-2xl font-bold text-purple-600">
                  {galleryItems.filter((i) => i.category === "Teens").length}
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Intensive</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    galleryItems.filter((i) => i.category === "Intensive")
                      .length
                  }
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul galeri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(
                    e.target.value as "All" | "Kids" | "Teens" | "Intensive"
                  )
                }
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Semua Kategori</option>
                <option value="Kids">Kids</option>
                <option value="Teens">Teens</option>
                <option value="Intensive">Intensive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-3 text-slate-600">Memuat galeri...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchTerm || filterCategory !== "All"
                ? "Tidak ada galeri yang sesuai filter"
                : "Belum ada galeri. Klik tombol Tambah Galeri untuk memulai"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative group">
                  <img
                    src={`${API_BASE.replace("/api", "")}${item.image_url}`}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setShowImagePreview(
                          `${API_BASE.replace("/api", "")}${item.image_url}`
                        )
                      }
                      className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="h-5 w-5 text-slate-700" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(item.id)}
                      className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getCategoryBadgeVariant(item.category)}>
                      {item.category}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Order: {item.order_index}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {modalMode === "create" ? "Tambah Galeri" : "Edit Galeri"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gambar <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 mb-2">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-slate-400">
                          PNG, JPG, GIF, WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="mt-3 block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      {imagePreview ? "Ganti Gambar" : "Pilih Gambar"}
                    </label>
                  </div>
                  {errors.image && (
                    <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Contoh: Kegiatan Fun Learning Kids"
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.title
                        ? "border-red-300 focus:ring-red-500"
                        : "border-slate-200 focus:ring-blue-500"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as
                          | "Kids"
                          | "Teens"
                          | "Intensive",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kids">Kids (4-12 th)</option>
                    <option value="Teens">Teens (14-17 th)</option>
                    <option value="Intensive">Intensive (Sprint)</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsi singkat tentang foto ini..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Order Index */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order_index: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Angka lebih kecil akan ditampilkan lebih dulu
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    {modalMode === "create" ? "Tambah" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Hapus Galeri?
              </h3>
              <p className="text-slate-600 mb-6">
                Tindakan ini tidak dapat dibatalkan. Gambar akan dihapus
                permanen.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImagePreview(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowImagePreview(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              <img
                src={showImagePreview}
                alt="Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Gallery;
