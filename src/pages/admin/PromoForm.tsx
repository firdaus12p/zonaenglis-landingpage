import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  Users,
  Upload,
  X,
  Image as ImageIcon,
  Phone,
} from "lucide-react";
import { API_BASE } from "../../config/api";

const PromoForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    branch: "",
    type: "",
    program: "",
    start_date: "",
    end_date: "",
    quota: 100,
    price: "",
    image_url: "",
    wa_link: "",
    wa_phone: "", // Nomor HP untuk WhatsApp
    perks: [""],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      const res = await fetch(`${API_BASE}/programs/${id}`);
      const data = await res.json();

      if (res.ok) {
        // Parse perks from JSON string
        const perks =
          typeof data.perks === "string" ? JSON.parse(data.perks) : data.perks;

        // Format dates for datetime-local input
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };

        // Extract phone number from WhatsApp link
        const extractPhoneFromWaLink = (link: string) => {
          if (!link) return "";
          const match = link.match(/wa\.me\/(\d+)/);
          return match ? match[1] : "";
        };

        setFormData({
          title: data.title,
          branch: data.branch,
          type: data.type,
          program: data.program,
          start_date: formatDateForInput(data.start_date),
          end_date: formatDateForInput(data.end_date),
          quota: data.quota,
          price: data.price,
          image_url: data.image_url || "",
          wa_link: data.wa_link || "",
          wa_phone: extractPhoneFromWaLink(data.wa_link || ""),
          perks: perks.length > 0 ? perks : [""],
        });
      } else {
        setError(data.error || "Failed to fetch program");
      }
    } catch (err) {
      setError("Failed to load program data");
      console.error(err);
    }
  };

  // Set initial preview if editing with existing image
  useEffect(() => {
    if (formData.image_url) {
      // Check if it's a local upload or external URL
      if (formData.image_url.startsWith("/uploads/")) {
        setImagePreview(`${API_BASE.replace("/api", "")}${formData.image_url}`);
      } else {
        setImagePreview(formData.image_url);
      }
    }
  }, [formData.image_url]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      // Upload to server
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok) {
        // Update form with uploaded image URL
        setFormData({
          ...formData,
          image_url: data.url,
        });
        setImagePreview(`${API_BASE.replace("/api", "")}${data.url}`);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image_url: "",
    });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.title ||
      !formData.branch ||
      !formData.type ||
      !formData.program ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.price
    ) {
      setError("Mohon isi semua field yang wajib");
      setLoading(false);
      return;
    }

    // Filter empty perks
    const filteredPerks = formData.perks.filter((p) => p.trim() !== "");

    // Convert phone number to WhatsApp link
    let waLink = "";
    if (formData.wa_phone) {
      // Remove all non-digit characters
      let cleanPhone = formData.wa_phone.replace(/\D/g, "");

      // Add 62 prefix if starts with 0
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "62" + cleanPhone.substring(1);
      }

      // Add 62 prefix if doesn't have country code
      if (!cleanPhone.startsWith("62")) {
        cleanPhone = "62" + cleanPhone;
      }

      // Create WhatsApp link with default message
      const defaultMessage = encodeURIComponent(
        `Halo, saya ingin mendaftar program ${formData.title}`
      );
      waLink = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;
    }

    try {
      const url = isEdit
        ? `${API_BASE}/programs/${id}`
        : `${API_BASE}/programs`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          wa_link: waLink, // Use generated WhatsApp link
          perks: filteredPerks,
          is_active: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/admin/programs");
      } else {
        setError(data.error || "Gagal menyimpan program");
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePerkChange = (index: number, value: string) => {
    const newPerks = [...formData.perks];
    newPerks[index] = value;
    setFormData({ ...formData, perks: newPerks });
  };

  const addPerk = () => {
    setFormData({
      ...formData,
      perks: [...formData.perks, ""],
    });
  };

  const removePerk = (index: number) => {
    setFormData({
      ...formData,
      perks: formData.perks.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminLayout currentPage={location.pathname}>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/programs")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit Program" : "Tambah Program Baru"}
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
            {/* Title */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Tag className="h-4 w-4" />
                Nama Program *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Grand Opening — Kelas Premium"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Branch & Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MapPin className="h-4 w-4" />
                  Cabang *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Pilih Cabang</option>
                  <option value="Pettarani">Pettarani</option>
                  <option value="Kolaka">Kolaka</option>
                  <option value="Kendari">Kendari</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Tag className="h-4 w-4" />
                  Kategori Promo *
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Grand Opening, 11.11, Akhir Bulan"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Program */}
            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">
                Program / Paket *
              </label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="Regular 14–17, Speaking Online (1 Bulan)"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Tanggal Mulai *
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Tanggal Berakhir *
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Quota & Price */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Users className="h-4 w-4" />
                  Kuota Peserta
                </label>
                <input
                  type="number"
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  min="1"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <DollarSign className="h-4 w-4" />
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="1200000"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            {/* Perks */}
            <div>
              <label className="mb-2 text-sm font-medium text-slate-700">
                Keuntungan / Benefit
              </label>
              {formData.perks.map((perk, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => handlePerkChange(index, e.target.value)}
                    placeholder="Gratis Modul, Voucher 100rb, dll"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {formData.perks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerk(index)}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPerk}
                className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
              >
                + Tambah Benefit
              </button>
            </div>

            {/* Image Upload */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImageIcon className="h-4 w-4" />
                Gambar Program
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-3 overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto object-contain max-h-96"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <Upload className="h-4 w-4" />
                  {uploading
                    ? "Uploading..."
                    : imagePreview
                    ? "Ganti Gambar"
                    : "Upload Gambar"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Upload gambar program (max 5MB). Rekomendasi: 1200x800px
                landscape. Ukuran gambar akan disesuaikan dengan file yang
                diupload.
              </p>
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4" />
                Nomor WhatsApp Pendaftaran
              </label>
              <input
                type="tel"
                name="wa_phone"
                value={formData.wa_phone}
                onChange={handleChange}
                placeholder="081234567890 atau 6281234567890"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                Masukkan nomor WhatsApp untuk pendaftaran. Format: 08xxx atau
                628xxx
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/programs")}
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
                ? "Update Program"
                : "Tambah Program"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PromoForm;
