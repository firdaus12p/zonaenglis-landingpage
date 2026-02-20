import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button, SuccessModal } from "../../components";
import { bridgeCardsService } from "../../services/bridgeCardsService";

/** Generate a unique student code: ZE-YYYY-XXXXX (e.g. ZE-2026-A3K9M) */
function generateStudentCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `ZE-${year}-${random}`;
}

export const BridgeStudentForm: React.FC<{
  setCurrentPage?: (page: string) => void;
  mode: "create" | "edit";
}> = ({ setCurrentPage, mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    // Auto-generate on create, loaded from backend on edit
    studentCode: mode === "create" ? generateStudentCode() : "",
    pin: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegenerateCode = useCallback(() => {
    setFormData((prev) => ({ ...prev, studentCode: generateStudentCode() }));
  }, []);

  // Pre-populate form data when editing
  useEffect(() => {
    if (mode === "edit" && id) {
      const studentId = parseInt(id, 10);
      if (isNaN(studentId)) {
        setError("ID siswa tidak valid");
        return;
      }

      setIsLoadingStudent(true);
      bridgeCardsService
        .getStudent(studentId)
        .then((student) => {
          setFormData({
            name: student.name,
            email: student.email,
            studentCode: student.studentCode,
            pin: "", // PIN never pre-filled for security
          });
        })
        .catch((err) => {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data siswa",
          );
        })
        .finally(() => {
          setIsLoadingStudent(false);
        });
    }
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (mode === "create" && formData.pin.length < 4) {
      setError("PIN minimal 4 karakter");
      setIsSubmitting(false);
      return;
    }

    if (mode === "edit" && formData.pin && formData.pin.length < 4) {
      setError(
        "PIN baru minimal 4 karakter (kosongkan jika tidak ingin mengubah)",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "edit" && id) {
        const payload: {
          name: string;
          email: string;
          studentCode: string;
          pin?: string;
        } = {
          name: formData.name,
          email: formData.email,
          studentCode: formData.studentCode,
        };
        // Only send pin if user wants to change it
        if (formData.pin) {
          payload.pin = formData.pin;
        }
        await bridgeCardsService.updateStudent(parseInt(id, 10), payload);
      } else {
        await bridgeCardsService.createStudent(formData);
      }
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan data siswa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      currentPage="/admin/bridge-cards/students"
      setCurrentPage={setCurrentPage}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/admin/bridge-cards/students")}
            variant="outline-primary"
            size="sm"
            className="mb-4"
          >
            &larr; Kembali
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "create" ? "Daftarkan Siswa Baru" : "Edit Data Siswa"}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoadingStudent ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Memuat data siswa...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Siswa
                </label>
                <input
                  type="email"
                  required
                  placeholder="siswa@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Student Code (ID Login Unik)
                </label>
                {mode === "create" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-700 tracking-wider select-all">
                        {formData.studentCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        title="Generate ulang kode"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Generate Ulang
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Dibuat otomatis oleh sistem. Siswa dapat menggunakannya
                      untuk login selain email.
                    </p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono tracking-wider"
                      value={formData.studentCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentCode: e.target.value,
                        })
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Ubah hanya jika diperlukan. Siswa menggunakan kode ini
                      untuk login.
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {mode === "create"
                    ? "PIN Awal"
                    : "PIN Baru (kosongkan jika tidak ingin mengubah)"}
                </label>
                <input
                  type="password"
                  required={mode === "create"}
                  placeholder={
                    mode === "create"
                      ? "Minimal 4 karakter"
                      : "Kosongkan jika tidak berubah"
                  }
                  minLength={mode === "create" ? 4 : undefined}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  PIN akan di-hash secara aman di server.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Menyimpan..."
                    : mode === "create"
                      ? "Daftarkan Siswa"
                      : "Perbarui Data"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/admin/bridge-cards/students")}
        title={
          mode === "create"
            ? "Siswa Berhasil Didaftarkan!"
            : "Data Siswa Berhasil Diperbarui!"
        }
        message={
          mode === "create"
            ? "Akun siswa baru telah dibuat dan siap digunakan."
            : "Perubahan data siswa telah disimpan."
        }
      />
    </AdminLayout>
  );
};

export default BridgeStudentForm;
