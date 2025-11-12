import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, ConfirmModal, SuccessModal } from "../../components";
import {
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface PromoClaim {
  id: number;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  user_city: string | null;
  program_name: string;
  program_branch: string | null;
  program_type: string | null;
  urgency: "urgent" | "this_month" | "browsing";
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes: string | null;
  registered: boolean;
  created_at: string;
  days_ago: number;
  follow_up_by_name: string | null;
}

interface ClaimStats {
  total_claims: number;
  today_claims: number;
  pending: number;
  contacted: number;
  conversions: number;
  lost: number;
}

export default function PromoClaims() {
  const [claims, setClaims] = useState<PromoClaim[]>([]);
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch(`${API_BASE}/promo-claims/all`);
      const data = await response.json();
      if (data.success) {
        setClaims(data.claims);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/promo-claims/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateStatus = async (
    claimId: number,
    status: "pending" | "contacted" | "converted" | "lost"
  ) => {
    try {
      const response = await fetch(
        `${API_BASE}/promo-claims/update-status/${claimId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            follow_up_status: status,
          }),
        }
      );

      if (response.ok) {
        fetchClaims();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateNotes = async (claimId: number, notes: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/promo-claims/update-status/${claimId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            follow_up_notes: notes,
          }),
        }
      );

      if (response.ok) {
        fetchClaims();
        setEditingNotes(null);
        setNoteText("");
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleNotifyUser = (claim: PromoClaim) => {
    const urgencyText =
      claim.urgency === "urgent"
        ? "🔥 URGENT"
        : claim.urgency === "this_month"
        ? "📅 Bulan Ini"
        : "👀 Browsing";

    const message = `✨ FOLLOW UP PROGRAM ZONA ENGLISH

👤 Halo ${claim.user_name}!

Terima kasih sudah tertarik dengan program kami:
📚 Program: ${claim.program_name}
${claim.program_branch ? `🏢 Cabang: ${claim.program_branch}` : ""}
${claim.program_type ? `🏷️ Tipe: ${claim.program_type}` : ""}
⏰ ${urgencyText}

${
  claim.follow_up_notes ? `📝 Catatan: ${claim.follow_up_notes}\n\n` : ""
}Apakah ada yang bisa kami bantu untuk melanjutkan pendaftaran? 😊

Tim Zona English siap membantu! 🚀`;

    const whatsappUrl = `https://wa.me/${
      claim.user_phone
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteClick = (claimId: number) => {
    setClaimToDelete(claimId);
    setShowDeleteModal(true);
  };

  const deleteClaim = async () => {
    if (!claimToDelete) return;

    try {
      const response = await fetch(
        `${API_BASE}/promo-claims/${claimToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deleted_by: "admin",
          }),
        }
      );

      if (response.ok) {
        setShowSuccessModal(true);
        fetchClaims();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting claim:", error);
    }
  };

  const filteredClaims =
    filterStatus === "all"
      ? claims
      : claims.filter((c) => c.follow_up_status === filterStatus);

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      this_month: "bg-yellow-100 text-yellow-800 border-yellow-200",
      browsing: "bg-slate-100 text-slate-600 border-slate-200",
    };
    const labels = {
      urgent: "Urgent",
      this_month: "Bulan Ini",
      browsing: "Browsing",
    };
    return (
      <span
        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${
          colors[urgency as keyof typeof colors]
        }`}
      >
        {labels[urgency as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      contacted: "bg-blue-100 text-blue-800 border-blue-200",
      converted: "bg-green-100 text-green-800 border-green-200",
      lost: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = {
      pending: "Pending",
      contacted: "Dihubungi",
      converted: "Terdaftar",
      lost: "Lost",
    };
    return (
      <span
        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${
          colors[status as keyof typeof colors]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-slate-600">Loading claims...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Promo Claims</h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola pengajuan promo tanpa kode dari pengguna
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Claims
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.total_claims}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Hari Ini</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.today_claims}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Dihubungi</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.contacted}
                </p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Conversions
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.conversions}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Lost</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.lost}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === "pending"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterStatus("contacted")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === "contacted"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Dihubungi
        </button>
        <button
          onClick={() => setFilterStatus("converted")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === "converted"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Terdaftar
        </button>
        <button
          onClick={() => setFilterStatus("lost")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === "lost"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Lost
        </button>
      </div>

      {/* Claims Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Tidak ada claim untuk status ini
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {claim.user_name}
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Phone className="h-3 w-3" />
                          {claim.user_phone}
                        </div>
                        {claim.user_email && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Mail className="h-3 w-3" />
                            {claim.user_email}
                          </div>
                        )}
                        {claim.user_city && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {claim.user_city}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {claim.days_ago === 0
                          ? "Hari ini"
                          : `${claim.days_ago} hari lalu`}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {claim.program_name}
                      </div>
                      {claim.program_branch && (
                        <div className="mt-1 text-xs text-slate-600">
                          {claim.program_branch}
                        </div>
                      )}
                      {claim.program_type && (
                        <div className="mt-1 text-xs text-slate-500">
                          {claim.program_type}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getUrgencyBadge(claim.urgency)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(claim.follow_up_status)}
                    </td>
                    <td className="px-4 py-4">
                      {editingNotes === claim.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            rows={2}
                            placeholder="Tambah catatan..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateNotes(claim.id, noteText)}
                              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => {
                                setEditingNotes(null);
                                setNoteText("");
                              }}
                              className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {claim.follow_up_notes ? (
                            <p className="text-sm text-slate-700">
                              {claim.follow_up_notes}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400">
                              Belum ada catatan
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setEditingNotes(claim.id);
                              setNoteText(claim.follow_up_notes || "");
                            }}
                            className="mt-1 text-xs text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Status Dropdown - Always available for flexibility */}
                        <select
                          value={claim.follow_up_status}
                          onChange={(e) =>
                            updateStatus(
                              claim.id,
                              e.target.value as
                                | "pending"
                                | "contacted"
                                | "converted"
                                | "lost"
                            )
                          }
                          className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>

                        {/* Notify Button */}
                        <button
                          onClick={() => handleNotifyUser(claim)}
                          className="rounded bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200 flex items-center justify-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          Notify
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(claim.id)}
                          className="rounded bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClaimToDelete(null);
        }}
        onConfirm={deleteClaim}
        title="Hapus Claim?"
        message="Apakah Anda yakin ingin menghapus claim ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil Dihapus!"
        message="Claim berhasil dihapus dari sistem."
        autoClose={true}
      />
    </AdminLayout>
  );
}
