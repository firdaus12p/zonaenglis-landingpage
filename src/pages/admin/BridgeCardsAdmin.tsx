import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trophy, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button, ConfirmModal, SuccessModal } from "../../components";
import { bridgeCardsService } from "../../services/bridgeCardsService";
import type {
  BridgeCardRecord,
  BridgeStudentProfile,
} from "../../types/bridgeCards";

export const BridgeCardsAdmin: React.FC<{
  setCurrentPage?: (page: string) => void;
}> = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"cards" | "leaderboard">("cards");

  // Cards state
  const [cards, setCards] = useState<BridgeCardRecord[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<BridgeStudentProfile[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Fetch cards from backend
  const fetchCards = useCallback(async () => {
    setCardsLoading(true);
    setCardsError(null);
    try {
      const data = await bridgeCardsService.getAdminCards();
      setCards(data);
    } catch (err) {
      setCardsError(err instanceof Error ? err.message : "Gagal memuat kartu");
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Fetch leaderboard from backend
  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const data = await bridgeCardsService.getAdminLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setLeaderboardError(
        err instanceof Error ? err.message : "Gagal memuat leaderboard",
      );
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Load data on mount and when tab changes
  useEffect(() => {
    if (activeTab === "cards") {
      fetchCards();
    } else {
      fetchLeaderboard();
    }
  }, [activeTab, fetchCards, fetchLeaderboard]);

  // Handle card deletion
  const handleDeleteCard = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await bridgeCardsService.deleteCard(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCards(); // Refresh list
      setShowDeleteSuccess(true);
    } catch (err) {
      setCardsError(
        err instanceof Error ? err.message : "Gagal menghapus kartu",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      currentPage="/admin/bridge-cards"
      setCurrentPage={setCurrentPage}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bridge Cards CMS
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola konten kartu Flashcard dan Data Poin Siswa
          </p>
        </div>

        {activeTab === "cards" && (
          <Button
            onClick={() => navigate("/admin/bridge-cards/new")}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Kartu
          </Button>
        )}
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("cards")}
          className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "cards"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Katalog Kartu
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "leaderboard"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Leaderboard Peringkat
        </button>
      </div>

      {activeTab === "cards" ? (
        <>
          {cardsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {cardsError}
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Mode
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Konten Depan
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Konten Belakang
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cardsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : cards.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        Belum ada kartu terdaftar.
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => (
                      <tr key={card.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              card.category === "warmup"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {card.category === "warmup" ? "Warmup" : "Partner"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {card.contentFront}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {card.contentBack}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <button
                            onClick={() =>
                              navigate(`/admin/bridge-cards/edit/${card.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: card.id,
                                label: card.contentFront.substring(0, 40),
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {leaderboardError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {leaderboardError}
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Top Students
            </h2>
            <div className="space-y-4">
              {leaderboardLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Memuat data...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Belum ada data skor siswa yang masuk.
                </div>
              ) : (
                leaderboard.map((student, idx) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : idx === 1
                              ? "bg-slate-200 text-slate-700"
                              : idx === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.levelName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-blue-600">
                        {student.totalMastered}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        Mastered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCard}
        title="Hapus Kartu"
        message={`Apakah Anda yakin ingin menghapus kartu "${deleteTarget?.label || ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="danger"
      />

      <SuccessModal
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        title="Kartu Dihapus"
        message="Kartu berhasil dihapus dari katalog."
      />
    </AdminLayout>
  );
};

export default BridgeCardsAdmin;
