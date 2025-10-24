import { useState } from "react";
import LearnMoreZE from "./LearnMoreZE";
import PromoCenter from "./PromoCenter";
import PromoHub from "./PromoHub";
import Navbar from "./Navbar";
import { Gift, Users } from "lucide-react";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "promo-new-center":
        return <PromoCenter />;
      case "promo-hub":
        return <PromoHub />;
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
          <button
            onClick={() => setCurrentPage("promo-new-center")}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold hover:scale-105"
          >
            <Gift className="h-4 w-4" />
            Promo Center
          </button>

          <button
            onClick={() => setCurrentPage("promo-hub")}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-white shadow-lg hover:bg-purple-700 transition-all duration-200 text-sm font-semibold hover:scale-105"
          >
            <Users className="h-4 w-4" />
            Promo Hub
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
