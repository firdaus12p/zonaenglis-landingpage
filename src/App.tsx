import { useState } from "react";
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
} from "./components/admin";
import AmbassadorForm from "./pages/admin/AmbassadorForm";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "promo-new-center":
        return <PromoCenter />;
      case "promo-hub":
        return <PromoHub />;

      // Admin Dashboard Routes
      case "admin":
      case "admin-dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "admin-ambassadors":
        return <Ambassadors setCurrentPage={setCurrentPage} />;
      case "admin-ambassador-form-create":
        return <AmbassadorForm setCurrentPage={setCurrentPage} mode="create" />;
      case "admin-ambassador-form-edit":
        const editingAmbassador = localStorage.getItem("editingAmbassador");
        console.log("Edit mode - stored ambassador data:", editingAmbassador);
        return (
          <AmbassadorForm
            setCurrentPage={setCurrentPage}
            mode="edit"
            ambassadorData={
              editingAmbassador ? JSON.parse(editingAmbassador) : null
            }
          />
        );
      case "admin-promos":
        return <PromoCodes setCurrentPage={setCurrentPage} />;
      case "admin-countdown":
        return <CountdownBatch setCurrentPage={setCurrentPage} />;
      case "admin-articles":
        return <Articles setCurrentPage={setCurrentPage} />;
      case "admin-settings":
        return <Dashboard setCurrentPage={setCurrentPage} />; // Temporary, use Dashboard for settings

      default:
        return <LearnMoreZE />;
    }
  };

  return (
    <div className="relative">
      {/* Global Navbar */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Page Content */}
      <div>{renderCurrentPage()}</div>

      {/* Quick Access Floating Buttons (only on home page for large screens) */}
      {currentPage === "home" && (
        <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-30 hidden lg:flex">
          <Button
            onClick={() => setCurrentPage("promo-new-center")}
            variant="primary"
            size="md"
            className="rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Gift className="h-4 w-4" />
            Promo Center
          </Button>

          <Button
            onClick={() => setCurrentPage("promo-hub")}
            variant="purple"
            size="md"
            className="rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            Promo Hub
          </Button>

          {/* Admin Access Button (for development/testing) */}
          <Button
            onClick={() => setCurrentPage("admin")}
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
