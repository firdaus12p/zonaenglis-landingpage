import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  User,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
}

const Articles: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Published" | "Draft" | "Scheduled" | "Archived"
  >("All");
  const [filterCategory, setFilterCategory] = useState<
    | "All"
    | "Grammar"
    | "Vocabulary"
    | "Speaking"
    | "Listening"
    | "Tips"
    | "News"
  >("All");

  // Mock data - akan diganti dengan data real dari API
  const articles: Article[] = [
    {
      id: 1,
      title: "Tips Mudah Belajar Grammar Bahasa Inggris untuk Pemula",
      slug: "tips-mudah-belajar-grammar-bahasa-inggris-pemula",
      excerpt:
        "Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami dan praktis untuk diterapkan.",
      content: "Content here...",
      author: "Admin",
      category: "Grammar",
      tags: ["grammar", "tips", "pemula", "belajar"],
      status: "Published",
      publishedAt: "2024-03-15",
      updatedAt: "2024-03-15",
      views: 1247,
      likes: 89,
      comments: 23,
      featured: true,
      seoTitle:
        "Tips Mudah Belajar Grammar Bahasa Inggris untuk Pemula | Zona English",
      seoDescription:
        "Pelajari cara efektif menguasai grammar bahasa Inggris dengan metode yang mudah dipahami. Cocok untuk pemula yang ingin belajar bahasa Inggris.",
      featuredImage: "/images/grammar-tips.jpg",
    },
    {
      id: 2,
      title: "50 Vocabulary Harian yang Wajib Dikuasai",
      slug: "50-vocabulary-harian-wajib-dikuasai",
      excerpt:
        "Kumpulan 50 kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari beserta contoh penggunaannya.",
      content: "Content here...",
      author: "Sarah Teacher",
      category: "Vocabulary",
      tags: ["vocabulary", "daily", "conversation", "practice"],
      status: "Published",
      publishedAt: "2024-03-12",
      updatedAt: "2024-03-12",
      views: 892,
      likes: 67,
      comments: 18,
      featured: false,
      seoTitle: "50 Vocabulary Harian yang Wajib Dikuasai | Zona English",
      seoDescription:
        "Kumpulan 50 kosakata bahasa Inggris untuk percakapan sehari-hari. Tingkatkan kemampuan vocabulary Anda dengan daftar lengkap ini.",
      featuredImage: "/images/vocabulary-daily.jpg",
    },
    {
      id: 3,
      title: "Cara Meningkatkan Speaking Skill dengan Confidence",
      slug: "cara-meningkatkan-speaking-skill-confidence",
      excerpt:
        "Strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri tanpa takut salah.",
      content: "Content here...",
      author: "Michael English",
      category: "Speaking",
      tags: ["speaking", "confidence", "practice", "fluency"],
      status: "Draft",
      publishedAt: "",
      updatedAt: "2024-03-18",
      views: 0,
      likes: 0,
      comments: 0,
      featured: false,
      seoTitle:
        "Cara Meningkatkan Speaking Skill dengan Confidence | Zona English",
      seoDescription:
        "Pelajari strategi praktis untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri. Tips dari expert Zona English.",
      featuredImage: "/images/speaking-confidence.jpg",
    },
    {
      id: 4,
      title: "Listening Exercise: Understanding Native Speakers",
      slug: "listening-exercise-understanding-native-speakers",
      excerpt:
        "Latihan listening comprehension untuk memahami percakapan native speaker dengan aksen dan kecepatan berbicara yang natural.",
      content: "Content here...",
      author: "Emma Native",
      category: "Listening",
      tags: ["listening", "native", "comprehension", "exercise"],
      status: "Scheduled",
      publishedAt: "2024-03-25",
      updatedAt: "2024-03-18",
      views: 0,
      likes: 0,
      comments: 0,
      featured: true,
      seoTitle:
        "Listening Exercise: Understanding Native Speakers | Zona English",
      seoDescription:
        "Latihan listening comprehension untuk memahami native speaker. Tingkatkan kemampuan mendengar bahasa Inggris Anda.",
      featuredImage: "/images/listening-native.jpg",
    },
    {
      id: 5,
      title: "Common Mistakes in English and How to Avoid Them",
      slug: "common-mistakes-english-how-avoid-them",
      excerpt:
        "Daftar kesalahan umum yang sering dilakukan pembelajar bahasa Inggris Indonesia beserta cara menghindarinya.",
      content: "Content here...",
      author: "Admin",
      category: "Tips",
      tags: ["mistakes", "common", "avoid", "learning"],
      status: "Published",
      publishedAt: "2024-03-10",
      updatedAt: "2024-03-10",
      views: 1156,
      likes: 94,
      comments: 31,
      featured: false,
      seoTitle:
        "Common Mistakes in English and How to Avoid Them | Zona English",
      seoDescription:
        "Pelajari kesalahan umum dalam bahasa Inggris dan cara menghindarinya. Tips praktis untuk pembelajar Indonesia.",
      featuredImage: "/images/common-mistakes.jpg",
    },
  ];

  const categories = [
    "All",
    "Grammar",
    "Vocabulary",
    "Speaking",
    "Listening",
    "Tips",
    "News",
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Grammar":
        return "primary";
      case "Vocabulary":
        return "secondary";
      case "Speaking":
        return "info";
      case "Listening":
        return "success";
      case "Tips":
        return "warning";
      case "News":
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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <AdminLayout currentPage="/admin/articles" setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
            <p className="text-slate-600 mt-1">
              Create and manage educational content for your students
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = "/admin/articles/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Articles
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {articles.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {articles.filter((a) => a.status === "Published").length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
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
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatNumber(articles.reduce((sum, a) => sum + a.views, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Likes
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {articles.reduce((sum, a) => sum + a.likes, 0)}
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-xl">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Drafts</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {articles.filter((a) => a.status === "Draft").length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Edit className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value as typeof filterCategory)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Articles Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={getStatusColor(article.status)}>
                      {article.status}
                    </Badge>
                    <Badge variant={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    {article.featured && (
                      <Badge variant="warning">Featured</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Article Stats */}
              <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {formatNumber(article.views)}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {article.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {article.comments}
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {article.author}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                    +{article.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {article.status === "Published"
                      ? "Published"
                      : article.status === "Scheduled"
                      ? "Scheduled for"
                      : "Updated"}{" "}
                    {formatDate(article.publishedAt || article.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Share article"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="View analytics"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm ||
                filterStatus !== "All" ||
                filterCategory !== "All"
                  ? "Try adjusting your search or filters."
                  : "Start creating educational content for your students."}
              </p>
              {!searchTerm &&
                filterStatus === "All" &&
                filterCategory === "All" && (
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Article
                  </Button>
                )}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Articles;
