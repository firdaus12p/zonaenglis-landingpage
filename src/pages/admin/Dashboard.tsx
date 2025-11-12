import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card } from "../../components";
import {
  Users,
  Tag,
  Clock,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
} from "lucide-react";
import { API_BASE } from "../../config/api";

const Dashboard = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<
    Array<{
      name: string;
      value: string;
      change: string;
      changeType: "increase" | "decrease" | "neutral";
      icon: any;
      color: string;
    }>
  >([
    {
      name: "Total Ambassadors",
      value: "0",
      change: "Loading...",
      changeType: "neutral",
      icon: Users,
      color: "blue",
    },
    {
      name: "Active Promo Codes",
      value: "0",
      change: "Loading...",
      changeType: "neutral",
      icon: Tag,
      color: "emerald",
    },
    {
      name: "Current Batch",
      value: "-",
      change: "Loading...",
      changeType: "neutral",
      icon: Clock,
      color: "amber",
    },
    {
      name: "Published Articles",
      value: "0",
      change: "Loading...",
      changeType: "neutral",
      icon: FileText,
      color: "purple",
    },
  ]);

  // Additional stats for revenue, students, completion
  const [totalRevenue, setTotalRevenue] = useState("0");
  const [activeStudents, setActiveStudents] = useState("0");
  const [completionRate, setCompletionRate] = useState("0");

  // Recent activities from database
  const [recentActivities, setRecentActivities] = useState<
    Array<{
      id: number;
      type: string;
      message: string;
      time: string;
      icon: any;
    }>
  >([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAdditionalStats();
    fetchRecentActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [ambassadorsRes, promosRes, countdownRes, articlesRes] =
        await Promise.all([
          fetch(`${API_BASE}/ambassadors`),
          fetch(`${API_BASE}/promos`),
          fetch(`${API_BASE}/countdown/active`),
          fetch(`${API_BASE}/articles/admin/all`),
        ]);

      const ambassadors = await ambassadorsRes.json();
      const promos = await promosRes.json();
      const countdown = await countdownRes.json();
      const articlesData = await articlesRes.json();

      // Count ambassadors (active only)
      const ambassadorCount = Array.isArray(ambassadors)
        ? ambassadors.length
        : 0;

      // Count active promo codes
      const promoCount = Array.isArray(promos) ? promos.length : 0;

      // Get current batch name
      const currentBatchName =
        countdown.success && countdown.data
          ? countdown.data.name
          : "No active batch";

      // Count published articles
      const publishedArticles =
        articlesData.success && Array.isArray(articlesData.data)
          ? articlesData.data.filter(
              (article: any) => article.status === "Published"
            ).length
          : 0;

      // Update stats with real data
      setStats([
        {
          name: "Total Ambassadors",
          value: ambassadorCount.toString(),
          change: `${ambassadorCount} active`,
          changeType: "neutral",
          icon: Users,
          color: "blue",
        },
        {
          name: "Active Promo Codes",
          value: promoCount.toString(),
          change: `${promoCount} currently active`,
          changeType: "neutral",
          icon: Tag,
          color: "emerald",
        },
        {
          name: "Current Batch",
          value: currentBatchName,
          change:
            countdown.success && countdown.data ? "Active now" : "Not set",
          changeType:
            countdown.success && countdown.data ? "increase" : "neutral",
          icon: Clock,
          color: "amber",
        },
        {
          name: "Published Articles",
          value: publishedArticles.toString(),
          change: `${publishedArticles} published`,
          changeType: "neutral",
          icon: FileText,
          color: "purple",
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  const fetchAdditionalStats = async () => {
    try {
      // Fetch countdown stats for active students
      const countdownStatsRes = await fetch(`${API_BASE}/countdown/stats`);
      const countdownStats = await countdownStatsRes.json();

      if (countdownStats.success && countdownStats.data) {
        const students = countdownStats.data.total_students || 0;
        setActiveStudents(students.toString());
      }

      // Calculate total revenue from ambassadors
      const ambassadorsRes = await fetch(`${API_BASE}/ambassadors`);
      const ambassadors = await ambassadorsRes.json();

      if (Array.isArray(ambassadors)) {
        const revenue = ambassadors.reduce((sum: number, amb: any) => {
          return sum + (parseFloat(amb.total_earnings) || 0);
        }, 0);

        // Format as Indonesian Rupiah
        const revenueInMillions = (revenue / 1000000).toFixed(1);
        setTotalRevenue(`Rp ${revenueInMillions}M`);
      }

      // Fetch completion rate from affiliate stats
      const affiliateStatsRes = await fetch(
        `${API_BASE}/affiliate/stats/all`
      ).catch(() => null);

      if (affiliateStatsRes && affiliateStatsRes.ok) {
        const affiliateStats = await affiliateStatsRes.json();

        if (affiliateStats.success && affiliateStats.stats) {
          const total = affiliateStats.stats.total_uses || 0;
          const converted = affiliateStats.stats.conversions || 0;

          if (total > 0) {
            const rate = ((converted / total) * 100).toFixed(1);
            setCompletionRate(`${rate}%`);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching additional stats:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities = [];

      // Get recent ambassadors (limit 1)
      const ambassadorsRes = await fetch(`${API_BASE}/ambassadors`);
      const ambassadors = await ambassadorsRes.json();

      if (Array.isArray(ambassadors) && ambassadors.length > 0) {
        const latest = ambassadors[0];
        activities.push({
          id: 1,
          type: "ambassador",
          message: `New ambassador "${latest.name}" from ${latest.location}`,
          time: getTimeAgo(latest.created_at),
          icon: Users,
        });
      }

      // Get recent articles
      const articlesRes = await fetch(`${API_BASE}/articles/admin/all`);
      const articlesData = await articlesRes.json();

      if (articlesData.success && Array.isArray(articlesData.data)) {
        const publishedArticles = articlesData.data
          .filter((a: any) => a.status === "Published")
          .sort(
            (a: any, b: any) =>
              new Date(b.published_at || b.created_at).getTime() -
              new Date(a.published_at || a.created_at).getTime()
          );

        if (publishedArticles.length > 0) {
          const latest = publishedArticles[0];
          activities.push({
            id: 2,
            type: "article",
            message: `Article "${latest.title}" was published`,
            time: getTimeAgo(latest.published_at || latest.created_at),
            icon: FileText,
          });
        }
      }

      // Get recent countdown batch
      const countdownRes = await fetch(`${API_BASE}/countdown/active`);
      const countdown = await countdownRes.json();

      if (countdown.success && countdown.data) {
        activities.push({
          id: 3,
          type: "batch",
          message: `Countdown batch "${countdown.data.name}" is active`,
          time: getTimeAgo(
            countdown.data.updated_at || countdown.data.created_at
          ),
          icon: Clock,
        });
      }

      // Get recent promo codes (limit 1)
      const promosRes = await fetch(`${API_BASE}/promos/admin/all`);
      const promos = await promosRes.json();

      if (Array.isArray(promos) && promos.length > 0) {
        const latest = promos[0];
        activities.push({
          id: 4,
          type: "promo",
          message: `Promo code "${latest.code}" was created`,
          time: getTimeAgo(latest.created_at),
          icon: Tag,
        });
      }

      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Set fallback activities
      setRecentActivities([
        {
          id: 1,
          type: "info",
          message: "Dashboard loaded successfully",
          time: "just now",
          icon: Activity,
        },
      ]);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "recently";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const quickActions = [
    {
      name: "Add Ambassador",
      description: "Register new ambassador with affiliate code",
      href: "/admin/ambassadors/new",
      icon: Users,
      color: "blue",
    },
    {
      name: "Add Program",
      description: "Create new program/promo for PromoHub",
      href: "/admin/programs/new",
      icon: Calendar,
      color: "indigo",
    },
    {
      name: "Create Promo",
      description: "Generate new discount promo code",
      href: "/admin/promos/new",
      icon: Tag,
      color: "emerald",
    },
    {
      name: "Update Countdown",
      description: "Manage batch countdown timer",
      href: "/admin/countdown",
      icon: Clock,
      color: "amber",
    },
    {
      name: "Write Article",
      description: "Create new educational content",
      href: "/admin/articles/new",
      icon: FileText,
      color: "purple",
    },
  ];

  return (
    <AdminLayout currentPage="admin" setCurrentPage={setCurrentPage}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
              <p className="text-blue-100">
                Here's what's happening with Zona English today.
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  </div>
                </Card>
              ))
            : stats.map((stat) => (
                <Card key={stat.name} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {stat.value}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          stat.changeType === "increase"
                            ? "text-emerald-600"
                            : stat.changeType === "decrease"
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl ${
                        stat.color === "blue"
                          ? "bg-blue-100"
                          : stat.color === "emerald"
                          ? "bg-emerald-100"
                          : stat.color === "amber"
                          ? "bg-amber-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <stat.icon
                        className={`h-6 w-6 ${
                          stat.color === "blue"
                            ? "text-blue-600"
                            : stat.color === "emerald"
                            ? "text-emerald-600"
                            : stat.color === "amber"
                            ? "text-amber-600"
                            : "text-purple-600"
                        }`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.href}
                    className="group p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          action.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : action.color === "emerald"
                            ? "bg-emerald-100 text-emerald-600"
                            : action.color === "amber"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {action.name}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton for activities
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 animate-pulse"
                    >
                      <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <activity.icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent activities
                  </p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <a
                  href="/admin/activity"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? (
                    <span className="inline-block h-8 w-24 bg-slate-200 rounded animate-pulse"></span>
                  ) : (
                    totalRevenue
                  )}
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  From ambassador earnings
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Students
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? (
                    <span className="inline-block h-8 w-20 bg-slate-200 rounded animate-pulse"></span>
                  ) : (
                    activeStudents
                  )}
                </p>
                <p className="text-sm text-blue-600 mt-1">Currently enrolled</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? (
                    <span className="inline-block h-8 w-16 bg-slate-200 rounded animate-pulse"></span>
                  ) : (
                    completionRate
                  )}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Lead conversion rate
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
