import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

// Types
interface Lead {
  id: number;
  user_name: string;
  user_phone: string;
  user_email?: string;
  user_city?: string;
  affiliate_code: string;
  ambassador_name?: string;
  ambassador_phone?: string;
  program_name: string;
  discount_applied: number;
  first_used_at: string;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  days_ago: number;
}

interface Stats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  conversions: number;
  conversion_rate: number;
}

interface Ambassador {
  id: number;
  name: string;
  code: string;
  phone: string;
}

const AffiliateAdmin = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [selectedAmbassador, setSelectedAmbassador] = useState<number | null>(
    null
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all ambassadors on mount
  useEffect(() => {
    fetchAmbassadors();
  }, []);

  // Fetch stats and leads when ambassador is selected
  useEffect(() => {
    if (selectedAmbassador) {
      fetchStats(selectedAmbassador);
      fetchLeads(selectedAmbassador);
    }
  }, [selectedAmbassador]);

  const fetchAmbassadors = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/ambassadors");
      const data = await response.json();
      setAmbassadors(data);
      if (data.length > 0 && !selectedAmbassador) {
        setSelectedAmbassador(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
    }
  };

  const fetchStats = async (ambassadorId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/affiliate/stats/${ambassadorId}`
      );
      const data = await response.json();
      console.log("Stats response:", data);
      // Backend returns { success: true, stats: {...} }
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error("Invalid stats response:", data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchLeads = async (ambassadorId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/affiliate/leads/${ambassadorId}`
      );
      const data = await response.json();
      console.log("Leads response:", data);
      // Backend returns { success: true, leads: [...] }
      if (data.success && data.leads) {
        setLeads(data.leads);
      } else {
        console.error("Invalid leads response:", data);
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (
    usageId: number,
    status: string,
    notes: string,
    registered: boolean
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/affiliate/update-status/${usageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follow_up_status: status,
            follow_up_notes: notes,
            registered,
          }),
        }
      );

      if (response.ok) {
        // Refresh leads
        if (selectedAmbassador) {
          fetchLeads(selectedAmbassador);
          fetchStats(selectedAmbassador);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const selectedAmbassadorData = ambassadors.find(
    (a) => a.id === selectedAmbassador
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Affiliate Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor dan kelola leads dari affiliate tracking
          </p>
        </div>

        {/* Ambassador Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Pilih Ambassador
          </label>
          <select
            value={selectedAmbassador || ""}
            onChange={(e) => setSelectedAmbassador(Number(e.target.value))}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {ambassadors.map((ambassador) => (
              <option key={ambassador.id} value={ambassador.id}>
                {ambassador.name} ({ambassador.code})
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Usage</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total_uses}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Today</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.today_uses}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending Follow-up</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.pending_followups}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <CheckCircle className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Conversions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.conversions}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-100 p-2">
                  <TrendingUp className="h-5 w-5 text-rose-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.conversion_rate
                      ? Number(stats.conversion_rate).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Active Leads untuk {selectedAmbassadorData?.name}
          </h2>

          {loading ? (
            <div className="py-8 text-center text-slate-600">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="py-8 text-center text-slate-600">
              Belum ada leads untuk ambassador ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Nama
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      WhatsApp
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Program
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Discount
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Days Ago
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onUpdate={updateLeadStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Lead Row Component
const LeadRow = ({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (
    id: number,
    status: string,
    notes: string,
    registered: boolean
  ) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(lead.follow_up_status);
  const [notes, setNotes] = useState(lead.follow_up_notes || "");
  const [registered, setRegistered] = useState(lead.registered);

  const handleSave = () => {
    onUpdate(lead.id, status, notes, registered);
    setEditing(false);
  };

  const handleNotifyAmbassador = () => {
    if (!lead.ambassador_phone) {
      alert("Nomor ambassador tidak tersedia!");
      return;
    }

    // Generate WhatsApp message
    const message = `🎉 ADA YANG PAKAI KODE ANDA!

📝 Kode: ${lead.affiliate_code}
👤 Nama: ${lead.user_name}
📱 WhatsApp: ${formatPhone(lead.user_phone)}
${lead.user_email ? `📧 Email: ${lead.user_email}` : ""}
🎯 Program: ${lead.program_name}
💰 Diskon: ${rupiah(lead.discount_applied)}
📅 ${lead.days_ago} hari yang lalu

Segera follow-up user ini! 🚀`;

    const whatsappUrl = `https://wa.me/${lead.ambassador_phone.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    contacted: "bg-blue-100 text-blue-700 border-blue-200",
    converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    lost: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const formatPhone = (phone: string) => {
    // Format: 0812-3456-7890
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("62")) {
      return "0" + cleaned.slice(2);
    }
    return phone;
  };

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 text-sm font-semibold text-slate-900">
        {lead.user_name}
      </td>
      <td className="py-3">
        <a
          href={`https://wa.me/${lead.user_phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
        >
          <MessageCircle className="h-4 w-4" />
          {formatPhone(lead.user_phone)}
        </a>
      </td>
      <td className="py-3 text-sm text-slate-600">{lead.user_email || "-"}</td>
      <td className="py-3 text-sm text-slate-900">{lead.program_name}</td>
      <td className="py-3 text-sm font-semibold text-emerald-700">
        {rupiah(lead.discount_applied)}
      </td>
      <td className="py-3 text-sm text-slate-600">{lead.days_ago}d ago</td>
      <td className="py-3">
        {editing ? (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        ) : (
          <span
            className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
              statusColors[lead.follow_up_status]
            }`}
          >
            {lead.follow_up_status}
          </span>
        )}
      </td>
      <td className="py-3">
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNotifyAmbassador}
                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 flex items-center gap-1"
                title="Kirim notifikasi ke Ambassador via WhatsApp"
              >
                <MessageCircle className="h-3 w-3" />
                Notify
              </button>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AffiliateAdmin;
