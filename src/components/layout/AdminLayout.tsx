import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  X,
  Home,
  Users,
  Tag,
  Clock,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Gift,
  Image as ImageIcon,
  MessageCircle,
  FolderOpen,
  BrainCircuit,
  Video,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

const AdminLayout = ({
  children,
  currentPage = "dashboard",
  setCurrentPage,
}: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use navigate if setCurrentPage is not provided
  const handleNavigation = (page: string) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    } else {
      navigate(page);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      page: "/admin",
      icon: Home,
      current:
        currentPage === "admin" ||
        currentPage === "/admin" ||
        currentPage === "/admin/dashboard",
    },
    {
      name: "Ambassadors",
      page: "/admin/ambassadors",
      icon: Users,
      current:
        currentPage === "admin-ambassadors" ||
        currentPage.startsWith("/admin/ambassadors"),
    },
    {
      name: "Programs",
      page: "/admin/programs",
      icon: Gift,
      current: currentPage.startsWith("/admin/programs"),
    },
    {
      name: "Promo Codes",
      page: "/admin/promos",
      icon: Tag,
      current:
        currentPage === "admin-promos" ||
        currentPage.startsWith("/admin/promos"),
    },
    {
      name: "Countdown Batch",
      page: "/admin/countdown",
      icon: Clock,
      current:
        currentPage === "admin-countdown" ||
        currentPage.startsWith("/admin/countdown"),
    },
    {
      name: "Articles",
      page: "/admin/articles",
      icon: FileText,
      current:
        currentPage === "admin-articles" || currentPage === "/admin/articles",
    },
    {
      name: "Article Comments",
      page: "/admin/articles/comments",
      icon: MessageCircle,
      current: currentPage.startsWith("/admin/articles/comments"),
    },
    {
      name: "Article Categories",
      page: "/admin/articles/categories",
      icon: FolderOpen,
      current: currentPage.startsWith("/admin/articles/categories"),
    },
    {
      name: "Users",
      page: "/admin/users",
      icon: Users,
      current: currentPage.startsWith("/admin/users"),
    },
    {
      name: "Bridge Cards",
      page: "/admin/bridge-cards",
      icon: BrainCircuit,
      current:
        currentPage === "/admin/bridge-cards" ||
        currentPage.startsWith("/admin/bridge-cards/new") ||
        currentPage.startsWith("/admin/bridge-cards/edit"),
    },
    {
      name: "Kelola Siswa",
      page: "/admin/bridge-cards/students",
      icon: Users,
      current: currentPage.startsWith("/admin/bridge-cards/students"),
    },
    {
      name: "Galeri Kegiatan",
      page: "/admin/gallery",
      icon: ImageIcon,
      current: currentPage.startsWith("/admin/gallery"),
    },
    {
      name: "Homepage Video",
      page: "/admin/homepage-video",
      icon: Video,
      current: currentPage.startsWith("/admin/homepage-video"),
    },
    {
      name: "Promo Claims",
      page: "/admin/promo-claims",
      icon: FileText,
      current: currentPage.startsWith("/admin/promo-claims"),
    },
    {
      name: "Settings",
      page: "/admin/settings",
      icon: Settings,
      current:
        currentPage === "admin-settings" ||
        currentPage.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ZE</span>
            </div>
            <span className="font-semibold text-slate-900">
              Zona English Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.page)}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                ${
                  item.current
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "AD"}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-slate-900">
                  {user?.name || "Admin User"}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.email || "admin@zonaenglish.com"}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                <button
                  onClick={() => {
                    handleNavigation("/admin/profile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/ze-admin-portal-2025");
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-slate-900 capitalize">
                {currentPage.replace("-", " ")}
              </h1>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
