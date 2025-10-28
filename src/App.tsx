import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LearnMoreZE from "./LearnMoreZE";
import PromoCenter from "./PromoCenter";
import PromoHub from "./PromoHub";
import Navbar from "./Navbar";
import { Gift, Users } from "lucide-react";
import { Button } from "./components";

// Admin Dashboard Components
import {
  Dashboard,
  Ambassadors,
  PromoCodes,
  CountdownBatch,
  Articles,
  Programs,
  AmbassadorForm,
  PromoForm,
} from "./components/admin";

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

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<Dashboard setCurrentPage={(page) => navigate(page)} />}
          />
          <Route
            path="/admin/dashboard"
            element={<Dashboard setCurrentPage={(page) => navigate(page)} />}
          />

          {/* Ambassadors */}
          <Route
            path="/admin/ambassadors"
            element={<Ambassadors setCurrentPage={(page) => navigate(page)} />}
          />
          <Route
            path="/admin/ambassadors/new"
            element={
              <AmbassadorForm
                setCurrentPage={(page) => navigate(page)}
                mode="create"
              />
            }
          />
          <Route
            path="/admin/ambassadors/edit/:id"
            element={
              <AmbassadorForm
                setCurrentPage={(page) => navigate(page)}
                mode="edit"
                ambassadorData={
                  localStorage.getItem("editingAmbassador")
                    ? JSON.parse(localStorage.getItem("editingAmbassador")!)
                    : null
                }
              />
            }
          />

          {/* Programs */}
          <Route path="/admin/programs" element={<Programs />} />
          <Route path="/admin/programs/new" element={<PromoForm />} />
          <Route path="/admin/programs/edit/:id" element={<PromoForm />} />

          {/* Other Admin Routes */}
          <Route
            path="/admin/promos"
            element={<PromoCodes setCurrentPage={(page) => navigate(page)} />}
          />
          <Route
            path="/admin/countdown"
            element={
              <CountdownBatch setCurrentPage={(page) => navigate(page)} />
            }
          />
          <Route
            path="/admin/articles"
            element={<Articles setCurrentPage={(page) => navigate(page)} />}
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
