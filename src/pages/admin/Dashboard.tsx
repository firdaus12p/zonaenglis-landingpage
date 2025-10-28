import React from "react";
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

const Dashboard: React.FC<{ setCurrentPage: (page: string) => void }> = ({
  setCurrentPage,
}) => {
  // Mock data - akan diganti dengan data real dari API
  const stats = [
    {
      name: "Total Ambassadors",
      value: "24",
      change: "+2 this month",
      changeType: "increase" as const,
      icon: Users,
      color: "blue",
    },
    {
      name: "Active Promo Codes",
      value: "8",
      change: "3 expiring soon",
      changeType: "neutral" as const,
      icon: Tag,
      color: "emerald",
    },
    {
      name: "Current Batch",
      value: "Batch A",
      change: "3 days remaining",
      changeType: "decrease" as const,
      icon: Clock,
      color: "amber",
    },
    {
      name: "Published Articles",
      value: "12",
      change: "+3 this week",
      changeType: "increase" as const,
      icon: FileText,
      color: "purple",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "ambassador",
      message: 'New ambassador "Sari Dewi" registered from Makassar',
      time: "2 hours ago",
      icon: Users,
    },
    {
      id: 2,
      type: "promo",
      message: 'Promo code "EARLY50" was used 15 times today',
      time: "4 hours ago",
      icon: Tag,
    },
    {
      id: 3,
      type: "article",
      message: 'Article "Tips Belajar Grammar" was published',
      time: "1 day ago",
      icon: FileText,
    },
    {
      id: 4,
      type: "batch",
      message: "Countdown for Batch A updated to 03 Nov 2025",
      time: "2 days ago",
      icon: Clock,
    },
  ];

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
          {stats.map((stat) => (
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
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
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
                ))}
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
                  Rp 45.2M
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  +12% from last month
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
                <p className="text-2xl font-bold text-slate-900 mt-1">1,247</p>
                <p className="text-sm text-blue-600 mt-1">+8% this week</p>
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
                <p className="text-2xl font-bold text-slate-900 mt-1">94.5%</p>
                <p className="text-sm text-purple-600 mt-1">
                  +2.1% improvement
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
