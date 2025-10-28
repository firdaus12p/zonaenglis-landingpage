import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, Button, Badge } from "../../components";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  Plus,
  Users,
  Link2,
  MoreVertical,
} from "lucide-react";

interface Ambassador {
  id: number;
  name: string;
  type: "Senior Ambassador" | "Campus Ambassador" | "Community Ambassador";
  location: string;
  address: string;
  photo: string; // URL or base64 string
  affiliateCode: string;
  totalReferred: number;
  totalEarnings: number;
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  email: string;
  phone: string;
}

const Ambassadors: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "All" | "Senior Ambassador" | "Campus Ambassador" | "Community Ambassador"
  >("All");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive" | "Pending"
  >("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  // Function to load ambassadors from localStorage
  const loadAmbassadors = () => {
    console.log("Loading ambassadors from localStorage...");
    const stored = localStorage.getItem("ambassadors");
    if (stored) {
      const parsedAmbassadors = JSON.parse(stored);
      console.log("Loaded ambassadors:", parsedAmbassadors);
      setAmbassadors(parsedAmbassadors);
    } else {
      // Initialize with mock data if no data exists
      console.log("No stored data found, initializing with mock data");
      setAmbassadors(mockAmbassadors);
      localStorage.setItem("ambassadors", JSON.stringify(mockAmbassadors));
    }
  };

  // Mock data - will be replaced with real API data
  const mockAmbassadors: Ambassador[] = [
    {
      id: 1,
      name: "Sari Dewi",
      type: "Senior Ambassador",
      location: "Makassar",
      address: "Jl. Sultan Alauddin No. 123, Makassar, Sulawesi Selatan",
      photo: "/images/ambassadors/sari-dewi.jpg",
      affiliateCode: "ZE-SNR-SAR001",
      totalReferred: 45,
      totalEarnings: 2250000,
      status: "Active",
      joinDate: "2024-01-15",
      email: "sari.dewi@email.com",
      phone: "+62812-3456-7890",
    },
    {
      id: 2,
      name: "Ahmad Rahman",
      type: "Campus Ambassador",
      location: "Universitas Hasanuddin",
      address: "Kampus UNHAS, Jl. Perintis Kemerdekaan, Makassar",
      photo: "/images/ambassadors/ahmad-rahman.jpg",
      affiliateCode: "ZE-CAM-AHM002",
      totalReferred: 32,
      totalEarnings: 1600000,
      status: "Active",
      joinDate: "2024-02-10",
      email: "ahmad.rahman@email.com",
      phone: "+62813-9876-5432",
    },
    {
      id: 3,
      name: "Maya Putri",
      type: "Community Ambassador",
      location: "Jakarta",
      address: "Jl. Sudirman No. 456, Jakarta Pusat, DKI Jakarta",
      photo: "/images/ambassadors/maya-putri.jpg",
      affiliateCode: "ZE-COM-MAY003",
      totalReferred: 78,
      totalEarnings: 3900000,
      status: "Active",
      joinDate: "2023-11-20",
      email: "maya.putri@email.com",
      phone: "+62814-1111-2222",
    },
    {
      id: 4,
      name: "Rizki Pratama",
      type: "Senior Ambassador",
      location: "Kendari",
      address: "Jl. Ahmad Yani No. 789, Kendari, Sulawesi Tenggara",
      photo: "/images/ambassadors/rizki-pratama.jpg",
      affiliateCode: "ZE-SNR-RIZ004",
      totalReferred: 23,
      totalEarnings: 1150000,
      status: "Pending",
      joinDate: "2024-03-05",
      email: "rizki.pratama@email.com",
      phone: "+62815-3333-4444",
    },
    {
      id: 5,
      name: "Indira Sari",
      type: "Campus Ambassador",
      location: "Institut Teknologi Bandung",
      address: "Kampus ITB, Jl. Ganesha No. 10, Bandung, Jawa Barat",
      photo: "/images/ambassadors/indira-sari.jpg",
      affiliateCode: "ZE-CAM-IND005",
      totalReferred: 12,
      totalEarnings: 600000,
      status: "Inactive",
      joinDate: "2024-01-28",
      email: "indira.sari@email.com",
      phone: "+62816-5555-6666",
    },
  ];

  // Load ambassadors from localStorage on component mount
  useEffect(() => {
    loadAmbassadors();
  }, []);

  // Listen for custom events to refresh data
  useEffect(() => {
    const handleDataUpdate = () => {
      loadAmbassadors();
    };

    window.addEventListener("ambassadorDataUpdated", handleDataUpdate);

    return () => {
      window.removeEventListener("ambassadorDataUpdated", handleDataUpdate);
    };
  }, []);

  // Listen for window focus to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      loadAmbassadors();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Add effect to listen for localStorage changes (when returning from form)
  useEffect(() => {
    const handleStorageChange = () => {
      loadAmbassadors();
    };

    // Listen for custom event when data is updated
    const handleDataUpdate = () => {
      console.log("Ambassador data updated event received");
      loadAmbassadors();
    };

    window.addEventListener("ambassadorDataUpdated", handleDataUpdate);

    // Also listen for focus event to refresh when coming back to this page
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("ambassadorDataUpdated", handleDataUpdate);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // CRUD Functions
  const handleDeleteAmbassador = (id: number) => {
    const updatedAmbassadors = ambassadors.filter(
      (ambassador) => ambassador.id !== id
    );
    setAmbassadors(updatedAmbassadors);
    localStorage.setItem("ambassadors", JSON.stringify(updatedAmbassadors));
    setShowDeleteConfirm(null);

    // Trigger event to notify other components
    window.dispatchEvent(new CustomEvent("ambassadorDataUpdated"));
  };

  const handleEditAmbassador = (ambassador: Ambassador) => {
    // Store selected ambassador for editing
    localStorage.setItem("editingAmbassador", JSON.stringify(ambassador));
    setCurrentPage("admin-ambassador-form-edit");
  };

  const handleAddAmbassador = () => {
    setCurrentPage("admin-ambassador-form-create");
  };

  const filteredAmbassadors = ambassadors.filter((ambassador) => {
    const matchesSearch =
      ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || ambassador.type === filterType;
    const matchesStatus =
      filterStatus === "All" || ambassador.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "danger";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Senior Ambassador":
        return "primary";
      case "Campus Ambassador":
        return "secondary";
      case "Community Ambassador":
        return "info";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout
      currentPage="admin-ambassadors"
      setCurrentPage={setCurrentPage}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ambassadors</h1>
            <p className="text-slate-600 mt-1">
              Manage and monitor your ambassador network
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={handleAddAmbassador}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ambassador
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Ambassadors
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {ambassadors.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {ambassadors.filter((a) => a.status === "Active").length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {ambassadors.reduce((sum, a) => sum + a.totalReferred, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Link2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(
                    ambassadors.reduce((sum, a) => sum + a.totalEarnings, 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ambassadors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as typeof filterType)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="Senior Ambassador">Senior Ambassador</option>
                <option value="Campus Ambassador">Campus Ambassador</option>
                <option value="Community Ambassador">
                  Community Ambassador
                </option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Ambassadors Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Ambassador
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Location
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Affiliate Code
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Referrals
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Earnings
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAmbassadors.map((ambassador) => (
                  <tr key={ambassador.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {ambassador.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {ambassador.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {ambassador.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getTypeColor(ambassador.type)}>
                        {ambassador.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">
                          {ambassador.location}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
                          {ambassador.affiliateCode}
                        </code>
                        <button className="ml-2 p-1 text-slate-400 hover:text-slate-600">
                          <Link2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-slate-900">
                        {ambassador.totalReferred}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(ambassador.totalEarnings)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusColor(ambassador.status)}>
                        {ambassador.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                          onClick={() => handleEditAmbassador(ambassador)}
                          title="Edit Ambassador"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          onClick={() => setShowDeleteConfirm(ambassador.id)}
                          title="Delete Ambassador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAmbassadors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No ambassadors found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterType !== "All" || filterStatus !== "All"
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first ambassador."}
              </p>
              {!searchTerm &&
                filterType === "All" &&
                filterStatus === "All" && (
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ambassador
                  </Button>
                )}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this ambassador? This action
                cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteAmbassador(showDeleteConfirm)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Ambassadors;
