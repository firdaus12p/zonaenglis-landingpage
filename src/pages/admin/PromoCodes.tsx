import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge, Toast } from "../../components";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  Tag,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  Power,
  PowerOff,
  Users,
  CheckCircle,
  MessageCircle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface PromoCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number;
  used_count: number;
  min_purchase: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  is_active: number;
  applicable_to: string;
  created_at: string;
}

// Promo Tracking Interfaces
interface PromoLead {
  id: number;
  user_name: string;
  user_phone: string;
  user_email?: string;
  program_name?: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  first_used_at: string;
  days_ago: number;
  promo_code: string;
  promo_name: string;
}

interface DeletedPromoLead extends PromoLead {
  deleted_at: string;
  deleted_by?: string;
  days_deleted: number;
}

interface PromoStats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  followups: number;
  conversions: number;
  lost: number;
}

// Modal Components
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "Batal",
  onConfirm,
  onCancel,
  variant = "danger",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    danger: {
      icon: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-amber-100",
      iconColor: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const colors = colorClasses[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors.icon}`}
          >
            {variant === "danger" && (
              <XCircle className={`h-10 w-10 ${colors.iconColor}`} />
            )}
            {variant === "warning" && (
              <AlertCircle className={`h-10 w-10 ${colors.iconColor}`} />
            )}
            {variant === "info" && (
              <AlertCircle className={`h-10 w-10 ${colors.iconColor}`} />
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-600 mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${colors.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessToast = ({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-emerald-900">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-emerald-600 hover:text-emerald-700"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ErrorToast = ({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-sm font-medium text-red-900">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-red-600 hover:text-red-700"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const PromoCodes: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive" | "Expired" | "Upcoming"
  >("All");
  const [filterType, setFilterType] = useState<"All" | "percentage" | "fixed">(
    "All"
  );
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Promo Tracking States
  const [selectedPromo, setSelectedPromo] = useState<number | null>(null);
  const [promoStats, setPromoStats] = useState<PromoStats | null>(null);
  const [promoLeads, setPromoLeads] = useState<PromoLead[]>([]);
  const [lostPromoLeads, setLostPromoLeads] = useState<PromoLead[]>([]);
  const [deletedPromoLeads, setDeletedPromoLeads] = useState<
    DeletedPromoLead[]
  >([]);
  const [activeLeadsTab, setActiveLeadsTab] = useState<
    "active" | "lost" | "deleted"
  >("active");
  const [loadingPromoTracking, setLoadingPromoTracking] = useState(false);

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    variant: "danger",
  });
  const [successToast, setSuccessToast] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });
  const [errorToast, setErrorToast] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  // Fetch promo codes from API
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/promos/admin/all`);
      const data = await res.json();

      if (res.ok) {
        setPromoCodes(data);
      } else {
        setError(data.error || "Failed to fetch promo codes");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/promos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setToast({
          show: true,
          message: "Promo code deleted successfully!",
          type: "success",
        });
        fetchPromoCodes(); // Refresh list
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        setToast({
          show: true,
          message: data.error || "Failed to delete promo code",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to delete promo code",
        type: "error",
      });
      console.error(err);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/promos/${id}/toggle`, {
        method: "PATCH",
      });

      if (res.ok) {
        const data = await res.json();
        setToast({
          show: true,
          message: data.message,
          type: "success",
        });
        fetchPromoCodes(); // Refresh list
      } else {
        const data = await res.json();
        setToast({
          show: true,
          message: data.error || "Failed to toggle status",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to toggle status",
        type: "error",
      });
      console.error(err);
    }
  };

  // Determine status based on dates and is_active flag
  const getStatus = (promo: PromoCode): string => {
    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = new Date(promo.valid_until);

    if (!promo.is_active) return "Inactive";
    if (now < validFrom) return "Upcoming";
    if (now > validUntil) return "Expired";
    return "Active";
  };

  const filteredPromoCodes = promoCodes.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatus(promo);
    const matchesStatus = filterStatus === "All" || status === filterStatus;
    const matchesType =
      filterType === "All" || promo.discount_type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "Expired":
        return "danger";
      case "Upcoming":
        return "warning";
      default:
        return "default";
    }
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discount_type === "percentage") {
      return `${promo.discount_value}%`;
    } else {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(promo.discount_value);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0;
  };

  // Promo Tracking API Functions
  const fetchPromoStats = async (promoId: number) => {
    try {
      const response = await fetch(`${API_BASE}/promos/stats/${promoId}`);
      const data = await response.json();
      if (data.success && data.stats) {
        setPromoStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching promo stats:", error);
    }
  };

  const fetchPromoLeads = async (promoId: number) => {
    try {
      setLoadingPromoTracking(true);
      const response = await fetch(`${API_BASE}/promos/leads/${promoId}`);
      const data = await response.json();
      if (data.success && data.leads) {
        setPromoLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching promo leads:", error);
    } finally {
      setLoadingPromoTracking(false);
    }
  };

  const fetchLostPromoLeads = async (promoId: number) => {
    try {
      const response = await fetch(`${API_BASE}/promos/lost-leads/${promoId}`);
      const data = await response.json();
      if (data.success && data.leads) {
        setLostPromoLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching lost promo leads:", error);
    }
  };

  const fetchDeletedPromoLeads = async (promoId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/promos/deleted-leads/${promoId}`
      );
      const data = await response.json();
      if (data.success && data.leads) {
        setDeletedPromoLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching deleted promo leads:", error);
    }
  };

  const updatePromoLeadStatus = async (
    leadId: number,
    status: "pending" | "contacted" | "converted" | "lost"
  ) => {
    try {
      const response = await fetch(
        `${API_BASE}/promos/update-status/${leadId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follow_up_status: status,
            registered: status === "converted",
          }),
        }
      );
      const data = await response.json();
      if (data.success && selectedPromo) {
        fetchPromoLeads(selectedPromo);
        fetchLostPromoLeads(selectedPromo);
        fetchPromoStats(selectedPromo);
        setSuccessToast({
          isOpen: true,
          message: `Status updated to ${status}`,
        });

        if (status !== "lost" && activeLeadsTab === "lost") {
          setActiveLeadsTab("active");
        }
      } else {
        setErrorToast({
          isOpen: true,
          message: data.error || "Failed to update status",
        });
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      setErrorToast({
        isOpen: true,
        message: "Failed to update status",
      });
    }
  };

  const handleDeletePromoLead = async (leadId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Lead (Soft Delete)",
      message:
        "Data akan disimpan selama 3 hari sebelum dihapus permanen. Anda bisa restore lead ini dalam 3 hari.",
      confirmText: "Hapus (Soft Delete)",
      variant: "warning",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await fetch(`${API_BASE}/promos/lead/${leadId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deleted_by: "admin" }),
          });

          const data = await response.json();

          if (data.success && selectedPromo) {
            fetchPromoLeads(selectedPromo);
            fetchLostPromoLeads(selectedPromo);
            fetchDeletedPromoLeads(selectedPromo);
            fetchPromoStats(selectedPromo);
            setActiveLeadsTab("deleted");
            setSuccessToast({
              isOpen: true,
              message: "Lead berhasil dihapus (soft delete)",
            });
          } else {
            setErrorToast({
              isOpen: true,
              message: data.error || "Failed to delete lead",
            });
          }
        } catch (error) {
          console.error("Error deleting lead:", error);
          setErrorToast({
            isOpen: true,
            message: "Failed to delete lead",
          });
        }
      },
    });
  };

  const handleRestorePromoLead = async (leadId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Restore Lead",
      message:
        "Lead ini akan dikembalikan ke Active Leads dan bisa di-follow up lagi.",
      confirmText: "Restore",
      variant: "info",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await fetch(`${API_BASE}/promos/restore/${leadId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          });

          const data = await response.json();

          if (data.success && selectedPromo) {
            fetchPromoLeads(selectedPromo);
            fetchLostPromoLeads(selectedPromo);
            fetchDeletedPromoLeads(selectedPromo);
            fetchPromoStats(selectedPromo);
            setActiveLeadsTab("active");
            setSuccessToast({
              isOpen: true,
              message: "Lead berhasil dikembalikan ke Active",
            });
          } else {
            setErrorToast({
              isOpen: true,
              message: data.error || "Failed to restore lead",
            });
          }
        } catch (error) {
          console.error("Error restoring lead:", error);
          setErrorToast({
            isOpen: true,
            message: "Failed to restore lead",
          });
        }
      },
    });
  };

  const handlePermanentDeletePromoLead = async (
    leadId: number,
    leadName: string
  ) => {
    // First confirmation
    setConfirmModal({
      isOpen: true,
      title: "⚠️ PERMANENT DELETE WARNING",
      message: `Anda akan MENGHAPUS PERMANEN lead "${leadName}" dari database.\n\nData yang sudah dihapus permanen TIDAK BISA dikembalikan!\n\nLanjutkan ke konfirmasi terakhir?`,
      confirmText: "Lanjutkan",
      variant: "danger",
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        // Second confirmation (final)
        setTimeout(() => {
          setConfirmModal({
            isOpen: true,
            title: "⚠️ KONFIRMASI TERAKHIR",
            message: `Lead "${leadName}" akan dihapus PERMANEN dari database.\n\nKlik "Hapus Permanen" untuk melanjutkan.`,
            confirmText: "Hapus Permanen",
            variant: "danger",
            onConfirm: async () => {
              setConfirmModal({ ...confirmModal, isOpen: false });
              try {
                const response = await fetch(
                  `${API_BASE}/promos/permanent-delete/${leadId}`,
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                  }
                );

                const data = await response.json();

                if (data.success && selectedPromo) {
                  fetchPromoLeads(selectedPromo);
                  fetchLostPromoLeads(selectedPromo);
                  fetchDeletedPromoLeads(selectedPromo);
                  fetchPromoStats(selectedPromo);
                  setSuccessToast({
                    isOpen: true,
                    message: `Lead "${leadName}" berhasil dihapus PERMANEN`,
                  });
                } else {
                  setErrorToast({
                    isOpen: true,
                    message: data.error || "Failed to permanently delete lead",
                  });
                }
              } catch (error) {
                console.error("Error permanently deleting lead:", error);
                setErrorToast({
                  isOpen: true,
                  message: "Failed to permanently delete lead",
                });
              }
            },
          });
        }, 300);
      },
    });
  };

  // useEffect for fetching tracking data when promo is selected
  useEffect(() => {
    if (selectedPromo) {
      fetchPromoStats(selectedPromo);
      fetchPromoLeads(selectedPromo);
      fetchLostPromoLeads(selectedPromo);
      fetchDeletedPromoLeads(selectedPromo);
    }
  }, [selectedPromo]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({
      show: true,
      message: `Code "${text}" copied to clipboard!`,
      type: "success",
    });
  };

  return (
    <AdminLayout currentPage="/admin/promos" setCurrentPage={setCurrentPage}>
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Promo Codes</h1>
            <p className="text-slate-600 mt-1">
              Create and manage discount codes for your courses
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => navigate("/admin/promos/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Promo Code
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading promo codes...</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Codes
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {promoCodes.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Active Codes
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {
                        promoCodes.filter((p) => getStatus(p) === "Active")
                          .length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Usage
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {promoCodes.reduce((sum, p) => sum + p.used_count, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Percent className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Expiring Soon
                    </p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {
                        promoCodes.filter((p) => {
                          const expiry = new Date(p.valid_until);
                          const now = new Date();
                          const diffDays = Math.ceil(
                            (expiry.getTime() - now.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return diffDays <= 7 && diffDays > 0;
                        }).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="h-6 w-6 text-amber-600" />
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
                    placeholder="Search promo codes..."
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Expired">Expired</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value as typeof filterType)
                    }
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All">All Types</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Promo Codes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromoCodes.map((promo) => {
                const status = getStatus(promo);
                const usagePercentage = getUsagePercentage(
                  promo.used_count,
                  promo.usage_limit || 0
                );

                return (
                  <Card key={promo.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {promo.name}
                          </h3>
                          <Badge variant={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(promo.code)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleActive(promo.id)}
                          className={`p-2 rounded-lg hover:bg-slate-50 ${
                            promo.is_active
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title={
                            promo.is_active
                              ? "Deactivate promo"
                              : "Activate promo"
                          }
                        >
                          {promo.is_active ? (
                            <Power className="h-4 w-4" />
                          ) : (
                            <PowerOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/promos/edit/${promo.id}`)
                          }
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(promo.id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm === promo.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="p-6 max-w-md mx-4">
                          <h3 className="text-lg font-bold text-slate-900 mb-2">
                            Hapus Kode Promo?
                          </h3>
                          <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus "{promo.code}"?
                            Tindakan ini tidak dapat dibatalkan.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="secondary"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Batal
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => handleDelete(promo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Discount Info */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Discount</span>
                        <span className="text-lg font-bold text-blue-600">
                          {getDiscountDisplay(promo)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Min. Order</span>
                        <span className="text-slate-900 font-medium">
                          {formatCurrency(promo.min_purchase)}
                        </span>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Usage</span>
                        <span className="text-sm text-slate-900 font-medium">
                          {promo.used_count} / {promo.usage_limit || "∞"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usagePercentage >= 90
                              ? "bg-red-500"
                              : usagePercentage >= 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(usagePercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-4">
                      <div className="flex items-center text-slate-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Valid</span>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-600">
                          {formatDate(promo.valid_from)}
                        </div>
                        <div className="text-slate-400">
                          to {formatDate(promo.valid_until)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredPromoCodes.length === 0 && !loading && (
              <Card className="p-12">
                <div className="text-center">
                  <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No promo codes found
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {searchTerm ||
                    filterStatus !== "All" ||
                    filterType !== "All"
                      ? "Try adjusting your search or filters."
                      : "Get started by creating your first promo code."}
                  </p>
                  {!searchTerm &&
                    filterStatus === "All" &&
                    filterType === "All" && (
                      <Button
                        variant="primary"
                        onClick={() => navigate("/admin/promos/new")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Promo Code
                      </Button>
                    )}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Promo Usage Tracking Dashboard */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Promo Code Usage Tracking
                </h2>
                <p className="text-slate-600 mt-1">
                  Monitor dan kelola users yang menggunakan promo codes
                </p>
              </div>
            </div>

            {/* Promo Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pilih Promo Code
              </label>
              <select
                value={selectedPromo || ""}
                onChange={(e) =>
                  setSelectedPromo(Number(e.target.value) || null)
                }
                className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Promo Code...</option>
                {promoCodes.map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.code} - {promo.name} (Used: {promo.used_count})
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Cards */}
            {selectedPromo && promoStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Total Uses</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.total_uses}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-600">Today</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.today_uses}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.pending_followups}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Follow Up</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.followups}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600">Conversions</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.conversions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-slate-600">Lost</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {promoStats.lost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Tables */}
            {selectedPromo && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Leads untuk{" "}
                    {promoCodes.find((p) => p.id === selectedPromo)?.code}
                  </h3>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveLeadsTab("active")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeLeadsTab === "active"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Active Leads ({promoLeads.length})
                    </button>
                    <button
                      onClick={() => setActiveLeadsTab("lost")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeLeadsTab === "lost"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Lost ({lostPromoLeads.length})
                    </button>
                    <button
                      onClick={() => setActiveLeadsTab("deleted")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeLeadsTab === "deleted"
                          ? "border-slate-600 text-slate-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Riwayat Terhapus ({deletedPromoLeads.length})
                    </button>
                  </div>
                </div>

                {loadingPromoTracking ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : (
                  <>
                    {/* Active Leads Tab */}
                    {activeLeadsTab === "active" &&
                      (promoLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada active leads untuk promo code ini.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50 border-y border-slate-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Nama
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  WhatsApp
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Program
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Discount
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Days Ago
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {promoLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm text-slate-900">
                                    {lead.user_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <a
                                      href={`https://wa.me/${lead.user_phone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                      <span>{lead.user_phone}</span>
                                    </a>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.user_email || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.program_name || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                    Rp{" "}
                                    {lead.discount_amount.toLocaleString(
                                      "id-ID"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.days_ago}d ago
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge
                                      variant={
                                        lead.follow_up_status === "converted"
                                          ? "success"
                                          : lead.follow_up_status ===
                                            "contacted"
                                          ? "warning"
                                          : "secondary"
                                      }
                                    >
                                      {lead.follow_up_status === "pending"
                                        ? "Pending"
                                        : lead.follow_up_status === "contacted"
                                        ? "Follow Up"
                                        : "Conversion"}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={lead.follow_up_status}
                                        onChange={(e) =>
                                          updatePromoLeadStatus(
                                            lead.id,
                                            e.target.value as any
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="contacted">
                                          Follow Up
                                        </option>
                                        <option value="converted">
                                          Conversion
                                        </option>
                                        <option value="lost">Lost</option>
                                      </select>
                                      <button
                                        onClick={() =>
                                          handleDeletePromoLead(lead.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                        title="Delete Lead"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                    {/* Lost Leads Tab */}
                    {activeLeadsTab === "lost" &&
                      (lostPromoLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada lost leads untuk promo code ini.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-red-50 border-y border-red-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Nama
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  WhatsApp
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Program
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Discount
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Days Ago
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {lostPromoLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm text-slate-900">
                                    {lead.user_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <a
                                      href={`https://wa.me/${lead.user_phone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                      <span>{lead.user_phone}</span>
                                    </a>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.user_email || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.program_name || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                    Rp{" "}
                                    {lead.discount_amount.toLocaleString(
                                      "id-ID"
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.days_ago}d ago
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={lead.follow_up_status}
                                        onChange={(e) =>
                                          updatePromoLeadStatus(
                                            lead.id,
                                            e.target.value as any
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      >
                                        <option value="lost">Lost</option>
                                        <option value="pending">
                                          Restore to Pending
                                        </option>
                                        <option value="contacted">
                                          Restore to Follow Up
                                        </option>
                                        <option value="converted">
                                          Restore to Conversion
                                        </option>
                                      </select>

                                      <button
                                        onClick={() =>
                                          handleDeletePromoLead(lead.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                        title="Delete Lead"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}

                    {/* Deleted History Tab */}
                    {activeLeadsTab === "deleted" &&
                      (deletedPromoLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada deleted leads untuk promo code ini.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-100 border-y border-slate-300">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Nama
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  WhatsApp
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Program
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Dihapus Pada
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Hari Sebelum Dihapus Permanen
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Dihapus Oleh
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                                  Aksi
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {deletedPromoLeads.map((lead) => (
                                <tr
                                  key={lead.id}
                                  className="hover:bg-slate-50 opacity-70"
                                >
                                  <td className="px-4 py-3 text-sm text-slate-900">
                                    {lead.user_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.user_phone}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.user_email || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.program_name || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {new Date(
                                      lead.deleted_at
                                    ).toLocaleDateString("id-ID")}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <Badge
                                      variant={
                                        3 - lead.days_deleted <= 1
                                          ? "danger"
                                          : "warning"
                                      }
                                    >
                                      {3 - lead.days_deleted} day
                                      {3 - lead.days_deleted !== 1 ? "s" : ""}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.deleted_by || "admin"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          handleRestorePromoLead(lead.id)
                                        }
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Restore this lead"
                                      >
                                        Restore
                                      </button>
                                      <button
                                        onClick={() =>
                                          handlePermanentDeletePromoLead(
                                            lead.id,
                                            lead.user_name
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                                        title="Hapus PERMANEN lead ini"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>Hapus</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Modals */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          variant={confirmModal.variant}
        />
        <SuccessToast
          isOpen={successToast.isOpen}
          message={successToast.message}
          onClose={() => setSuccessToast({ isOpen: false, message: "" })}
        />
        <ErrorToast
          isOpen={errorToast.isOpen}
          message={errorToast.message}
          onClose={() => setErrorToast({ isOpen: false, message: "" })}
        />
      </div>
    </AdminLayout>
  );
};

export default PromoCodes;
