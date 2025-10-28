import { useState, useEffect } from "react";
import { Menu, X, Home, Gift, Users, MessageCircle } from "lucide-react";
import { Button } from "./components";
import { WHATSAPP_LINKS } from "./constants/cta";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsOpen(false);
  }, [currentPage]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuItems = [
    {
      key: "/",
      label: "Home",
      icon: Home,
      description: "Halaman utama Zona English",
    },
    {
      key: "/promo-center",
      label: "Promo New Center",
      icon: Gift,
      description: "Undangan belajar gratis & promo",
    },
    {
      key: "/promo-hub",
      label: "Promo Hub",
      icon: Users,
      description: "Partnership & Ambassador",
    },
  ];

  const getMenuItemStyles = (itemKey: string) => {
    const isActive = currentPage === itemKey;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
    }`;
  };

  const getDesktopMenuStyles = (itemKey: string) => {
    const isActive = currentPage === itemKey;
    return `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
    }`;
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <span className="text-white font-bold text-lg">ZE</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900">
                  Zona English
                </h1>
                <p className="text-xs text-slate-500">Learn • Grow • Succeed</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentPage(item.key)}
                    className={getDesktopMenuStyles(item.key)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* CTA Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <Button
                href={WHATSAPP_LINKS.MAIN}
                variant="whatsapp"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <MessageCircle className="h-4 w-4" />
                Chat Admin
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? (
                  <X className="h-5 w-5 text-slate-700" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <span className="text-white font-bold text-lg">ZE</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Zona English</h2>
                <p className="text-xs text-slate-500">Navigation Menu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`w-full ${getMenuItemStyles(item.key)}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {currentPage === item.key && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-slate-200 space-y-3">
            <Button
              href={WHATSAPP_LINKS.MAIN}
              variant="whatsapp"
              size="md"
              className="w-full"
            >
              <MessageCircle className="h-5 w-5" />
              Chat Admin WhatsApp
            </Button>

            <div className="text-center">
              <div className="text-xs text-slate-500">Follow us:</div>
              <div className="text-sm font-semibold text-slate-700">
                @zonaenglish.id
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
