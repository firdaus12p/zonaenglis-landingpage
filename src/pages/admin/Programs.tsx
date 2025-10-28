import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface Program {
  id: number;
  title: string;
  branch: string;
  type: string;
  program: string;
  start_date: string;
  end_date: string;
  quota: number;
  price: number;
  perks: string | string[];
  image_url: string;
  wa_link: string;
  is_active: number;
}

const Programs = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_BASE}/programs`);
      const data = await res.json();

      if (res.ok) {
        setPrograms(data);
      } else {
        setError(data.error || "Failed to fetch programs");
      }
    } catch (err) {
      setError("Failed to load programs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Yakin ingin menghapus program "${title}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/programs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPrograms(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete program");
      }
    } catch (err) {
      alert("Failed to delete program");
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manajemen Program
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola program dan promo yang ditampilkan di PromoHub
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/programs/new")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Program
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Programs List */}
        {programs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">
              Belum ada program. Klik "Tambah Program" untuk memulai.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const perks =
                typeof program.perks === "string"
                  ? JSON.parse(program.perks)
                  : program.perks;

              return (
                <div
                  key={program.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Image */}
                  {program.image_url && (
                    <div className="h-48 overflow-hidden bg-slate-100">
                      <img
                        src={program.image_url}
                        alt={program.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    {/* Type Badge */}
                    <div className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {program.type}
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      {program.title}
                    </h3>

                    {/* Program */}
                    <p className="mb-4 text-sm text-slate-600">
                      {program.program}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {program.branch}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(program.start_date)} -{" "}
                        {formatDate(program.end_date)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        Kuota: {program.quota} peserta
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(program.price)}
                      </div>
                    </div>

                    {/* Perks */}
                    {perks && perks.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-2 text-xs font-medium text-slate-700">
                          Benefit:
                        </p>
                        <ul className="space-y-1">
                          {perks.slice(0, 3).map((perk: string, i: number) => (
                            <li key={i} className="text-xs text-slate-600">
                              • {perk}
                            </li>
                          ))}
                          {perks.length > 3 && (
                            <li className="text-xs text-slate-400">
                              +{perks.length - 3} lainnya
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/programs/edit/${program.id}`)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(program.id, program.title)}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
