import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LearnMoreZE from "./LearnMoreZE";
import PromoCenter from "./PromoCenter";
import PromoHub from "./PromoHub";
import Articles from "./pages/Articles";
import ArticleComments from "./pages/admin/ArticleComments";
import Profile from "./pages/admin/Profile";
import Users from "./pages/admin/Users";
import Navbar from "./Navbar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { Gift, Users as UsersIcon } from "lucide-react";
import { Button } from "./components";
import BridgeCardsPage from "./pages/BridgeCardsPage";

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
import Gallery from "./pages/admin/Gallery";
import HomepageVideo from "./pages/admin/HomepageVideo";
import PromoClaims from "./pages/admin/PromoClaims";
import ArticleCategories from "./pages/admin/ArticleCategories";
import BridgeCardsAdmin from "./pages/admin/BridgeCardsAdmin";
import BridgeCardForm from "./pages/admin/BridgeCardForm";
import { BridgeStudents } from "./pages/admin/BridgeStudents";
import { BridgeStudentForm } from "./pages/admin/BridgeStudentForm";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine if we're on home page for floating buttons
  const isHomePage = currentPath === "/";

  // Hide navbar on admin pages
  const isAdminPage =
    currentPath.startsWith("/admin") || currentPath === "/ze-admin-portal-2025";

  return (
    <div className="relative">
      {/* Global Navbar - Hidden on admin pages */}
      {!isAdminPage && (
        <Navbar
          currentPage={currentPath}
          setCurrentPage={(page) => navigate(page)}
        />
      )}

      {/* Page Content with Routes */}
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LearnMoreZE />} />
          <Route path="/promo-center" element={<PromoCenter />} />
          <Route path="/promo-hub" element={<PromoHub />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<Articles />} />
          <Route path="/bridge-cards" element={<BridgeCardsPage />} />

          {/* Hidden Admin Login - Only accessible via direct URL */}
          <Route path="/ze-admin-portal-2025" element={<Login />} />

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
            path="/admin/articles/categories"
            element={
              <ProtectedRoute requireAdmin>
                <ArticleCategories />
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
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requireAdmin>
                <Profile setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <Users setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute requireAdmin>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/homepage-video"
            element={
              <ProtectedRoute requireAdmin>
                <HomepageVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promo-claims"
            element={
              <ProtectedRoute requireAdmin>
                <PromoClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeCardsAdmin setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards/new"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeCardForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="create"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeCardForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="edit"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards/students"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeStudents setCurrentPage={(page) => navigate(page)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards/students/new"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeStudentForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="create"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bridge-cards/students/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <BridgeStudentForm
                  setCurrentPage={(page) => navigate(page)}
                  mode="edit"
                />
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
            <UsersIcon className="h-4 w-4" />
            Promo Hub
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
