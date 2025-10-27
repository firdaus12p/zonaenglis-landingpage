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
  Copy,
  Calendar,
  Percent,
  Tag,
  TrendingUp,
  Clock,
} from "lucide-react";

interface PromoCode {
  id: number;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  usageLimit: number;
  usageCount: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  status: "Active" | "Inactive" | "Expired" | "Upcoming";
  createdBy: string;
  createdAt: string;
}

const PromoCodes: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive" | "Expired" | "Upcoming"
  >("All");
  const [filterType, setFilterType] = useState<"All" | "percentage" | "fixed">(
    "All"
  );

  // Mock data - akan diganti dengan data real dari API
  const promoCodes: PromoCode[] = [
    {
      id: 1,
      code: "EARLY50",
      name: "Early Bird Discount",
      discountType: "percentage",
      discountValue: 50,
      usageLimit: 100,
      usageCount: 67,
      minOrderAmount: 500000,
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      status: "Active",
      createdBy: "Admin",
      createdAt: "2024-01-01",
    },
    {
      id: 2,
      code: "STUDENT25",
      name: "Student Discount",
      discountType: "percentage",
      discountValue: 25,
      usageLimit: 200,
      usageCount: 124,
      minOrderAmount: 300000,
      validFrom: "2024-01-15",
      validUntil: "2024-06-30",
      status: "Active",
      createdBy: "Admin",
      createdAt: "2024-01-15",
    },
    {
      id: 3,
      code: "WELCOME100K",
      name: "Welcome Bonus",
      discountType: "fixed",
      discountValue: 100000,
      usageLimit: 50,
      usageCount: 50,
      minOrderAmount: 1000000,
      validFrom: "2024-02-01",
      validUntil: "2024-02-29",
      status: "Expired",
      createdBy: "Admin",
      createdAt: "2024-02-01",
    },
    {
      id: 4,
      code: "RAMADAN30",
      name: "Ramadan Special",
      discountType: "percentage",
      discountValue: 30,
      usageLimit: 150,
      usageCount: 0,
      minOrderAmount: 400000,
      validFrom: "2024-03-10",
      validUntil: "2024-04-10",
      status: "Upcoming",
      createdBy: "Admin",
      createdAt: "2024-03-01",
    },
    {
      id: 5,
      code: "FRIEND15",
      name: "Friend Referral",
      discountType: "percentage",
      discountValue: 15,
      usageLimit: 500,
      usageCount: 23,
      minOrderAmount: 200000,
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      status: "Inactive",
      createdBy: "Admin",
      createdAt: "2024-01-01",
    },
  ];

  const filteredPromoCodes = promoCodes.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || promo.status === filterStatus;
    const matchesType =
      filterType === "All" || promo.discountType === filterType;

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
    if (promo.discountType === "percentage") {
      return `${promo.discountValue}%`;
    } else {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(promo.discountValue);
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
    // Show toast notification here
  };

  return (
    <AdminLayout currentPage="admin-promos" setCurrentPage={setCurrentPage}>
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
            onClick={() => (window.location.href = "/admin/promos/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Promo Code
          </Button>
        </div>

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
                  {promoCodes.filter((p) => p.status === "Active").length}
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
                  {promoCodes.reduce((sum, p) => sum + p.usageCount, 0)}
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
                      const expiry = new Date(p.validUntil);
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
            const usagePercentage = getUsagePercentage(
              promo.usageCount,
              promo.usageLimit
            );

            return (
              <Card key={promo.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {promo.name}
                      </h3>
                      <Badge variant={getStatusColor(promo.status)}>
                        {promo.status}
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
                      {formatCurrency(promo.minOrderAmount)}
                    </span>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Usage</span>
                    <span className="text-sm text-slate-900 font-medium">
                      {promo.usageCount} / {promo.usageLimit}
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
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
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
                      {formatDate(promo.validFrom)}
                    </div>
                    <div className="text-slate-400">
                      to {formatDate(promo.validUntil)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredPromoCodes.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No promo codes found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterStatus !== "All" || filterType !== "All"
                  ? "Try adjusting your search or filters."
                  : "Get started by creating your first promo code."}
              </p>
              {!searchTerm &&
                filterStatus === "All" &&
                filterType === "All" && (
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promo Code
                  </Button>
                )}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default PromoCodes;
