import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button } from "../../components";
import LocalStorageTest from "../../components/debug/LocalStorageTest";
import {
  ArrowLeft,
  Upload,
  User,
  MapPin,
  Mail,
  Phone,
  Home,
  Save,
  X,
} from "lucide-react";

interface AmbassadorFormData {
  name: string;
  type:
    | "Senior Ambassador"
    | "Campus Ambassador"
    | "Community Ambassador"
    | "Junior Ambassador";
  location: string;
  institution: string;
  address: string;
  email: string;
  phone: string;
  testimonial: string;
  photo: string;
}

interface AmbassadorFormProps {
  setCurrentPage: (page: string) => void;
  mode: "create" | "edit";
  ambassadorData?: any;
}

const AmbassadorForm: React.FC<AmbassadorFormProps> = ({
  setCurrentPage,
  mode = "create",
  ambassadorData: existingAmbassadorData,
}) => {
  const [formData, setFormData] = useState<AmbassadorFormData>({
    name: existingAmbassadorData?.name || "",
    type: existingAmbassadorData?.type || "Senior Ambassador",
    location: existingAmbassadorData?.location || "",
    institution: existingAmbassadorData?.institution || "",
    address: existingAmbassadorData?.address || "",
    email: existingAmbassadorData?.email || "",
    phone: existingAmbassadorData?.phone || "",
    testimonial: existingAmbassadorData?.testimonial || "",
    photo: existingAmbassadorData?.photo || "",
  });

  const [errors, setErrors] = useState<Partial<AmbassadorFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<AmbassadorFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama ambassador wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Lokasi wajib diisi";
    }

    if (!formData.institution.trim()) {
      newErrors.institution = "Sekolah/Kampus/Institusi wajib diisi";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate affiliate code based on type and name
      const typePrefix =
        formData.type === "Senior Ambassador"
          ? "SNR"
          : formData.type === "Campus Ambassador"
          ? "CAM"
          : formData.type === "Junior Ambassador"
          ? "JNR"
          : "COM";

      const nameCode =
        formData.name.length >= 3
          ? formData.name.substring(0, 3).toUpperCase()
          : formData.name.toUpperCase().padEnd(3, "X");

      const randomId = Math.floor(Math.random() * 900) + 100;
      const affiliateCode = `ZE-${typePrefix}-${nameCode}${randomId}`;

      // Prepare data for API
      const apiData = {
        name: formData.name,
        role: formData.type,
        location: formData.location,
        institution: formData.institution,
        achievement: null,
        commission: 0,
        referrals: 0,
        badge_text: null,
        badge_variant: "ambassador",
        image_url: formData.photo || null,
        affiliate_code: affiliateCode,
        testimonial: formData.testimonial,
        phone: formData.phone,
        email: formData.email,
        bank_account: null,
        bank_name: null,
        commission_rate: 15.0,
      };

      // Call API
      const url =
        mode === "create"
          ? "http://localhost:3001/api/ambassadors"
          : `http://localhost:3001/api/ambassadors/${existingAmbassadorData?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save ambassador");
      }

      const result = await response.json();
      console.log("Ambassador saved:", result);

      // Show success message
      alert(
        `Ambassador ${
          mode === "create" ? "ditambahkan" : "diperbarui"
        } successfully! Affiliate Code: ${affiliateCode}`
      );

      // Navigate back to ambassadors list
      setCurrentPage("admin-ambassadors");
    } catch (error) {
      console.error("Error saving ambassador:", error);
      alert(
        `Terjadi kesalahan saat menyimpan data ambassador: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get URL back
      // For now, we'll create a placeholder URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          photo: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout
      currentPage="admin-ambassadors"
      setCurrentPage={setCurrentPage}
    >
      <div className="space-y-6">
        {/* Debug Component - Remove in production */}
        <LocalStorageTest />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage("admin-ambassadors")}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === "create" ? "Tambah Ambassador" : "Edit Ambassador"}
              </h1>
              <p className="text-slate-600 mt-1">
                {mode === "create"
                  ? "Daftarkan ambassador baru untuk program Zona English"
                  : "Perbarui informasi ambassador"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload Section */}
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Ambassador"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : formData.name ? (
                    formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  ) : (
                    "AB"
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Klik ikon upload untuk menambahkan foto ambassador
              </p>
            </div>

            {/* Personal Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="Masukkan nama lengkap ambassador"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Ambassador *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Senior Ambassador">Senior Ambassador</option>
                  <option value="Campus Ambassador">Campus Ambassador</option>
                  <option value="Community Ambassador">
                    Community Ambassador
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="ambassador@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="+62812-3456-7890"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Informasi Lokasi
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Lokasi/Kota *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? "border-red-300" : "border-slate-300"
                  }`}
                >
                  <option value="">Pilih Cabang</option>
                  <option value="Pettarani">Pettarani (Makassar)</option>
                  <option value="Kolaka">Kolaka</option>
                  <option value="Kendari">Kendari</option>
                </select>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  Sekolah/Kampus/Institusi *
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.institution ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="Contoh: SMAN 1 Makassar, Universitas Hasanuddin, PT Maju Jaya"
                />
                {errors.institution && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.institution}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Institusi tempat ambassador berasal (akan ditampilkan di
                  PromoHub)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Home className="inline h-4 w-4 mr-1" />
                  Alamat Lengkap *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? "border-red-300" : "border-slate-300"
                  }`}
                  placeholder="Jl. Nama Jalan No. 123, Kelurahan, Kecamatan, Kota, Provinsi"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  💬 Testimonial / Komentar
                </label>
                <textarea
                  value={formData.testimonial}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      testimonial: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Kelas premium-nya seru & fokus speaking!"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Komentar tentang pengalaman di Zona English (akan ditampilkan
                  di PromoHub)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage("admin-ambassadors")}
                className="px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? "Menyimpan..."
                  : mode === "create"
                  ? "Tambah Ambassador"
                  : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AmbassadorForm;
