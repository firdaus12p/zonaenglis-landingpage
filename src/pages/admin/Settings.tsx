import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button } from "../../components";
import {
  Save,
  User,
  Phone,
  Users as UsersIcon,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { API_BASE } from "../../config/api";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: "string" | "number" | "boolean" | "json";
  category: string;
  label: string;
  description: string;
  is_public: boolean;
  updated_at: string;
}

interface SettingsGroup {
  [category: string]: Setting[];
}

const Settings = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [grouped, setGrouped] = useState<SettingsGroup>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/settings`);
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setGrouped(result.grouped);

        // Initialize form data
        const initialData: { [key: string]: string } = {};
        result.data.forEach((setting: Setting) => {
          initialData[setting.setting_key] = setting.setting_value;
        });
        setFormData(initialData);
      } else {
        setError(result.message || "Failed to load settings");
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare settings array for bulk update
      const settingsToUpdate = settings
        .filter(
          (setting) => formData[setting.setting_key] !== setting.setting_value
        )
        .map((setting) => ({
          key: setting.setting_key,
          value: formData[setting.setting_key],
        }));

      if (settingsToUpdate.length === 0) {
        setSuccess("No changes to save");
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `${settingsToUpdate.length} setting(s) updated successfully!`
        );
        // Refresh settings
        fetchSettings();

        // Auto-hide success message
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const value = formData[setting.setting_key] || "";

    if (setting.setting_type === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleChange(
                setting.setting_key,
                value === "true" ? "false" : "true"
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === "true" ? "bg-emerald-500" : "bg-slate-300"
            }`}
            type="button"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-slate-600">
            {value === "true" ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
    }

    if (setting.setting_type === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder={setting.description}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(setting.setting_key, e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        placeholder={setting.description}
      />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profile":
        return <User className="h-5 w-5" />;
      case "general":
        return <Phone className="h-5 w-5" />;
      case "ambassador":
        return <UsersIcon className="h-5 w-5" />;
      case "content":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      profile: "Profile Settings",
      general: "WhatsApp Contact Numbers",
      ambassador: "Ambassador Settings",
      content: "Article & Content Settings",
      security: "Security Settings",
    };
    return titles[category] || category;
  };

  if (loading) {
    return (
      <AdminLayout
        currentPage="/admin/settings"
        setCurrentPage={setCurrentPage}
      >
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-slate-600">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/settings" setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage system configuration and preferences
            </p>
          </div>

          <Button
            onClick={handleSave}
            variant="primary"
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Settings Categories */}
        <div className="space-y-6">
          {Object.keys(grouped).map((category) => (
            <Card key={category} padding="lg">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {getCategoryTitle(category)}
                </h2>
              </div>

              <div className="space-y-5">
                {grouped[category].map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-900">
                          {setting.label}
                        </label>
                        {setting.description && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      {setting.is_public && (
                        <span className="ml-3 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Public
                        </span>
                      )}
                    </div>
                    <div className="mt-2">{renderSettingInput(setting)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Save Button */}
        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button
            onClick={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
