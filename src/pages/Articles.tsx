import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Tag,
  ArrowLeft,
  ThumbsUp,
  Send,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { API_BASE } from "../config/api";
import { SEOHead } from "../components";
import { PAGE_SEO, COMPANY_INFO } from "../config/seo";

// Helper function to generate full image URL
const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return "";

  // If already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If starts with /uploads/, prepend backend URL
  if (imagePath.startsWith("/uploads/")) {
    const backendUrl = API_BASE.replace("/api", "");
    return `${backendUrl}${imagePath}`;
  }

  // Fallback for any other relative path
  return `${API_BASE.replace("/api", "")}${imagePath}`;
};

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: string;
  published_at: string;
  views: number;
  likes_count: number;
  loves_count: number;
  comments_count: number;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface ArticleImage {
  id: number;
  image_url: string;
  caption: string | null;
  display_order: number;
}

interface ArticleComment {
  id: number;
  user_name: string;
  user_email: string;
  comment: string;
  created_at: string;
}

interface ArticleDetail extends Article {
  hashtags: string[];
  images: ArticleImage[];
  approved_comments: ArticleComment[];
}

// =====================================================
// MODAL COMPONENTS
// =====================================================

const SuccessModal = ({
  isOpen,
  onClose,
  title = "Success!",
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-scale-in">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          {/* Success Message */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mb-6 text-sm text-slate-600">{message}</p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorModal = ({
  isOpen,
  onClose,
  title = "Oops!",
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-scale-in">
        <div className="flex flex-col items-center text-center">
          {/* Close X button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Error Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>

          {/* Error Message */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mb-6 text-sm text-slate-600">{message}</p>

          {/* Action Buttons */}
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }: { article: Article }) => {
  const handleViewArticle = async () => {
    try {
      await fetch(`${API_BASE}/articles/${article.id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  return (
    <Link
      to={`/articles/${article.slug}`}
      onClick={handleViewArticle}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      {article.featured_image && (
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={getImageUrl(article.featured_image)}
            alt={article.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(article.published_at).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-700">
          {article.title}
        </h3>
        <p className="mb-4 text-slate-600 line-clamp-3">{article.excerpt}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {article.likes_count + article.loves_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {article.comments_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ArticlesList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState("");

  // Debounce search query - 400ms delay before triggering API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchHashtags();
  }, [selectedCategory, debouncedSearchQuery, selectedHashtag]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (selectedHashtag) params.append("hashtag", selectedHashtag);

      const response = await fetch(`${API_BASE}/articles/public?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      const result = await response.json();
      const data = result.data || result; // Handle both {data: [...]} and [...] formats
      setArticles(data || []);
      setError("");
      setShowErrorModal(false);
    } catch (err) {
      setError("Failed to load articles. Please try again.");
      setShowErrorModal(true);
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/articles/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result = await response.json();
      const data = result.data || result; // Handle both {data: [...]} and [...] formats
      setCategories(["All", ...data.map((c: any) => c.category)]);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchHashtags = async () => {
    try {
      const response = await fetch(`${API_BASE}/articles/hashtags`);
      if (!response.ok) throw new Error("Failed to fetch hashtags");
      const result = await response.json();
      const data = result.data || result; // Handle both {data: [...]} and [...] formats
      setHashtags(data.map((h: any) => h.hashtag));
    } catch (err) {
      console.error("Error fetching hashtags:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* SEO Meta Tags */}
      <SEOHead
        title={PAGE_SEO.articles.title}
        description={PAGE_SEO.articles.description}
        keywords={PAGE_SEO.articles.keywords}
        path={PAGE_SEO.articles.path}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-emerald-600 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
            Articles & Tips
          </h1>
          <p className="text-center text-lg text-white/90">
            Learn English with our expert articles and study tips
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Hashtag Pills */}
          {hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedHashtag("")}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedHashtag === ""
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Tags
              </button>
              {hashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedHashtag(tag)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedHashtag === tag
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No articles found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
        message={error}
      />
    </div>
  );
};

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [userReaction, setUserReaction] = useState<"like" | "love" | null>(
    null
  );
  const [commentForm, setCommentForm] = useState({
    user_name: "",
    user_email: "",
    comment: "",
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
      fetchUserReaction();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/articles/public/${slug}`);
      if (!response.ok) throw new Error("Article not found");
      const result = await response.json();
      const articleData = result.data || result; // Handle both {data: {...}} and {...} formats
      setArticle(articleData);
      setError("");
      setShowErrorModal(false);

      // Track view
      await fetch(`${API_BASE}/articles/${articleData.id}/view`, {
        method: "POST",
      });
    } catch (err) {
      setError("Failed to load article. Please try again.");
      setShowErrorModal(true);
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReaction = async () => {
    if (!article) return;
    try {
      const response = await fetch(
        `${API_BASE}/articles/${article.id}/user-reaction`
      );
      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.reaction);
      }
    } catch (err) {
      console.error("Error fetching user reaction:", err);
    }
  };

  const handleReaction = async (type: "like" | "love") => {
    if (!article) return;
    try {
      const response = await fetch(`${API_BASE}/articles/${article.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: type }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserReaction(data.user_reaction);
        // Update counts
        setArticle({
          ...article,
          likes_count: data.likes_count,
          loves_count: data.loves_count,
        });
      }
    } catch (err) {
      console.error("Error submitting reaction:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(
        `${API_BASE}/articles/${article.id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(commentForm),
        }
      );

      if (response.ok) {
        setShowSuccessModal(true);
        setCommentForm({ user_name: "", user_email: "", comment: "" });

        // Auto close modal after 5 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 5000);
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="mb-4 text-slate-700">Artikel tidak ditemukan</p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Dynamic SEO Meta Tags for Article */}
      <SEOHead
        title={article.seo_title || `${article.title} | Zona English`}
        description={article.seo_description || article.excerpt}
        path={`/articles/${article.slug}`}
        image={article.featured_image || undefined}
        type="article"
        article={{
          author: article.author || COMPANY_INFO.name,
          publishedTime: article.published_at,
          section: article.category,
          tags: article.hashtags,
        }}
      />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {article.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(article.published_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {article.author}
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
              {article.title}
            </h1>

            <p className="text-xl text-slate-600">{article.excerpt}</p>

            {/* Stats */}
            <div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {article.likes_count + article.loves_count} reactions
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {article.comments_count} comments
              </span>
            </div>

            {/* Hashtags */}
            {article.hashtags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/articles?hashtag=${tag}`}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8 overflow-hidden rounded-2xl">
              <img
                src={getImageUrl(article.featured_image)}
                alt={article.title}
                className="h-auto w-full"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-700 prose-strong:text-slate-900"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content, {
                ALLOWED_TAGS: [
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "p",
                  "br",
                  "hr",
                  "ul",
                  "ol",
                  "li",
                  "blockquote",
                  "pre",
                  "code",
                  "a",
                  "strong",
                  "em",
                  "u",
                  "s",
                  "img",
                  "table",
                  "thead",
                  "tbody",
                  "tr",
                  "th",
                  "td",
                  "div",
                  "span",
                ],
                ALLOWED_ATTR: [
                  "href",
                  "src",
                  "alt",
                  "title",
                  "class",
                  "id",
                  "target",
                  "rel",
                ],
                ALLOW_DATA_ATTR: false,
              }),
            }}
          />

          {/* Additional Images */}
          {article.images.length > 0 && (
            <div className="mt-8 space-y-6">
              {article.images
                .sort((a, b) => a.display_order - b.display_order)
                .map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-2xl">
                    <img
                      src={getImageUrl(img.image_url)}
                      alt={img.caption || ""}
                      className="h-auto w-full"
                    />
                    {img.caption && (
                      <p className="mt-2 text-center text-sm text-slate-500">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Reactions */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Did you find this helpful?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleReaction("like")}
                className={`flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition-all ${
                  userReaction === "like"
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-300 text-slate-700 hover:border-blue-700 hover:text-blue-700"
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                Like ({article.likes_count})
              </button>
              <button
                onClick={() => handleReaction("love")}
                className={`flex items-center gap-2 rounded-lg border px-6 py-3 font-medium transition-all ${
                  userReaction === "love"
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-slate-300 text-slate-700 hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart className="h-5 w-5" />
                Love ({article.loves_count})
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">
              Comments ({article.comments_count})
            </h3>

            {/* Comment Form */}
            <form
              onSubmit={handleCommentSubmit}
              className="mb-8 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h4 className="mb-4 text-lg font-semibold text-slate-900">
                Leave a Comment
              </h4>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={commentForm.user_name}
                    onChange={(e) =>
                      setCommentForm({
                        ...commentForm,
                        user_name: e.target.value,
                      })
                    }
                    required
                    className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={commentForm.user_email}
                    onChange={(e) =>
                      setCommentForm({
                        ...commentForm,
                        user_email: e.target.value,
                      })
                    }
                    required
                    className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <textarea
                  placeholder="Your comment..."
                  value={commentForm.comment}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, comment: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
                >
                  {submittingComment ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  Kirim Komentar
                </button>
              </div>
            </form>

            {/* Approved Comments */}
            <div className="space-y-4">
              {article.approved_comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {comment.user_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-700">{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Success Modal - Comment Submitted */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
        }}
        title="Komentar Terkirim!"
        message="Komentar Anda berhasil dikirim. Komentar akan muncul setelah disetujui oleh admin kami."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setError("");
        }}
        message={error}
      />
    </div>
  );
};

const Articles = () => {
  const { slug } = useParams<{ slug: string }>();

  return slug ? <ArticleDetail /> : <ArticlesList />;
};

export default Articles;
