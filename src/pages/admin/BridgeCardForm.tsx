import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, MessageSquare } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button, SuccessModal } from "../../components";
import { bridgeCardsService } from "../../services/bridgeCardsService";

/** Display card explaining how each mode works â€” helps admin create correct cards */
const MODE_INFO = {
  warmup: {
    icon: BookOpen,
    color: "blue",
    title: "Warmup Mode â€” Kartu Flashcard",
    description:
      "Kartu ini ditampilkan ke siswa sebagai flashcard dua sisi. Sisi depan adalah pertanyaan/soal, sisi belakang adalah jawaban. Siswa men-tap kartu untuk membalik, lalu memilih Got it! (Mastered) atau Review.",
    frontLabel: "Sisi Depan â€” Pertanyaan / Soal",
    frontPlaceholder: 'Contoh: Translate to English: "Bangun tidur"',
    backLabel: "Sisi Belakang â€” Jawaban Benar",
    backPlaceholder: "Contoh: Wake up",
  },
  partner: {
    icon: MessageSquare,
    color: "purple",
    title: "AI Partner Mode â€” Soal Jawab Teks",
    description:
      "Kartu ini adalah soal tanya-jawab. Siswa mengetik jawaban teks bebas, lalu sistem memeriksa apakah jawaban mengandung keyword yang ditentukan. Masukkan keyword penting yang harus ada di jawaban siswa.",
    frontLabel: "Pertanyaan untuk Siswa",
    frontPlaceholder: "Contoh: What time do you go to sleep?",
    backLabel: "Contoh Jawaban Ideal",
    backPlaceholder: "Contoh: I go to sleep at 10 PM.",
  },
} as const;

export const BridgeCardForm: React.FC<{
  setCurrentPage?: (page: string) => void;
  mode: "create" | "edit";
}> = ({ setCurrentPage, mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    category: "warmup",
    contentFront: "",
    contentBack: "",
    keywords: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentModeInfo =
    MODE_INFO[formData.category as keyof typeof MODE_INFO];

  // Pre-populate form data when editing
  useEffect(() => {
    if (mode === "edit" && id) {
      const cardId = parseInt(id, 10);
      if (isNaN(cardId)) {
        setError("ID kartu tidak valid");
        return;
      }

      setIsLoadingCard(true);
      bridgeCardsService
        .getAdminCard(cardId)
        .then((card) => {
          setFormData({
            category: card.category,
            contentFront: card.contentFront,
            contentBack: card.contentBack,
            keywords: Array.isArray(card.keywords)
              ? card.keywords.join(", ")
              : card.keywords || "",
          });
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data kartu",
          );
        })
        .finally(() => {
          setIsLoadingCard(false);
        });
    }
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "edit" && id) {
        await bridgeCardsService.updateCard(parseInt(id, 10), formData);
      } else {
        await bridgeCardsService.createCard(formData);
      }
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kartu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      currentPage="/admin/bridge-cards"
      setCurrentPage={setCurrentPage}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/admin/bridge-cards")}
            variant="outline-primary"
            size="sm"
            className="mb-4"
          >
            &larr; Kembali
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "create" ? "Tambah Kartu Baru" : "Edit Kartu"}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoadingCard ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Memuat data kartu...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mode selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe / Mode Kartu
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="warmup">
                    Warmup Mode â€” Kartu Flashcard (flip)
                  </option>
                  <option value="partner">
                    AI Partner Mode â€” Soal Jawab Teks
                  </option>
                </select>
              </div>

              {/* Mode info panel */}
              <div
                className={`p-4 rounded-xl border text-sm ${
                  formData.category === "warmup"
                    ? "bg-blue-50 border-blue-100 text-blue-800"
                    : "bg-purple-50 border-purple-100 text-purple-800"
                }`}
              >
                <p className="font-semibold mb-1">{currentModeInfo.title}</p>
                <p className="text-xs leading-relaxed opacity-80">
                  {currentModeInfo.description}
                </p>
              </div>

              {/* Front content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {currentModeInfo.frontLabel}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={currentModeInfo.frontPlaceholder}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={formData.contentFront}
                  onChange={(e) =>
                    setFormData({ ...formData, contentFront: e.target.value })
                  }
                />
              </div>

              {/* Back content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {currentModeInfo.backLabel}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={currentModeInfo.backPlaceholder}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={formData.contentBack}
                  onChange={(e) =>
                    setFormData({ ...formData, contentBack: e.target.value })
                  }
                />
              </div>

              {/* Keywords â€” only meaningful for partner mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Keywords Validasi Jawaban
                  {formData.category === "warmup" && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      (opsional, tidak dipakai di Warmup)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: sleep, at, 10 PM"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.category === "partner"
                    ? "Kata-kata kunci yang harus muncul di jawaban siswa untuk dianggap benar. Pisahkan dengan koma. Huruf besar/kecil tidak berpengaruh."
                    : "Di Warmup mode, kolom ini tidak dipakai. Boleh dikosongkan."}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Menyimpan..."
                    : mode === "create"
                      ? "Simpan Kartu"
                      : "Perbarui Kartu"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/admin/bridge-cards")}
        title={
          mode === "create"
            ? "Kartu Berhasil Dibuat!"
            : "Kartu Berhasil Diperbarui!"
        }
        message={
          mode === "create"
            ? "Kartu baru telah disimpan dan langsung aktif untuk semua siswa."
            : "Perubahan kartu telah disimpan dan langsung aktif."
        }
      />
    </AdminLayout>
  );
};

export default BridgeCardForm;
