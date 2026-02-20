import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge, RichTextEditor } from "../../components";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  BookOpen,
  X,
  Save,
  Upload,
  Loader2,
} from "lucide-react";
import { API_BASE } from "../../config/api";

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return "";
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith("http")) return imagePath;
  // If it's a local upload, prepend backend URL (remove /api from API_BASE)
  if (imagePath.startsWith("/uploads/")) {
    const backendUrl = API_BASE.replace("/api", "");
    const fullUrl = `${backendUrl}${imagePath}`;
    console.log("Image URL:", { original: imagePath, full: fullUrl });
    return fullUrl;
  }
  // Fallback: prepend backend URL for any relative path
  const backendUrl = API_BASE.replace("/api", "");
  const fullUrl = `${backendUrl}${imagePath}`;
  console.log("Image URL (fallback):", { original: imagePath, full: fullUrl });
  return fullUrl;
};

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  published_at: string;
  updated_at: string;
  views: number;
  likes_count: number;
  loves_count: number;
  comments_count: number;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const Articles: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Admin Zona English",
    category: "Grammar",
    status: "Draft" as "Published" | "Draft" | "Scheduled" | "Archived",
    seo_title: "",
    seo_description: "",
    hashtags: "",
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/articles/categories/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result = await response.json();
      // Extract category names from the result
      const categoryNames = result.data.map(
        (cat: { name: string }) => cat.name,
      );
      setCategories(categoryNames);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories if fetch fails
      setCategories([
        "Grammar",
        "Vocabulary",
        "Speaking",
        "Listening",
        "Tips",
        "News",
      ]);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch articles");
      const result = await response.json();
      setArticles(result.data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setNotification({
        show: true,
        message: "Failed to load articles",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "Admin Zona English",
      category: categories[0] || "Grammar",
      status: "Draft",
      seo_title: "",
      seo_description: "",
      hashtags: "",
    });
    setFeaturedImage(null);
    setImagePreview("");
    setShowModal(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      author: article.author,
      category: article.category,
      status: article.status,
      seo_title: article.seo_title || "",
      seo_description: article.seo_description || "",
      hashtags: "",
    });
    // Reset featured image file object (no new upload yet)
    setFeaturedImage(null);
    // Set image preview with full backend URL
    setImagePreview(getImageUrl(article.featured_image));
    setShowModal(true);

    // Fetch hashtags for this article
    fetchArticleHashtags(article.id);
  };

  const fetchArticleHashtags = async (articleId: number) => {
    try {
      const response = await fetch(`${API_BASE}/articles/admin/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        const article = result.data;
        if (article.hashtags) {
          setFormData((prev) => ({
            ...prev,
            hashtags: Array.isArray(article.hashtags)
              ? article.hashtags.join(", ")
              : article.hashtags,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching hashtags:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const slug = editingArticle?.slug || generateSlug(formData.title);

      // Prepare form data for file upload
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", slug);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("author", formData.author);
      submitData.append("category", formData.category);
      submitData.append("status", formData.status);
      submitData.append("seo_title", formData.seo_title);
      submitData.append("seo_description", formData.seo_description);

      // Add hashtags
      const hashtags = formData.hashtags
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h);
      submitData.append("hashtags", JSON.stringify(hashtags));

      // Add published_at for Published status
      if (formData.status === "Published") {
        submitData.append("published_at", new Date().toISOString());
      }

      // Add image if selected
      if (featuredImage) {
        submitData.append("featuredImage", featuredImage);
      }

      const url = editingArticle
        ? `${API_BASE}/articles/${editingArticle.id}`
        : `${API_BASE}/articles`;
      const method = editingArticle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save article");
      }

      setNotification({
        show: true,
        message: editingArticle
          ? "Article updated successfully!"
          : "Article created successfully!",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000,
      );
      setShowModal(false);
      // Reset image states after successful submit
      setFeaturedImage(null);
      setImagePreview("");
      fetchArticles();
    } catch (error: unknown) {
      console.error("Error saving article:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save article";
      setNotification({
        show: true,
        message,
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete article");

      setNotification({
        show: true,
        message: "Article deleted successfully!",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000,
      );
      setShowDeleteConfirm(null);
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      setNotification({
        show: true,
        message: "Failed to delete article",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000,
      );
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || article.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || article.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "success";
      case "Draft":
        return "default";
      case "Scheduled":
        return "warning";
      case "Archived":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout currentPage="/admin/articles" setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
            <p className="mt-1 text-slate-600">
              Create and manage educational content
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={handleCreateNew}
          >
            <Plus className="mr-2 h-4 w-4" />
            Write Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Articles
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {articles.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {articles.filter((a) => a.status === "Published").length}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Views
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
                </p>
              </div>
              <div className="rounded-xl bg-purple-100 p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Drafts</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {articles.filter((a) => a.status === "Draft").length}
                </p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3">
                <Edit className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Articles Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {article.featured_image && (
                            <img
                              src={getImageUrl(article.featured_image)}
                              alt={article.title}
                              className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">
                              {article.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              by {article.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default">{article.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {(article.likes_count || 0) +
                              (article.loves_count || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {article.comments_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-900">
                            {formatDate(article.published_at)}
                          </p>
                          <p className="text-slate-500">
                            Updated: {formatDate(article.updated_at)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredArticles.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600">No articles found.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-8 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingArticle ? "Edit Article" : "Create New Article"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Featured Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="relative w-48">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full rounded-lg border border-slate-200"
                          onError={(e) => {
                            console.error("Image load error:", imagePreview);
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                    <label className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 px-6 py-4 text-center hover:border-blue-500">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600">
                        Click to upload image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter article title"
                  />
                </div>

                {/* Author & Category */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Short description of the article"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Konten Artikel *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value: string) =>
                      setFormData({ ...formData, content: value })
                    }
                    placeholder="Tulis konten artikel Anda di sini..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Gunakan toolbar di atas untuk memformat teks, menambahkan
                    heading, list, link, dan gambar.
                  </p>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={formData.hashtags}
                    onChange={(e) =>
                      setFormData({ ...formData, hashtags: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="grammar, tips, learning (comma-separated)"
                  />
                </div>

                {/* SEO Fields */}
                <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">SEO Settings</h3>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) =>
                        setFormData({ ...formData, seo_title: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="SEO-optimized title"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo_description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Meta description for search engines"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "Published"
                          | "Draft"
                          | "Scheduled"
                          | "Archived",
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingArticle ? "Update Article" : "Create Article"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini
                tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1"
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div
              className={`rounded-lg px-6 py-4 shadow-lg ${
                notification.type === "success"
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Articles;
