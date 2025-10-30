import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button } from "../../components";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";

interface CountdownBatchFormData {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  description: string;
  instructor: string;
  locationMode: "Online" | "Offline" | "Hybrid";
  locationAddress: string;
  price: number;
  registrationDeadline: string;
  targetStudents: number;
  currentStudents: number;
  status: "Active" | "Paused" | "Completed" | "Upcoming";
  visibility: "Public" | "Private";
}

interface CountdownBatchFormProps {
  setCurrentPage: (page: string) => void;
  mode: "create" | "edit";
  batchId?: number;
}

const CountdownBatchForm: React.FC<CountdownBatchFormProps> = ({
  setCurrentPage,
  mode = "create",
}) => {
  const { id } = useParams<{ id: string }>();
  const batchId = id ? parseInt(id) : undefined;
  const [formData, setFormData] = useState<CountdownBatchFormData>({
    name: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "WITA",
    description: "",
    instructor: "",
    locationMode: "Online",
    locationAddress: "",
    price: 0,
    registrationDeadline: "",
    targetStudents: 50,
    currentStudents: 0,
    status: "Upcoming",
    visibility: "Public",
  });

  const [errors, setErrors] = useState<Partial<CountdownBatchFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const API_BASE = "http://localhost:3001/api";

  // Load batch data if editing
  useEffect(() => {
    if (mode === "edit" && batchId) {
      fetchBatchData();
    }
  }, [mode, batchId]);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/countdown/${batchId}`);
      const data = await response.json();

      if (data.success) {
        const batch = data.data;
        setFormData({
          name: batch.name,
          startDate: batch.start_date,
          startTime: batch.start_time.substring(0, 5), // HH:MM format
          endDate: batch.end_date || "",
          endTime: batch.end_time?.substring(0, 5) || "",
          timezone: batch.timezone,
          description: batch.description || "",
          instructor: batch.instructor || "",
          locationMode: batch.location_mode || "Online",
          locationAddress: batch.location_address || "",
          price: batch.price || 0,
          registrationDeadline: batch.registration_deadline || "",
          targetStudents: batch.target_students,
          currentStudents: batch.current_students,
          status: batch.status,
          visibility: batch.visibility,
        });
      } else {
        showAlert(
          "Error",
          data.message || "Failed to load batch data",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error fetching batch:", error);
      showAlert("Error", "Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  // Modal Helper Functions
  const showAlert = (
    title: string,
    message: string,
    type: "alert" | "error" | "success" = "alert"
  ) => {
    setModal({
      show: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<CountdownBatchFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Batch name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (formData.targetStudents < 1) {
      newErrors.targetStudents = 1;
    }

    if (formData.currentStudents < 0) {
      newErrors.currentStudents = 0;
    }

    if (formData.currentStudents > formData.targetStudents) {
      newErrors.currentStudents = formData.targetStudents;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof CountdownBatchFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle Number Input Change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert(
        "Validation Error",
        "Please fill in all required fields correctly",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? `${API_BASE}/countdown`
          : `${API_BASE}/countdown/${batchId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showAlert(
          "Success",
          mode === "create"
            ? "Countdown batch created successfully!"
            : "Countdown batch updated successfully!",
          "success"
        );

        // Redirect after 1.5 seconds
        setTimeout(() => {
          setCurrentPage("/admin/countdown");
        }, 1500);
      } else {
        showAlert("Error", data.message || "Failed to save batch", "error");
      }
    } catch (error: any) {
      console.error("Error saving batch:", error);
      showAlert("Error", "Failed to connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
      setCurrentPage("/admin/countdown");
    }
  };

  return (
    <AdminLayout
      currentPage="/admin/countdown/new"
      setCurrentPage={setCurrentPage}
    >
      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 relative animate-slide-in-right">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-full ${
                  modal.type === "success"
                    ? "bg-emerald-100"
                    : modal.type === "error"
                    ? "bg-red-100"
                    : "bg-amber-100"
                }`}
              >
                {modal.type === "success" ? (
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                ) : (
                  <AlertCircle
                    className={`h-6 w-6 ${
                      modal.type === "error" ? "text-red-600" : "text-amber-600"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {modal.title}
                </h3>
                <p className="text-slate-600">{modal.message}</p>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={closeModal}>
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage("/admin/countdown")}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === "create" ? "Create New Batch" : "Edit Batch"}
            </h1>
            <p className="text-slate-600 mt-1">
              {mode === "create"
                ? "Add a new countdown batch for your courses"
                : "Update batch information and settings"}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="p-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600">Loading batch data...</p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Batch Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Batch A, Batch Premium"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief description of this batch..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Schedule */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                Schedule
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.startDate ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.startTime ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="WIB">WIB (UTC+7)</option>
                    <option value="WITA">WITA (UTC+8)</option>
                    <option value="WIT">WIT (UTC+9)</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </Card>

            {/* Instructor & Location */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Instructor & Location
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Sarah Johnson"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Location Mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location Mode
                  </label>
                  <select
                    name="locationMode"
                    value={formData.locationMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Location Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location Address
                </label>
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleInputChange}
                  placeholder="e.g., Jl. Pendidikan No. 123 or https://zoom.us/j/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Pricing
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (IDR)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="10000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-slate-500 text-sm mt-1">
                  Leave as 0 for free batches
                </p>
              </div>
            </Card>

            {/* Students & Status */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Students & Status
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Target Students */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Students <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="targetStudents"
                    value={formData.targetStudents}
                    onChange={handleNumberChange}
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Current Students */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Students
                  </label>
                  <input
                    type="number"
                    name="currentStudents"
                    value={formData.currentStudents}
                    onChange={handleNumberChange}
                    min="0"
                    max={formData.targetStudents}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Public">
                      🌐 Public (Visible to everyone)
                    </option>
                    <option value="Private">
                      🔒 Private (Hidden from public)
                    </option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Form Actions */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {mode === "create" ? "Create Batch" : "Save Changes"}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default CountdownBatchForm;
