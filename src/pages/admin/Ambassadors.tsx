import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  Plus,
  Users,
  Link2,
  MoreVertical,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

interface Ambassador {
  id: number;
  name: string;
  type: "Senior Ambassador" | "Campus Ambassador" | "Community Ambassador";
  role: "Ambassador" | "Affiliate";
  location: string;
  address: string;
  photo: string; // URL or base64 string
  affiliateCode: string;
  joinDate: string;
  email: string;
  phone: string;
  testimonial: string;
}

// Affiliate Tracking Interfaces
interface AffiliateLead {
  id: number;
  user_name: string;
  user_phone: string;
  user_email?: string;
  user_city?: string;
  affiliate_code: string;
  ambassador_name?: string;
  ambassador_phone?: string;
  program_name: string;
  discount_applied: number;
  first_used_at: string;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  days_ago: number;
}

interface AffiliateStats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  conversions: number;
  conversion_rate: number;
}

const Ambassadors: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "All" | "Senior Ambassador" | "Campus Ambassador" | "Community Ambassador"
  >("All");
  const [filterRole, setFilterRole] = useState<
    "All" | "Ambassador" | "Affiliate"
  >("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  // Affiliate Tracking States
  const [selectedAmbassador, setSelectedAmbassador] = useState<number | null>(
    null
  );
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(
    null
  );
  const [affiliateLeads, setAffiliateLeads] = useState<AffiliateLead[]>([]);
  const [loadingAffiliate, setLoadingAffiliate] = useState(false);

  // Function to load ambassadors from API
  const loadAmbassadors = async () => {
    try {
      console.log("🔄 Fetching ambassadors from API...");
      const response = await fetch("http://localhost:3001/api/ambassadors");

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Loaded ambassadors from API:", data);

      // Transform API data to match Admin interface
      const transformedData = data.map((ambassador: any) => ({
        id: ambassador.id,
        name: ambassador.name,
        type:
          ambassador.role === "Senior Ambassador"
            ? "Senior Ambassador"
            : ambassador.role === "Campus Ambassador"
            ? "Campus Ambassador"
            : ambassador.role === "Community Ambassador"
            ? "Community Ambassador"
            : "Junior Ambassador",
        // Determine Ambassador vs Affiliate based on type
        // Senior Ambassador = Ambassador, Others = Affiliate
        role:
          ambassador.role === "Senior Ambassador" ? "Ambassador" : "Affiliate",
        location: ambassador.location || "N/A",
        address: ambassador.institution || "N/A",
        photo: ambassador.photo_url || "/images/ambassadors/default.jpg",
        affiliateCode: ambassador.affiliate_code,
        joinDate:
          ambassador.join_date || new Date().toISOString().split("T")[0],
        email: ambassador.email || "N/A",
        phone: ambassador.phone || "N/A",
        testimonial: ambassador.testimonial || "",
      }));

      setAmbassadors(transformedData);
      console.log("✅ Ambassadors data transformed and loaded");
    } catch (error) {
      console.error("❌ Error loading ambassadors from API:", error);
      alert(
        "Failed to load ambassadors. Please check if the backend is running."
      );
    }
  };

  // Load ambassadors from API on component mount
  useEffect(() => {
    loadAmbassadors();
  }, []);

  // Listen for custom events to refresh data
  useEffect(() => {
    const handleDataUpdate = () => {
      loadAmbassadors();
    };

    window.addEventListener("ambassadorDataUpdated", handleDataUpdate);

    return () => {
      window.removeEventListener("ambassadorDataUpdated", handleDataUpdate);
    };
  }, []);

  // CRUD Functions
  const handleDeleteAmbassador = async (id: number) => {
    try {
      // Call API to delete from database
      const response = await fetch(
        `http://localhost:3001/api/ambassadors/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete ambassador");
      }

      // Update local state after successful API call
      const updatedAmbassadors = ambassadors.filter(
        (ambassador) => ambassador.id !== id
      );
      setAmbassadors(updatedAmbassadors);
      setShowDeleteConfirm(null);

      // Trigger event to notify other components
      window.dispatchEvent(new CustomEvent("ambassadorDataUpdated"));

      console.log("✅ Ambassador deleted successfully from database");
    } catch (error) {
      console.error("❌ Error deleting ambassador:", error);
      alert("Failed to delete ambassador. Please try again.");
    }
  };

  const handleEditAmbassador = (ambassador: Ambassador) => {
    // Store selected ambassador for editing
    localStorage.setItem("editingAmbassador", JSON.stringify(ambassador));
    setCurrentPage(`/admin/ambassadors/edit/${ambassador.id}`);
  };

  const handleAddAmbassador = () => {
    setCurrentPage("/admin/ambassadors/new");
  };

  // Affiliate Tracking Functions
  useEffect(() => {
    if (selectedAmbassador) {
      fetchAffiliateStats(selectedAmbassador);
      fetchAffiliateLeads(selectedAmbassador);
    }
  }, [selectedAmbassador]);

  const fetchAffiliateStats = async (ambassadorId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/affiliate/stats/${ambassadorId}`
      );
      const data = await response.json();
      if (data.success && data.stats) {
        setAffiliateStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
    }
  };

  const fetchAffiliateLeads = async (ambassadorId: number) => {
    try {
      setLoadingAffiliate(true);
      const response = await fetch(
        `http://localhost:3001/api/affiliate/leads/${ambassadorId}`
      );
      const data = await response.json();
      if (data.success && data.leads) {
        setAffiliateLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching affiliate leads:", error);
    } finally {
      setLoadingAffiliate(false);
    }
  };

  const updateLeadStatus = async (
    leadId: number,
    status: "pending" | "contacted" | "converted" | "lost",
    notes?: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/affiliate/update-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, status, notes }),
        }
      );
      const data = await response.json();
      if (data.success && selectedAmbassador) {
        fetchAffiliateLeads(selectedAmbassador);
        fetchAffiliateStats(selectedAmbassador);
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const handleNotifyAmbassador = (lead: AffiliateLead) => {
    const message = `🎉 ADA YANG PAKAI KODE ANDA!

📝 Kode: ${lead.affiliate_code}
👤 Nama: ${lead.user_name}
📞 WhatsApp: ${lead.user_phone}
📧 Email: ${lead.user_email || "Tidak ada"}
📚 Program: ${lead.program_name}
💰 Diskon: Rp ${lead.discount_applied.toLocaleString("id-ID")}
🕒 ${lead.days_ago} hari yang lalu

Segera follow-up user ini! 🚀`;

    const whatsappUrl = `https://wa.me/${
      lead.ambassador_phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const filteredAmbassadors = ambassadors.filter((ambassador) => {
    const matchesSearch =
      ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || ambassador.type === filterType;
    const matchesRole = filterRole === "All" || ambassador.role === filterRole;

    return matchesSearch && matchesType && matchesRole;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Senior Ambassador":
        return "primary";
      case "Campus Ambassador":
        return "secondary";
      case "Community Ambassador":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <AdminLayout
      currentPage="/admin/ambassadors"
      setCurrentPage={setCurrentPage}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ambassadors</h1>
            <p className="text-slate-600 mt-1">
              Manage and monitor your ambassador network
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={handleAddAmbassador}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ambassador
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Ambassadors
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {ambassadors.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Ambassadors
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {ambassadors.filter((a) => a.role === "Ambassador").length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Affiliates</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {ambassadors.filter((a) => a.role === "Affiliate").length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Link2 className="h-6 w-6 text-purple-600" />
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
                placeholder="Search ambassadors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as typeof filterType)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="Senior Ambassador">Senior Ambassador</option>
                <option value="Campus Ambassador">Campus Ambassador</option>
                <option value="Community Ambassador">
                  Community Ambassador
                </option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) =>
                  setFilterRole(e.target.value as typeof filterRole)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Roles</option>
                <option value="Ambassador">Ambassador</option>
                <option value="Affiliate">Affiliate</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Ambassadors Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Ambassador
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Location
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Affiliate Code
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAmbassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {ambassador.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {ambassador.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {ambassador.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getTypeColor(ambassador.type)}>
                        {ambassador.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          ambassador.role === "Ambassador" ? "success" : "info"
                        }
                      >
                        {ambassador.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">
                          {ambassador.location}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
                          {ambassador.affiliateCode}
                        </code>
                        <button className="ml-2 p-1 text-slate-400 hover:text-slate-600">
                          <Link2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                          onClick={() => handleEditAmbassador(ambassador)}
                          title="Edit Ambassador"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          onClick={() => setShowDeleteConfirm(ambassador.id)}
                          title="Delete Ambassador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAmbassadors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No ambassadors found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterType !== "All" || filterRole !== "All"
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first ambassador."}
              </p>
              {!searchTerm && filterType === "All" && filterRole === "All" && (
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ambassador
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this ambassador? This action
                cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteAmbassador(showDeleteConfirm)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Affiliate Tracking Section */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Affiliate Tracking Dashboard
                </h2>
                <p className="text-slate-600 mt-1">
                  Monitor dan kelola leads dari affiliate tracking
                </p>
              </div>
            </div>

            {/* Ambassador Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pilih Ambassador
              </label>
              <select
                value={selectedAmbassador || ""}
                onChange={(e) =>
                  setSelectedAmbassador(Number(e.target.value) || null)
                }
                className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Ambassador...</option>
                {ambassadors.map((amb) => (
                  <option key={amb.id} value={amb.id}>
                    {amb.name} ({amb.affiliateCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Cards */}
            {selectedAmbassador && affiliateStats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Total Usage</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.total_uses}
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
                        {affiliateStats.today_uses}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="text-sm text-slate-600">
                        Pending Follow-up
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.pending_followups}
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
                        {affiliateStats.conversions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.conversion_rate
                          ? Number(affiliateStats.conversion_rate).toFixed(1)
                          : "0.0"}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Table */}
            {selectedAmbassador && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Active Leads untuk{" "}
                  {ambassadors.find((a) => a.id === selectedAmbassador)?.name}
                </h3>

                {loadingAffiliate ? (
                  <div className="text-center py-8">Loading...</div>
                ) : affiliateLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Belum ada leads untuk ambassador ini.
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
                        {affiliateLeads.map((lead) => (
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
                              {lead.program_name}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              Rp {lead.discount_applied.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {lead.days_ago}d ago
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  lead.follow_up_status === "converted"
                                    ? "success"
                                    : lead.follow_up_status === "contacted"
                                    ? "warning"
                                    : lead.follow_up_status === "lost"
                                    ? "danger"
                                    : "secondary"
                                }
                              >
                                {lead.follow_up_status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleNotifyAmbassador(lead)}
                                  className="inline-flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Notify
                                </button>
                                <button
                                  onClick={() => {
                                    const newStatus = prompt(
                                      "Update status (pending/contacted/converted/lost):",
                                      lead.follow_up_status
                                    );
                                    if (
                                      newStatus &&
                                      [
                                        "pending",
                                        "contacted",
                                        "converted",
                                        "lost",
                                      ].includes(newStatus)
                                    ) {
                                      updateLeadStatus(
                                        lead.id,
                                        newStatus as any
                                      );
                                    }
                                  }}
                                  className="text-slate-600 hover:text-slate-900"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Ambassadors;
