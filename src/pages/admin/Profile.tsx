import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button } from "../../components";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { API_BASE } from "../../config/api";

const Profile = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const { user, token, logout, mustChangePassword, clearMustChangePassword } =
    useAuth();
  const [searchParams] = useSearchParams();
  const forcePasswordChange =
    searchParams.get("change_password") === "required" || mustChangePassword;

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const result = await response.json();
      setProfileForm({
        name: result.data.name,
        email: result.data.email,
      });
    } catch (error) {
      showNotification("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name || !profileForm.email) {
      showNotification("Nama dan email harus diisi", "error");
      return;
    }

    try {
      setSavingProfile(true);
      const response = await fetch(`${API_BASE}/users/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      showNotification("Profil berhasil diupdate!", "success");

      // If email changed, logout user to re-login
      if (profileForm.email !== user?.email) {
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal update profil";
      showNotification(message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showNotification("Semua field password harus diisi", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification("Password baru minimal 6 karakter", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification("Password baru dan konfirmasi tidak cocok", "error");
      return;
    }

    try {
      setSavingPassword(true);
      const response = await fetch(`${API_BASE}/users/${user?.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      // Clear the must_change_password flag if it was set
      if (mustChangePassword) {
        clearMustChangePassword();
      }

      showNotification(
        "Password berhasil diubah! Silakan login kembali",
        "success",
      );

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal ubah password";
      showNotification(message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  if (loading) {
    return (
      <AdminLayout setCurrentPage={setCurrentPage}>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pengaturan Profil
          </h1>
          <p className="mt-2 text-slate-600">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>

        {/* Force Password Change Warning */}
        {forcePasswordChange && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <ShieldAlert className="h-6 w-6 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">
                Perubahan Password Diperlukan
              </p>
              <p className="text-sm text-yellow-700">
                Demi keamanan akun, Anda harus mengganti password default
                sebelum melanjutkan. Silakan ubah password Anda di bawah ini.
              </p>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div
            className={`flex items-center gap-3 rounded-lg p-4 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Information Card */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Informasi Profil
                  </h2>
                  <p className="text-sm text-slate-600">
                    Update nama dan email Anda
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="email@example.com"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Jika email diubah, Anda perlu login ulang
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Profil
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Lock className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ubah Password
                  </h2>
                  <p className="text-sm text-slate-600">
                    Pastikan password Anda kuat dan aman
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Security Info */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-yellow-100 p-2">
              <AlertCircle className="h-5 w-5 text-yellow-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Tips Keamanan</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>
                  • Gunakan password yang kuat dengan kombinasi huruf, angka,
                  dan simbol
                </li>
                <li>• Jangan gunakan password yang sama dengan akun lain</li>
                <li>• Ubah password secara berkala untuk keamanan maksimal</li>
                <li>• Jangan bagikan password kepada siapapun</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Profile;
