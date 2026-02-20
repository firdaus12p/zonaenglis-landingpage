import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button, ConfirmModal, SuccessModal } from "../../components";
import { bridgeCardsService } from "../../services/bridgeCardsService";
import type { BridgeStudentAccount } from "../../types/bridgeCards";

export const BridgeStudents: React.FC<{
  setCurrentPage?: (page: string) => void;
}> = ({ setCurrentPage }) => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<BridgeStudentAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bridgeCardsService.getStudents();
      setStudents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar siswa",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await bridgeCardsService.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      await fetchStudents();
      setShowDeleteSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus siswa");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout
      currentPage="/admin/bridge-cards/students"
      setCurrentPage={setCurrentPage}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelola Siswa Bridge Cards
          </h1>
          <p className="text-slate-500 mt-1">
            Daftarkan, edit, atau hapus akun siswa
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/bridge-cards/students/new")}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Student Code
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Mastered
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Tgl Daftar
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada siswa terdaftar.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">
                        {student.studentCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                      {student.totalMastered}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/bridge-cards/students/edit/${student.id}`,
                          )
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: student.id,
                            name: student.name,
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteStudent}
        title="Hapus Siswa"
        message={`Apakah Anda yakin ingin menghapus akun siswa "${deleteTarget?.name || ""}"? Semua data progress akan ikut terhapus.`}
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        variant="danger"
      />

      <SuccessModal
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        title="Siswa Dihapus"
        message="Akun siswa berhasil dihapus."
      />
    </AdminLayout>
  );
};

export default BridgeStudents;
