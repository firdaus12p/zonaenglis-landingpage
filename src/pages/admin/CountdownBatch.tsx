import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  Card,
  Button,
  Badge,
  ConfirmModal,
  SuccessModal,
} from "../../components";
import {
  Plus,
  Clock,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Users,
  Target,
  AlertCircle,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface CountdownBatch {
  id: number;
  name: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  timezone: string;
  description: string;
  instructor?: string;
  locationMode?: "Online" | "Offline" | "Hybrid";
  locationAddress?: string;
  price?: number;
  registrationDeadline?: string;
  targetStudents: number;
  currentStudents: number;
  status:
    | "Draft"
    | "Active"
    | "Upcoming"
    | "Paused"
    | "Completed"
    | "Cancelled";
  visibility: "Public" | "Private";
  createdAt: string;
  updatedAt: string;
}

const CountdownBatch: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batches, setBatches] = useState<CountdownBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    totalStudents: 0,
    upcomingBatches: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch batches from API
  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/countdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        // Transform snake_case to camelCase
        const transformedBatches = data.data.map(
          (batch: {
            id: number;
            name: string;
            start_date: string;
            start_time: string;
            end_date: string;
            end_time: string;
            timezone: string;
            description: string;
            instructor: string;
            location_mode: string;
            location_address: string;
            price: number;
            registration_deadline: string;
            target_students: number;
            current_students: number;
            status: string;
            visibility: string;
            created_at: string;
            updated_at: string;
          }) => ({
            id: batch.id,
            name: batch.name,
            startDate: batch.start_date,
            startTime: batch.start_time,
            endDate: batch.end_date,
            endTime: batch.end_time,
            timezone: batch.timezone,
            description: batch.description,
            instructor: batch.instructor,
            locationMode: batch.location_mode,
            locationAddress: batch.location_address,
            price: batch.price,
            registrationDeadline: batch.registration_deadline,
            targetStudents: batch.target_students,
            currentStudents: batch.current_students,
            status: batch.status,
            visibility: batch.visibility,
            createdAt: batch.created_at,
            updatedAt: batch.updated_at,
          }),
        );
        setBatches(transformedBatches);
      } else {
        setError(data.message || "Failed to fetch batches");
      }
    } catch (err: unknown) {
      console.error("Error fetching batches:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/countdown/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setStats({
          totalBatches: data.data.total_batches || 0,
          activeBatches: data.data.active_batches || 0,
          totalStudents: data.data.total_students || 0,
          upcomingBatches: data.data.upcoming_batches || 0,
        });
      }
    } catch (err: unknown) {
      console.error("Error fetching stats:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBatches();
    fetchStats();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Paused":
        return "warning";
      case "Completed":
        return "info";
      case "Upcoming":
        return "primary";
      case "Draft":
        return "secondary";
      case "Cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === "Public" ? "success" : "secondary";
  };

  const calculateTimeRemaining = (batch: CountdownBatch) => {
    // Extract date part from ISO timestamp (YYYY-MM-DD)
    const dateOnly = batch.startDate.split("T")[0];

    // Create target date with proper timezone offset
    // Map timezone to UTC offset
    const timezoneOffsets: { [key: string]: string } = {
      WIB: "+07:00", // UTC+7
      WITA: "+08:00", // UTC+8
      WIT: "+09:00", // UTC+9
    };

    const offset = timezoneOffsets[batch.timezone] || "+08:00";
    const targetDate = new Date(`${dateOnly}T${batch.startTime}${offset}`);

    const now = currentTime;
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, days, hours, minutes, seconds };
  };

  const formatDateTime = (date: string, time: string, timezone: string) => {
    // Extract date part from ISO timestamp
    const dateOnly = date.split("T")[0];
    const fullDate = new Date(`${dateOnly}T${time}`);

    return `${fullDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}, ${time} ${timezone}`;
  };

  const getStudentProgress = (current: number, target: number) => {
    return target > 0 ? Math.round((current / target) * 100) : 0;
  };

  const toggleBatchStatus = async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/countdown/${id}/toggle-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setBatches((prev) =>
          prev.map((batch) =>
            batch.id === id ? { ...batch, status: data.data.status } : batch,
          ),
        );
        // Refresh stats
        fetchStats();
      } else {
        alert(data.message || "Gagal mengubah status batch");
      }
    } catch (err: unknown) {
      console.error("Error toggling batch status:", err);
      alert("Gagal mengubah status batch");
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setBatchToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;

    try {
      const response = await fetch(
        `${API_BASE}/countdown/${batchToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setBatches((prev) =>
          prev.filter((batch) => batch.id !== batchToDelete.id),
        );
        // Refresh stats
        fetchStats();
        setSuccessMessage(data.message || "Batch berhasil dihapus");
        setShowSuccessModal(true);
      } else {
        setSuccessMessage(data.message || "Gagal menghapus batch");
      }
    } catch (err: unknown) {
      console.error("Error deleting batch:", err);
      setSuccessMessage("Gagal menghapus batch");
    }
  };

  return (
    <AdminLayout currentPage="/admin/countdown" setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Countdown Batch
            </h1>
            <p className="text-slate-600 mt-1">
              Manage batch schedules and countdown timers
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = "/admin/countdown/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Batch
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Batches
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? "..." : stats.totalBatches}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Batches
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {loading ? "..." : stats.activeBatches}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Play className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? "..." : stats.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {loading ? "..." : stats.upcomingBatches}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Active Batch Countdown */}
        {batches.find((b) => b.status === "Active") && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Current Active Batch:{" "}
                    {batches.find((b) => b.status === "Active")?.name}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {formatDateTime(
                      batches.find((b) => b.status === "Active")?.startDate ||
                        "",
                      batches.find((b) => b.status === "Active")?.startTime ||
                        "",
                      batches.find((b) => b.status === "Active")?.timezone ||
                        "",
                    )}
                  </p>
                </div>
              </div>
              <Badge variant="success">Live Countdown</Badge>
            </div>

            {(() => {
              const activeBatch = batches.find((b) => b.status === "Active");
              if (!activeBatch) return null;

              const timeRemaining = calculateTimeRemaining(activeBatch);

              if (timeRemaining.expired) {
                return (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-red-600 mb-2">
                      Batch Started!
                    </h4>
                    <p className="text-red-500">
                      This batch has already begun.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {timeRemaining.days}
                      </div>
                      <div className="text-sm text-blue-500 mt-1">Days</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {timeRemaining.hours}
                      </div>
                      <div className="text-sm text-blue-500 mt-1">Hours</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {timeRemaining.minutes}
                      </div>
                      <div className="text-sm text-blue-500 mt-1">Minutes</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600">
                        {timeRemaining.seconds}
                      </div>
                      <div className="text-sm text-blue-500 mt-1">Seconds</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Batches List */}
        {loading ? (
          <Card className="p-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Loading batches...
              </h3>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error loading batches
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={fetchBatches}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : batches.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No countdown batches found
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first batch to start managing course schedules.
              </p>
              <Button
                variant="primary"
                onClick={() => (window.location.href = "/admin/countdown/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Batch
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {batches.map((batch) => {
              const timeRemaining = calculateTimeRemaining(batch);
              const studentProgress = getStudentProgress(
                batch.currentStudents,
                batch.targetStudents,
              );

              return (
                <Card key={batch.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {batch.name}
                        </h3>
                        <Badge variant={getStatusColor(batch.status)}>
                          {batch.status}
                        </Badge>
                        <Badge variant={getVisibilityColor(batch.visibility)}>
                          {batch.visibility}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {batch.description}
                      </p>

                      {/* New Fields Display */}
                      <div className="space-y-2 mb-3">
                        {batch.instructor && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Users className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">Instructor:</span>
                            <span className="ml-1">{batch.instructor}</span>
                          </div>
                        )}
                        {batch.locationMode && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium">Location:</span>
                            <span className="ml-1">{batch.locationMode}</span>
                            {batch.locationAddress && (
                              <span className="ml-1 text-slate-500">
                                (
                                {batch.locationAddress.length > 40
                                  ? batch.locationAddress.substring(0, 40) +
                                    "..."
                                  : batch.locationAddress}
                                )
                              </span>
                            )}
                          </div>
                        )}
                        {batch.price !== undefined && batch.price > 0 && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">Price:</span>
                            <span className="ml-1">
                              Rp {batch.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDateTime(
                          batch.startDate,
                          batch.startTime,
                          batch.timezone,
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => toggleBatchStatus(batch.id)}
                        className={`p-2 rounded-lg ${
                          batch.status === "Active"
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          batch.status === "Active"
                            ? "Pause batch"
                            : "Activate batch"
                        }
                      >
                        {batch.status === "Active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/countdown/edit/${batch.id}`)
                        }
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                        title="Edit batch"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(batch.id, batch.name)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Hapus batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Countdown Display */}
                  {!timeRemaining.expired ? (
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">
                          Time Remaining
                        </span>
                        <RotateCcw className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-xl font-bold text-slate-900">
                            {timeRemaining.days}
                          </div>
                          <div className="text-xs text-slate-500">Days</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900">
                            {timeRemaining.hours}
                          </div>
                          <div className="text-xs text-slate-500">Hours</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900">
                            {timeRemaining.minutes}
                          </div>
                          <div className="text-xs text-slate-500">Min</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-900">
                            {timeRemaining.seconds}
                          </div>
                          <div className="text-xs text-slate-500">Sec</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 rounded-lg p-4 mb-4 text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-sm font-medium text-red-600">
                        Batch has started
                      </div>
                    </div>
                  )}

                  {/* Student Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">
                        Students Enrolled
                      </span>
                      <span className="text-sm text-slate-900">
                        {batch.currentStudents} / {batch.targetStudents}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          studentProgress >= 90
                            ? "bg-emerald-500"
                            : studentProgress >= 70
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(studentProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{studentProgress}% filled</span>
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        <span>Target: {batch.targetStudents}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBatchToDelete(null);
        }}
        onConfirm={handleDeleteBatch}
        title="Hapus Batch?"
        message={`Apakah Anda yakin ingin menghapus batch "${batchToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message={successMessage}
        autoClose={true}
      />
    </AdminLayout>
  );
};

export default CountdownBatch;
