import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
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
  UserCheck,
  AlertCircle,
  X,
} from "lucide-react";

interface Ambassador {
  id: number;
  name: string;
  type:
    | "Affiliate Campus"
    | "Affiliate SMA"
    | "Affiliate SMP"
    | "Ambassador Campus"
    | "Ambassador SMA"
    | "Ambassador SMP";
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
  urgency?: "urgent" | "this_month" | "just_browsing";
  first_used_at: string;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  days_ago: number;
  // New fields from promos table
  branch?: string;
  promo_category?: string;
  program_package?: string;
  start_date?: string;
  end_date?: string;
}

interface DeletedLead extends AffiliateLead {
  deleted_at: string;
  deleted_by?: string;
  days_deleted: number;
}

interface AffiliateStats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  followups: number;
  conversions: number;
  lost: number;
}

const Ambassadors: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const { token } = useAuth();
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    | "All"
    | "Affiliate Campus"
    | "Affiliate SMA"
    | "Affiliate SMP"
    | "Ambassador Campus"
    | "Ambassador SMA"
    | "Ambassador SMP"
  >("All");
  const [filterRole, setFilterRole] = useState<
    "All" | "Ambassador" | "Affiliate"
  >("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

  // Modal States
  const [modal, setModal] = useState<{
    show: boolean;
    type: "confirm" | "alert" | "error" | "success";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: "alert",
    title: "",
    message: "",
  });

  // Affiliate Tracking States
  const [selectedAmbassador, setSelectedAmbassador] = useState<number | null>(
    null,
  );
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(
    null,
  );
  const [affiliateLeads, setAffiliateLeads] = useState<AffiliateLead[]>([]);
  const [lostLeads, setLostLeads] = useState<AffiliateLead[]>([]);
  const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "lost" | "deleted">(
    "active",
  );
  const [loadingAffiliate, setLoadingAffiliate] = useState(false);
  const [ambassadorUsageCounts, setAmbassadorUsageCounts] = useState<
    Record<number, number>
  >({});

  // Notes editing states
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Function to load ambassadors from API
  const loadAmbassadors = async () => {
    try {
      console.log("🔄 Fetching ambassadors from API...");
      const response = await fetch(`${API_BASE}/ambassadors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Loaded ambassadors from API:", data);

      // Transform API data to match Admin interface
      const transformedData = data.map(
        (ambassador: {
          id: number;
          name: string;
          role: string;
          location: string;
          institution: string;
          photo_url: string;
          affiliate_code: string;
          join_date: string;
          email: string;
          phone: string;
          testimonial: string;
          [key: string]: unknown;
        }) => ({
          id: ambassador.id,
          name: ambassador.name,
          // Use the role directly from database (new 6-type system)
          type: ambassador.role as Ambassador["type"],
          // Determine Ambassador vs Affiliate based on type prefix
          role: ambassador.role?.startsWith("Ambassador")
            ? "Ambassador"
            : "Affiliate",
          location: ambassador.location || "N/A",
          address: ambassador.institution || "N/A",
          photo: ambassador.photo_url || "/images/ambassadors/default.jpg",
          affiliateCode: ambassador.affiliate_code,
          joinDate:
            ambassador.join_date || new Date().toISOString().split("T")[0],
          email: ambassador.email || "N/A",
          phone: ambassador.phone || "N/A",
          testimonial: ambassador.testimonial || "",
        }),
      );

      setAmbassadors(transformedData);
      console.log("✅ Ambassadors data transformed and loaded");
    } catch (error) {
      console.error("❌ Error loading ambassadors from API:", error);
      showAlert(
        "Gagal Memuat Data",
        "Tidak dapat memuat data ambassador. Pastikan backend server sudah berjalan.",
        "error",
      );
    }
  };

  // Load ambassadors from API on component mount
  useEffect(() => {
    loadAmbassadors();
  }, []);

  // Fetch UNREAD usage counts for all ambassadors (only new leads since last viewed)
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (ambassadors.length === 0) return;

      try {
        const response = await fetch(`${API_BASE}/affiliate/unread-counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success && data.unread_counts) {
          setAmbassadorUsageCounts(data.unread_counts);
        }
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();
  }, [ambassadors]);

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

  // Modal Helper Functions
  const showAlert = (
    title: string,
    message: string,
    type: "alert" | "error" | "success" = "alert",
  ) => {
    setModal({
      show: true,
      type,
      title,
      message,
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setModal({
      show: true,
      type: "confirm",
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: "alert",
      title: "",
      message: "",
    });
  };

  // CRUD Functions
  const handleDeleteAmbassador = async (id: number) => {
    try {
      // Call API to delete from database
      const response = await fetch(`${API_BASE}/ambassadors/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete ambassador");
      }

      // Update local state after successful API call
      const updatedAmbassadors = ambassadors.filter(
        (ambassador) => ambassador.id !== id,
      );
      setAmbassadors(updatedAmbassadors);
      setShowDeleteConfirm(null);

      // Trigger event to notify other components
      window.dispatchEvent(new CustomEvent("ambassadorDataUpdated"));

      console.log("✅ Ambassador deleted successfully from database");
    } catch (error) {
      console.error("❌ Error deleting ambassador:", error);
      showAlert(
        "Gagal Menghapus",
        "Tidak dapat menghapus ambassador. Silakan coba lagi.",
        "error",
      );
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
      fetchLostLeads(selectedAmbassador);
      fetchDeletedLeads(selectedAmbassador);
      // Mark ambassador as viewed when selected
      markAmbassadorAsViewed(selectedAmbassador);
    }
  }, [selectedAmbassador]);

  const fetchAffiliateStats = async (ambassadorId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/affiliate/stats/${ambassadorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
        `${API_BASE}/affiliate/leads/${ambassadorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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

  const fetchLostLeads = async (ambassadorId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/affiliate/lost-leads/${ambassadorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success && data.leads) {
        setLostLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching lost leads:", error);
    }
  };

  const fetchDeletedLeads = async (ambassadorId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/affiliate/deleted-leads/${ambassadorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success && data.leads) {
        setDeletedLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching deleted leads:", error);
    }
  };

  const markAmbassadorAsViewed = async (ambassadorId: number) => {
    try {
      await fetch(`${API_BASE}/affiliate/mark-viewed/${ambassadorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state - set this ambassador's unread count to 0
      setAmbassadorUsageCounts((prev) => ({
        ...prev,
        [ambassadorId]: 0,
      }));

      console.log(`✅ Marked ambassador ${ambassadorId} as viewed`);
    } catch (error) {
      console.error("Error marking ambassador as viewed:", error);
    }
  };

  const updateLeadStatus = async (
    leadId: number,
    status: "pending" | "contacted" | "converted" | "lost",
  ) => {
    try {
      const response = await fetch(
        `${API_BASE}/affiliate/update-status/${leadId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            follow_up_status: status,
            registered: status === "converted",
          }),
        },
      );
      const data = await response.json();
      if (data.success && selectedAmbassador) {
        // Refresh all data including lost leads
        fetchAffiliateLeads(selectedAmbassador);
        fetchLostLeads(selectedAmbassador);
        fetchAffiliateStats(selectedAmbassador);
        console.log(`✅ Lead ${leadId} status updated to: ${status}`);

        // If restoring from lost to active status, switch to active tab
        if (status !== "lost" && activeTab === "lost") {
          setActiveTab("active");
        }
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      showAlert(
        "Gagal Update Status",
        "Tidak dapat mengubah status lead. Silakan coba lagi.",
        "error",
      );
    }
  };

  const handleNotifyAmbassador = (lead: AffiliateLead) => {
    const urgencyText =
      lead.urgency === "urgent"
        ? "🔥 URGENT"
        : lead.urgency === "this_month"
          ? "📅 Bulan Ini"
          : "👀 Browsing";

    const message = `✨ FOLLOW UP PROGRAM ZONA ENGLISH

👤 Halo ${lead.user_name}!

Terima kasih sudah menggunakan kode ${lead.affiliate_code} untuk program kami:
� Program: ${lead.program_name}
${lead.branch ? `🏢 Cabang: ${lead.branch}` : ""}
${lead.promo_category ? `🏷️ Kategori: ${lead.promo_category}` : ""}
${lead.program_package ? `📦 Paket: ${lead.program_package}` : ""}
💰 Diskon: Rp ${lead.discount_applied.toLocaleString("id-ID")}
⏰ ${urgencyText}

${
  lead.follow_up_notes ? `� Catatan: ${lead.follow_up_notes}\n\n` : ""
}Apakah ada yang bisa kami bantu untuk melanjutkan pendaftaran? 😊

Tim Zona English siap membantu! 🚀`;

    const whatsappUrl = `https://wa.me/${
      lead.user_phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const updateLeadNotes = async (leadId: number, notes: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/affiliate/update-status/${leadId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            follow_up_notes: notes,
          }),
        },
      );

      if (response.ok && selectedAmbassador) {
        // Refresh leads to show updated notes
        fetchAffiliateLeads(selectedAmbassador);
        fetchLostLeads(selectedAmbassador);
        setEditingNotes(null);
        setNoteText("");
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    showConfirm(
      "Hapus Lead?",
      "Data akan disimpan selama 3 hari sebelum dihapus permanen. Lead ini akan masuk ke 'Deleted History' dan nomor user bisa digunakan lagi.",
      async () => {
        try {
          const response = await fetch(`${API_BASE}/affiliate/lead/${leadId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ deleted_by: "admin" }),
          });

          const data = await response.json();

          if (data.success && selectedAmbassador) {
            // Refresh all lead lists and stats
            fetchAffiliateLeads(selectedAmbassador);
            fetchLostLeads(selectedAmbassador);
            fetchDeletedLeads(selectedAmbassador);
            fetchAffiliateStats(selectedAmbassador);
            console.log("✅ Lead soft deleted successfully");

            // Switch to deleted tab to show the deleted record
            setActiveTab("deleted");
            showAlert(
              "Berhasil",
              "Lead berhasil dihapus (soft delete).",
              "success",
            );
          } else {
            showAlert(
              "Gagal Menghapus",
              data.error || "Terjadi kesalahan saat menghapus lead.",
              "error",
            );
          }
        } catch (error) {
          console.error("Error deleting lead:", error);
          showAlert(
            "Gagal Menghapus",
            "Tidak dapat menghapus lead. Silakan coba lagi.",
            "error",
          );
        }
      },
    );
  };

  const handleRestoreLead = async (leadId: number) => {
    showConfirm(
      "Restore Lead?",
      "Lead akan dikembalikan ke status Active dan bisa dikelola kembali.",
      async () => {
        try {
          const response = await fetch(
            `${API_BASE}/affiliate/restore/${leadId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = await response.json();

          if (data.success && selectedAmbassador) {
            // Refresh all lead lists and stats
            fetchAffiliateLeads(selectedAmbassador);
            fetchLostLeads(selectedAmbassador);
            fetchDeletedLeads(selectedAmbassador);
            fetchAffiliateStats(selectedAmbassador);
            console.log("✅ Lead restored successfully");

            // Switch to active tab to show the restored lead
            setActiveTab("active");
            showAlert(
              "Berhasil",
              "Lead berhasil dikembalikan ke Active.",
              "success",
            );
          } else {
            showAlert(
              "Gagal Restore",
              data.error || "Terjadi kesalahan saat restore lead.",
              "error",
            );
          }
        } catch (error) {
          console.error("Error restoring lead:", error);
          showAlert(
            "Gagal Restore",
            "Tidak dapat restore lead. Silakan coba lagi.",
            "error",
          );
        }
      },
    );
  };

  const handlePermanentDelete = async (leadId: number, leadName: string) => {
    // First confirmation
    showConfirm(
      "⚠️ PERMANENT DELETE WARNING",
      `Anda akan MENGHAPUS PERMANEN lead "${leadName}" dari database.\n\nData yang sudah dihapus permanen TIDAK BISA dikembalikan!\n\nApakah Anda yakin ingin melanjutkan?`,
      () => {
        // Second confirmation (double confirmation)
        showConfirm(
          "⚠️ KONFIRMASI TERAKHIR",
          `Ini adalah konfirmasi terakhir!\n\nLead "${leadName}" akan dihapus PERMANEN dari database dan TIDAK BISA dikembalikan.\n\nKlik "Ya, Hapus Permanen" untuk melanjutkan.`,
          async () => {
            try {
              const response = await fetch(
                `${API_BASE}/affiliate/permanent-delete/${leadId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const data = await response.json();

              if (data.success && selectedAmbassador) {
                // Refresh all lead lists and stats
                fetchAffiliateLeads(selectedAmbassador);
                fetchLostLeads(selectedAmbassador);
                fetchDeletedLeads(selectedAmbassador);
                fetchAffiliateStats(selectedAmbassador);
                console.log("✅ Lead permanently deleted successfully");

                showAlert(
                  "Berhasil",
                  `Lead "${leadName}" berhasil dihapus PERMANEN dari database.`,
                  "success",
                );
              } else {
                showAlert(
                  "Gagal Hapus Permanen",
                  data.error ||
                    "Terjadi kesalahan saat menghapus permanen lead.",
                  "error",
                );
              }
            } catch (error) {
              console.error("Error permanently deleting lead:", error);
              showAlert(
                "Gagal Hapus Permanen",
                "Tidak dapat menghapus permanen lead. Silakan coba lagi.",
                "error",
              );
            }
          },
        );
      },
    );
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Ambassadors
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
                <p className="text-sm font-medium text-slate-600">
                  Total Affiliates
                </p>
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
                <optgroup label="Affiliate">
                  <option value="Affiliate Campus">Affiliate Campus</option>
                  <option value="Affiliate SMA">Affiliate SMA</option>
                  <option value="Affiliate SMP">Affiliate SMP</option>
                </optgroup>
                <optgroup label="Ambassador">
                  <option value="Ambassador Campus">Ambassador Campus</option>
                  <option value="Ambassador SMA">Ambassador SMA</option>
                  <option value="Ambassador SMP">Ambassador SMP</option>
                </optgroup>
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
                          title="Hapus Ambassador"
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
                Konfirmasi Hapus
              </h3>
              <p className="text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus ambassador ini? Tindakan ini
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
                  onClick={() => handleDeleteAmbassador(showDeleteConfirm)}
                  className="flex-1"
                >
                  Hapus
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
                <span className="ml-2 text-xs text-slate-500">
                  (🔴 = leads baru yang belum dilihat)
                </span>
              </label>
              <select
                value={selectedAmbassador || ""}
                onChange={(e) =>
                  setSelectedAmbassador(Number(e.target.value) || null)
                }
                className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Ambassador...</option>
                {ambassadors.map((amb) => {
                  const usageCount = ambassadorUsageCounts[amb.id] || 0;
                  return (
                    <option key={amb.id} value={amb.id}>
                      {amb.name} ({amb.affiliateCode})
                      {usageCount > 0 ? ` 🔴 ${usageCount} baru` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stats Cards */}
            {selectedAmbassador && affiliateStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.pending_followups}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Follow Up</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.followups}
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

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-slate-600">Lost</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {affiliateStats.lost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Table */}
            {selectedAmbassador && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Leads untuk{" "}
                    {ambassadors.find((a) => a.id === selectedAmbassador)?.name}
                  </h3>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveTab("active")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "active"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Active Leads ({affiliateLeads.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("lost")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "lost"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Lost ({lostLeads.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("deleted")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "deleted"
                          ? "border-slate-600 text-slate-600"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      Riwayat Terhapus ({deletedLeads.length})
                    </button>
                  </div>
                </div>

                {loadingAffiliate ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <>
                    {/* Active Leads Tab */}
                    {activeTab === "active" &&
                      (affiliateLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada active leads untuk ambassador ini.
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
                                  Notes
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
                                    Rp{" "}
                                    {lead.discount_applied.toLocaleString(
                                      "id-ID",
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
                                            : lead.follow_up_status === "lost"
                                              ? "danger"
                                              : "secondary"
                                      }
                                    >
                                      {lead.follow_up_status === "pending"
                                        ? "Pending"
                                        : lead.follow_up_status === "contacted"
                                          ? "Follow Up"
                                          : lead.follow_up_status ===
                                              "converted"
                                            ? "Conversion"
                                            : "Lost"}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    {editingNotes === lead.id ? (
                                      <div className="flex items-center space-x-2">
                                        <textarea
                                          value={noteText}
                                          onChange={(e) =>
                                            setNoteText(e.target.value)
                                          }
                                          placeholder="Add notes..."
                                          className="w-48 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          rows={2}
                                        />
                                        <button
                                          onClick={() =>
                                            updateLeadNotes(lead.id, noteText)
                                          }
                                          className="p-1 text-green-600 hover:text-green-700"
                                          title="Save"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingNotes(null);
                                            setNoteText("");
                                          }}
                                          className="p-1 text-red-600 hover:text-red-700"
                                          title="Cancel"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        {lead.follow_up_notes ? (
                                          <p className="text-sm text-slate-600 max-w-xs truncate">
                                            {lead.follow_up_notes}
                                          </p>
                                        ) : (
                                          <p className="text-sm text-slate-400 italic">
                                            No notes
                                          </p>
                                        )}
                                        <button
                                          onClick={() => {
                                            setEditingNotes(lead.id);
                                            setNoteText(
                                              lead.follow_up_notes || "",
                                            );
                                          }}
                                          className="p-1 text-slate-400 hover:text-blue-600"
                                          title="Edit Notes"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={lead.follow_up_status}
                                        onChange={(e) =>
                                          updateLeadStatus(
                                            lead.id,
                                            e.target.value as
                                              | "pending"
                                              | "contacted"
                                              | "converted"
                                              | "lost",
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
                                          handleNotifyAmbassador(lead)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                        title="Notify Ambassador"
                                      >
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Notify
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteLead(lead.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                        title="Hapus Lead"
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
                    {activeTab === "lost" &&
                      (lostLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada lost leads untuk ambassador ini.
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
                              {lostLeads.map((lead) => (
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
                                    Rp{" "}
                                    {lead.discount_applied.toLocaleString(
                                      "id-ID",
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lead.days_ago}d ago
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      {/* Status Dropdown to restore from Lost */}
                                      <select
                                        value={lead.follow_up_status}
                                        onChange={(e) =>
                                          updateLeadStatus(
                                            lead.id,
                                            e.target.value as
                                              | "pending"
                                              | "contacted"
                                              | "converted"
                                              | "lost",
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

                                      {/* Delete Button */}
                                      <button
                                        onClick={() =>
                                          handleDeleteLead(lead.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                        title="Hapus Lead"
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
                    {activeTab === "deleted" &&
                      (deletedLeads.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Belum ada deleted leads untuk ambassador ini.
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
                              {deletedLeads.map((lead) => (
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
                                    {lead.program_name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {new Date(
                                      lead.deleted_at,
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
                                          handleRestoreLead(lead.id)
                                        }
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                        title="Restore this lead"
                                      >
                                        <span>Restore</span>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handlePermanentDelete(
                                            lead.id,
                                            lead.user_name,
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                                        title="PERMANENTLY delete this lead (cannot be undone)"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span>Detele</span>
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
      </div>

      {/* Modal Component */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 sm:mx-0 animate-fadeIn">
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${
                modal.type === "error"
                  ? "bg-red-50 border-red-200"
                  : modal.type === "success"
                    ? "bg-green-50 border-green-200"
                    : modal.type === "confirm"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {modal.type === "error" && (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                )}
                {modal.type === "success" && (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}
                {modal.type === "confirm" && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                {modal.type === "alert" && (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-slate-600" />
                  </div>
                )}
                <h3
                  className={`text-lg font-semibold ${
                    modal.type === "error"
                      ? "text-red-900"
                      : modal.type === "success"
                        ? "text-green-900"
                        : modal.type === "confirm"
                          ? "text-blue-900"
                          : "text-slate-900"
                  }`}
                >
                  {modal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {modal.message}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      if (modal.onConfirm) modal.onConfirm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ya, Lanjutkan
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    modal.type === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : modal.type === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Ambassadors;
