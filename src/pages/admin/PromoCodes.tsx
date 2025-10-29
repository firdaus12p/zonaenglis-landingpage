import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const API_BASE = "http://localhost:3001/api";

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
                            Delete Promo Code?
                          </h3>
                          <p className="text-slate-600 mb-6">
                            Are you sure you want to delete "{promo.code}"? This
                            action cannot be undone.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="secondary"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => handleDelete(promo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
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
      </div>
    </AdminLayout>
  );
};

export default PromoCodes;
