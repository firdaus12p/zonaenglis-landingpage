import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Mail,
  User,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user";
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

const Users = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const { token, user: currentUser } = useAuth();

  console.log("=== Users Component Rendered ===");
  console.log("Token exists:", !!token);
  console.log("Current user:", currentUser);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordFor, setChangingPasswordFor] = useState<User | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as "admin" | "user",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    console.log("Users page mounted");
    console.log("Token:", token ? "exists" : "missing");
    console.log("Current user:", currentUser);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Gagal memuat data user. Silakan coba lagi.");
      showNotification("Gagal memuat data user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "user",
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      name: user.name,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleChangePassword = (user: User) => {
    setChangingPasswordFor(user);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.name) {
      showNotification("Email dan nama harus diisi", "error");
      return;
    }

    if (!editingUser && !formData.password) {
      showNotification("Password harus diisi untuk user baru", "error");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showNotification("Password minimal 6 karakter", "error");
      return;
    }

    try {
      setSubmitting(true);

      const url = editingUser
        ? `${API_BASE}/users/${editingUser.id}`
        : `${API_BASE}/users`;

      const method = editingUser ? "PUT" : "POST";

      const body = editingUser
        ? {
            email: formData.email,
            name: formData.name,
            role: formData.role,
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save user");
      }

      showNotification(
        editingUser ? "User berhasil diupdate!" : "User berhasil ditambahkan!",
        "success"
      );

      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      showNotification(error.message || "Gagal menyimpan user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!changingPasswordFor) return;

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification("Semua field password harus diisi", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification("Password minimal 6 karakter", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("Password dan konfirmasi tidak cocok", "error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/users/${changingPasswordFor.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      showNotification("Password berhasil diubah!", "success");
      setShowPasswordModal(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      showNotification(error.message || "Gagal ubah password", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user");
      }

      showNotification("User berhasil dihapus!", "success");
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (error: any) {
      showNotification(error.message || "Gagal menghapus user", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum pernah login";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (error) {
    return (
      <AdminLayout setCurrentPage={setCurrentPage}>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">{error}</h2>
            <p className="mt-2 text-slate-600">
              Pastikan backend server berjalan di port 3001
            </p>
          </div>
          <Button variant="primary" onClick={fetchUsers}>
            Coba Lagi
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Manajemen User
            </h1>
            <p className="mt-2 text-slate-600">
              Kelola akun admin dan user yang dapat mengakses sistem
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <UserPlus className="h-4 w-4" />
            Tambah User
          </Button>
        </div>

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

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total User</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <UsersIcon className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Admin</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3">
                <Shield className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">User Aktif</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600">
                                (Anda)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.role === "admin" ? "success" : "default"
                          }
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.is_active ? "success" : "danger"}>
                          {user.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.last_login)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleChangePassword(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Tidak ada data user
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser ? "Edit User" : "Tambah User Baru"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
                      placeholder="John Doe"
                      required
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
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password (only for new user) */}
                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-10"
                        placeholder="Minimal 6 karakter"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "admin" | "user",
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingUser ? (
                      "Update"
                    ) : (
                      "Tambah"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && changingPasswordFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Ubah Password - {changingPasswordFor.name}
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4"
                      placeholder="Ulangi password baru"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Ubah Password"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertCircle className="h-6 w-6 text-red-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Hapus User</h2>
              </div>
              <p className="mb-6 text-slate-600">
                Apakah Anda yakin ingin menghapus user ini? User tidak akan bisa
                login lagi.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Ya, Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
