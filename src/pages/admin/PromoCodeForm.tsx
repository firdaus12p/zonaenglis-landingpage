import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { SuccessModal } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Tag,
  Users,
  AlertCircle,
  CheckCircle,
  Hash,
} from "lucide-react";
import { API_BASE } from "../../config/api";
import { formatRupiahInput, parseRupiahInput } from "../../utils/currency";

const PromoCodeForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    applicable_to: "all",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Display states for formatted inputs
  const [discountDisplay, setDiscountDisplay] = useState("");
  const [minPurchaseDisplay, setMinPurchaseDisplay] = useState("");
  const [maxDiscountDisplay, setMaxDiscountDisplay] = useState("");

  // Modal State
  const [modal, setModal] = useState<{
    show: boolean;
    type: "alert" | "error" | "success";
    title: string;
    message: string;
  }>({
    show: false,
    type: "alert",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchPromoCode();
    }
  }, [id]);

  const fetchPromoCode = async () => {
    try {
      // Fetch by ID (need to add this endpoint in backend if not exists)
      const res = await fetch(`${API_BASE}/promos/${id}`);
      const data = await res.json();

      if (res.ok) {
        // Format dates for datetime-local input
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          code: data.code || "",
          name: data.name || "",
          description: data.description || "",
          discount_type: data.discount_type || "percentage",
          discount_value: data.discount_value || "",
          min_purchase: data.min_purchase || "",
          max_discount: data.max_discount || "",
          usage_limit: data.usage_limit || "",
          valid_from: formatDateForInput(data.valid_from),
          valid_until: formatDateForInput(data.valid_until),
          applicable_to: data.applicable_to || "all",
        });

        // Set display values for currency fields
        if (data.discount_type === "fixed_amount" && data.discount_value) {
          setDiscountDisplay(formatRupiahInput(data.discount_value));
        } else {
          setDiscountDisplay(data.discount_value || "");
        }
        if (data.min_purchase) {
          setMinPurchaseDisplay(formatRupiahInput(data.min_purchase));
        }
        if (data.max_discount) {
          setMaxDiscountDisplay(formatRupiahInput(data.max_discount));
        }
      } else {
        setError(data.error || "Failed to fetch promo code");
      }
    } catch (err) {
      setError("Failed to load promo code data");
      console.error(err);
    }
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: "alert",
      title: "",
      message: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.code ||
      !formData.name ||
      !formData.discount_value ||
      !formData.valid_from ||
      !formData.valid_until
    ) {
      setError("Mohon isi semua field yang wajib");
      setLoading(false);
      return;
    }

    // Validate code format (uppercase, no spaces)
    if (!/^[A-Z0-9]+$/.test(formData.code)) {
      setError("Kode promo harus huruf kapital dan angka tanpa spasi");
      setLoading(false);
      return;
    }

    try {
      const url = isEdit ? `${API_BASE}/promos/${id}` : `${API_BASE}/promos`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_purchase: formData.min_purchase
            ? parseFloat(formData.min_purchase)
            : 0,
          max_discount: formData.max_discount
            ? parseFloat(formData.max_discount)
            : null,
          usage_limit: formData.usage_limit
            ? parseInt(formData.usage_limit)
            : null,
          is_active: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(
          `Kode promo berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`
        );
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/admin/promos");
        }, 2000);
      } else {
        setError(data.error || "Gagal menyimpan promo code");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Auto-uppercase for code
    if (name === "code") {
      setFormData({
        ...formData,
        [name]: value.toUpperCase().replace(/\s/g, ""),
      });
    } else if (name === "discount_type") {
      // Reset discount display when type changes
      setFormData({ ...formData, [name]: value });
      setDiscountDisplay("");
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (formData.discount_type === "percentage") {
      // For percentage, allow plain numbers
      setDiscountDisplay(inputValue);
      setFormData({ ...formData, discount_value: inputValue });
    } else {
      // For fixed amount, format as Rupiah
      const formatted = formatRupiahInput(inputValue);
      const numeric = parseRupiahInput(inputValue);
      setDiscountDisplay(formatted);
      setFormData({ ...formData, discount_value: numeric.toString() });
    }
  };

  const handleMinPurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatRupiahInput(inputValue);
    const numeric = parseRupiahInput(inputValue);
    setMinPurchaseDisplay(formatted);
    setFormData({ ...formData, min_purchase: numeric.toString() });
  };

  const handleMaxDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatRupiahInput(inputValue);
    const numeric = parseRupiahInput(inputValue);
    setMaxDiscountDisplay(formatted);
    setFormData({ ...formData, max_discount: numeric.toString() });
  };

  return (
    <AdminLayout currentPage={location.pathname}>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/promos")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit Kode Promo" : "Tambah Kode Promo Baru"}
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Code */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Tag className="h-4 w-4" />
                Kode Promo *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="EARLY50"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 font-mono text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
                disabled={isEdit}
              />
              <p className="mt-1 text-xs text-slate-500">
                Huruf kapital dan angka saja, tanpa spasi (contoh: EARLY50)
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Hash className="h-4 w-4" />
                Nama Promo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Early Bird Discount"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Diskon spesial untuk pendaftar awal"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Percent className="h-4 w-4" />
                  Tipe Diskon *
                </label>
                <select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed_amount">Nominal (Rp)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <DollarSign className="h-4 w-4" />
                  Nilai Diskon *
                </label>
                <input
                  type="text"
                  name="discount_value"
                  value={discountDisplay}
                  onChange={handleDiscountChange}
                  placeholder={
                    formData.discount_type === "percentage" ? "50" : "100.000"
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.discount_type === "percentage"
                    ? "Masukkan persentase (0-100)"
                    : "Format otomatis: 100000 → 100.000"}
                </p>
              </div>
            </div>

            {/* Min Purchase & Max Discount */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">
                  Minimal Pembelian
                </label>
                <input
                  type="text"
                  name="min_purchase"
                  value={minPurchaseDisplay}
                  onChange={handleMinPurchaseChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Kosongkan untuk tidak ada minimal
                </p>
              </div>

              <div>
                <label className="mb-2 text-sm font-medium text-slate-700">
                  Maksimal Diskon
                </label>
                <input
                  type="text"
                  name="max_discount"
                  value={maxDiscountDisplay}
                  onChange={handleMaxDiscountChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={formData.discount_type === "fixed"}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Untuk diskon persentase saja
                </p>
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Users className="h-4 w-4" />
                Batas Penggunaan
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan untuk penggunaan unlimited
              </p>
            </div>

            {/* Valid Period */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Berlaku Dari *
                </label>
                <input
                  type="datetime-local"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Berlaku Sampai *
                </label>
                <input
                  type="datetime-local"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Applicable To */}
            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">
                Berlaku Untuk
              </label>
              <select
                name="applicable_to"
                value={formData.applicable_to}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Semua Program</option>
                <option value="programs">Program Tertentu</option>
                <option value="first_time">Pengguna Baru</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/promos")}
              className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                ? "Update Kode Promo"
                : "Tambah Kode Promo"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Component */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="mx-4 w-full max-w-md animate-fadeIn rounded-xl bg-white shadow-2xl sm:mx-0">
            {/* Modal Header */}
            <div
              className={`border-b px-6 py-4 ${
                modal.type === "error"
                  ? "border-red-200 bg-red-50"
                  : modal.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                {modal.type === "error" && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                )}
                {modal.type === "success" && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}
                {modal.type === "alert" && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <AlertCircle className="h-5 w-5 text-slate-600" />
                  </div>
                )}
                <h3
                  className={`text-lg font-semibold ${
                    modal.type === "error"
                      ? "text-red-900"
                      : modal.type === "success"
                      ? "text-green-900"
                      : "text-slate-900"
                  }`}
                >
                  {modal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {modal.message}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 rounded-b-xl bg-slate-50 px-6 py-4">
              <button
                onClick={closeModal}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  modal.type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : modal.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message={successMessage}
        autoClose={true}
        autoCloseDuration={2000}
      />
    </AdminLayout>
  );
};

export default PromoCodeForm;
