import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LearnMoreZE from "./LearnMoreZE";
import PromoCenter from "./PromoCenter";
import PromoHub from "./PromoHub";
import Articles from "./pages/Articles";
import ArticleComments from "./pages/admin/ArticleComments";
import Navbar from "./Navbar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { Gift, Users } from "lucide-react";
import { Button } from "./components";

// Admin Dashboard Components
import {
  Dashboard,
  Ambassadors,
  PromoCodes,
  CountdownBatch,
  Articles as AdminArticles,
  Programs,
  AmbassadorForm,
  PromoForm,
  PromoCodeForm,
  Settings,
} from "./components/admin";
import CountdownBatchForm from "./pages/admin/CountdownBatchForm";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine if we're on home page for floating buttons
  const isHomePage = currentPath === "/";

  return (
    <div className="relative">
      {/* Global Navbar */}
      <Navbar
        currentPage={currentPath}
        setCurrentPage={(page) => navigate(page)}
      />

      {/* Page Content with Routes */}
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LearnMoreZE />} />
          <Route path="/promo-center" element={<PromoCenter />} />
          <Route path="/promo-hub" element={<PromoHub />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<Articles />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Dashboard setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <Dashboard setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />

          {/* Ambassadors */}
          <Route
            path="/admin/ambassadors"
            element={
              <ProtectedRoute requireAdmin>
                <Ambassadors setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ambassadors/new"
            element={
              <ProtectedRoute requireAdmin>
                <AmbassadorForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="create"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ambassadors/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AmbassadorForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="edit"
                  ambassadorData={
                    localStorage.getItem("editingAmbassador")
                      ? JSON.parse(localStorage.getItem("editingAmbassador")!)
                      : null
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* Programs */}
          <Route
            path="/admin/programs"
            element={
              <ProtectedRoute requireAdmin>
                <Programs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/programs/new"
            element={
              <ProtectedRoute requireAdmin>
                <PromoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/programs/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <PromoForm />
              </ProtectedRoute>
            }
          />

          {/* Other Admin Routes */}
          <Route
            path="/admin/promos"
            element={
              <ProtectedRoute requireAdmin>
                <PromoCodes setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promos/new"
            element={
              <ProtectedRoute requireAdmin>
                <PromoCodeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promos/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <PromoCodeForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/countdown"
            element={
              <ProtectedRoute requireAdmin>
                <CountdownBatch setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/countdown/new"
            element={
              <ProtectedRoute requireAdmin>
                <CountdownBatchForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="create"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/countdown/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <CountdownBatchForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="edit"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute requireAdmin>
                <AdminArticles setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/comments"
            element={
              <ProtectedRoute requireAdmin>
                <ArticleComments setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <Settings setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Quick Access Floating Buttons (only on home page for large screens) */}
      {isHomePage && (
        <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-30 hidden lg:flex">
          <Button
            onClick={() => navigate("/promo-center")}
            variant="primary"
            size="md"
            className="rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Gift className="h-4 w-4" />
            Promo Center
          </Button>

          <Button
            onClick={() => navigate("/promo-hub")}
            variant="purple"
            size="md"
            className="rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            Promo Hub
          </Button>

          {/* Admin Access Button (for development/testing) */}
          <Button
            onClick={() => navigate("/admin")}
            variant="secondary"
            size="sm"
            className="rounded-full shadow-lg hover:scale-105 transition-all duration-200 text-xs"
          >
            Admin
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
