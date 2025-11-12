import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Search,
  Filter,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface Comment {
  id: number;
  article_id: number;
  article_title: string;
  article_slug: string;
  user_name: string;
  user_email: string;
  comment: string;
  status: "Pending" | "Approved" | "Spam" | "Deleted";
  created_at: string;
}

const ArticleComments: React.FC<{
  setCurrentPage: (page: string) => void;
}> = ({ setCurrentPage }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchComments();
  }, [filterStatus]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "All") {
        params.append("status", filterStatus);
      }

      const response = await fetch(
        `${API_BASE}/articles/admin/comments?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch comments");

      const result = await response.json();
      setComments(result.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setNotification({
        show: true,
        message: "Failed to load comments",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/articles/admin/comments/${id}/approve`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) throw new Error("Failed to approve comment");

      setNotification({
        show: true,
        message: "Comment approved successfully!",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000
      );
      fetchComments();
    } catch (error) {
      console.error("Error approving comment:", error);
      setNotification({
        show: true,
        message: "Failed to approve comment",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/articles/admin/comments/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      setNotification({
        show: true,
        message: "Comment deleted successfully!",
        type: "success",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000
      );
      setShowDeleteConfirm(null);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      setNotification({
        show: true,
        message: "Failed to delete comment",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        3000
      );
    }
  };

  const filteredComments = comments.filter(
    (comment) =>
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.article_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Spam":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout
      currentPage="/admin/articles/comments"
      setCurrentPage={setCurrentPage}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Article Comments
          </h1>
          <p className="mt-1 text-slate-600">
            Manage and moderate user comments on articles
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Comments
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {comments.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {comments.filter((c) => c.status === "Pending").length}
                </p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3">
                <Filter className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {comments.filter((c) => c.status === "Approved").length}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Spam</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {comments.filter((c) => c.status === "Spam").length}
                </p>
              </div>
              <div className="rounded-xl bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search comments..."
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Spam">Spam</option>
            </select>
          </div>
        </Card>

        {/* Comments List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Article Info */}
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        Article:
                      </span>
                      <a
                        href={`/articles/${comment.article_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {comment.article_title}
                      </a>
                    </div>

                    {/* User Info */}
                    <div className="mb-3 flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {comment.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {comment.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(comment.created_at)}
                      </span>
                      <Badge variant={getStatusColor(comment.status)}>
                        {comment.status}
                      </Badge>
                    </div>

                    {/* Comment Content */}
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-slate-700">{comment.comment}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    {comment.status === "Pending" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(comment.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredComments.length === 0 && (
              <Card className="p-12 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-600">No comments found.</p>
              </Card>
            )}
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
                Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini
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

export default ArticleComments;
