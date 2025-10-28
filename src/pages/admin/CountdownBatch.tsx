import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
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

interface CountdownBatch {
  id: number;
  name: string;
  startDate: string;
  startTime: string;
  timezone: string;
  description: string;
  targetStudents: number;
  currentStudents: number;
  status: "Active" | "Paused" | "Completed" | "Upcoming";
  visibility: "Public" | "Private";
  createdAt: string;
  updatedAt: string;
}

const CountdownBatch: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - akan diganti dengan data real dari API
  const [batches, setBatches] = useState<CountdownBatch[]>([
    {
      id: 1,
      name: "Batch A",
      startDate: "2025-11-03",
      startTime: "09:00",
      timezone: "WITA",
      description:
        "Program intensif pembelajaran bahasa Inggris dengan metode NBSN dan AI Coach",
      targetStudents: 50,
      currentStudents: 32,
      status: "Active",
      visibility: "Public",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-15",
    },
    {
      id: 2,
      name: "Batch B",
      startDate: "2025-12-01",
      startTime: "14:00",
      timezone: "WITA",
      description:
        "Program lanjutan untuk peserta yang telah menyelesaikan Batch A",
      targetStudents: 40,
      currentStudents: 15,
      status: "Upcoming",
      visibility: "Public",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-10",
    },
    {
      id: 3,
      name: "Batch Premium",
      startDate: "2025-01-15",
      startTime: "10:30",
      timezone: "WITA",
      description: "Program eksklusif dengan mentor personal dan kelas privat",
      targetStudents: 20,
      currentStudents: 8,
      status: "Upcoming",
      visibility: "Private",
      createdAt: "2024-09-15",
      updatedAt: "2024-10-01",
    },
  ]);

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
        return "default";
      default:
        return "default";
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === "Public" ? "success" : "secondary";
  };

  const calculateTimeRemaining = (batch: CountdownBatch) => {
    const targetDate = new Date(
      `${batch.startDate}T${batch.startTime}:00+08:00`
    ); // WITA = UTC+8
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
    const fullDate = new Date(`${date}T${time}:00`);
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

  const toggleBatchStatus = (id: number) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === id) {
          const newStatus = batch.status === "Active" ? "Paused" : "Active";
          return {
            ...batch,
            status: newStatus,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return batch;
      })
    );
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
                  {batches.length}
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
                  {batches.filter((b) => b.status === "Active").length}
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
                  {batches.reduce((sum, b) => sum + b.currentStudents, 0)}
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
                  {batches.filter((b) => b.status === "Upcoming").length}
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
                      batches.find((b) => b.status === "Active")?.timezone || ""
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
        <div className="grid gap-6 lg:grid-cols-2">
          {batches.map((batch) => {
            const timeRemaining = calculateTimeRemaining(batch);
            const studentProgress = getStudentProgress(
              batch.currentStudents,
              batch.targetStudents
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
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDateTime(
                        batch.startDate,
                        batch.startTime,
                        batch.timezone
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
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
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

        {batches.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No countdown batches found
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first batch to start managing course schedules.
              </p>
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create New Batch
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default CountdownBatch;
