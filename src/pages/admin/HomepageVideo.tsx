import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Video, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, YouTubePlayer } from "../../components";
import { API_BASE } from "../../config/api";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function HomepageVideo() {
  const { token } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch current video URL
  useEffect(() => {
    fetchVideoUrl();
  }, []);

  const fetchVideoUrl = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/homepage_video_url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success && data.data) {
        const url = data.data.setting_value || "";
        setVideoUrl(url);
        setOriginalUrl(url);
      }
    } catch (error) {
      console.error("Error fetching video URL:", error);
      setMessage({
        type: "error",
        text: "Gagal memuat URL video",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate YouTube URL
    if (videoUrl && !getYouTubeVideoId(videoUrl)) {
      setMessage({
        type: "error",
        text: "URL YouTube tidak valid. Gunakan format: https://www.youtube.com/watch?v=VIDEO_ID atau https://youtu.be/VIDEO_ID",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/settings/homepage_video_url`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: videoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setOriginalUrl(videoUrl);
        setMessage({
          type: "success",
          text: "Video berhasil diperbarui!",
        });
      } else {
        throw new Error(data.message || "Gagal memperbarui video");
      }
    } catch (error) {
      console.error("Error saving video URL:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal menyimpan video",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = videoUrl !== originalUrl;
  const videoId = getYouTubeVideoId(videoUrl);

  if (loading) {
    return (
      <AdminLayout currentPage="/admin/homepage-video">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="/admin/homepage-video">
      <div className="space-y-6">
        {/* Alert Messages */}
        {message && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Video className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Preview: Inside Zona English
              </h3>
              <p className="text-sm text-slate-600">
                Video akan otomatis diputar di halaman utama
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <label
                htmlFor="videoUrl"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                YouTube URL
              </label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID atau https://youtu.be/VIDEO_ID"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Video akan diputar otomatis dengan suara mute dan looping
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                variant="primary"
                icon={<Save className="h-4 w-4" />}
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              {hasChanges && (
                <Button
                  onClick={() => setVideoUrl(originalUrl)}
                  variant="outline-primary"
                >
                  Batal
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Preview Card */}
        {videoId && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Preview</h3>
            <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <YouTubePlayer url={videoUrl} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              <strong>Catatan:</strong> Preview ini menampilkan video dengan
              kontrol standar. Di halaman utama, video akan autoplay dengan mute
              dan looping.
            </p>
          </Card>
        )}

        {/* Help Card */}
        <Card className="border-blue-100 bg-blue-50/50 p-5">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">
            📌 Cara Menggunakan
          </h4>
          <ul className="space-y-1.5 text-sm text-blue-800">
            <li>
              • Salin URL video YouTube (contoh:{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </code>
              )
            </li>
            <li>• Paste di kolom "YouTube URL" dan klik "Simpan Perubahan"</li>
            <li>
              • Video akan muncul di halaman utama (section "Inside Zona
              English")
            </li>
            <li>
              • Video akan otomatis diputar dengan suara mute dan loop terus
              menerus
            </li>
            <li>
              • Kosongkan URL jika ingin menghapus video (akan kembali ke
              placeholder)
            </li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
}
