import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  HandHeart,
  Home,
  KeyRound,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Shield,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetFooterLinks,
  useIsCallerAdmin,
  useIsCallerAdminOrValidator,
  useIsCallerValidator,
} from "../hooks/useQueries";

const navItems = [
  { label: "Beranda", path: "/", icon: Home },
  { label: "Peta", path: "/peta", icon: MapPin },
  { label: "Tanggapi", path: "/tanggapi", icon: MessageSquare },
  { label: "Publikasi", path: "/publikasi", icon: BookOpen },
  { label: "Penerima Bantuan", path: "/penerima-bantuan", icon: HandHeart },
  { label: "Rekap", path: "/rekap", icon: BarChart3 },
];

export default function Layout() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isAdminOrValidator } = useIsCallerAdminOrValidator();
  const { data: isValidator } = useIsCallerValidator();
  const { data: footerLinks } = useGetFooterLinks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const isLoggingIn = loginStatus === "logging-in";

  const sortedFooterLinks = footerLinks
    ? [...footerLinks].sort((a, b) => Number(a.order) - Number(b.order))
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-navy sticky top-0 z-50 shadow-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white p-0.5">
                <img
                  src="/assets/uploads/v-AbSTb_400x400-1--1.jpg"
                  alt="Relawan TIK Indonesia Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-white font-bold text-lg leading-none tracking-tight">
                  RELAWAN TIK INDONESIA
                </span>
                <span className="text-white/60 text-[10px] leading-none tracking-wider uppercase">
                  SISTEM INFORMASI RTIK INDONESIA PEDULI
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.path === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {isAdminOrValidator && (
                <Link
                  to="/validasi"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentPath.startsWith("/validasi")
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Validasi Data
                </Link>
              )}

              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentPath === "/admin"
                    ? "bg-gold/30 text-gold"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>

              <Link
                to="/admin-panel"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentPath.startsWith("/admin-panel")
                    ? "bg-amber-500/30 text-amber-300"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Admin Panel
              </Link>
            </nav>

            {/* Auth + Mobile Toggle */}
            <div className="flex items-center gap-2">
              {identity ? (
                <div className="hidden md:flex items-center gap-2">
                  {isAdmin && (
                    <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                      ADMIN
                    </Badge>
                  )}
                  {!isAdmin && isValidator && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                      VALIDATOR
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-white/75 hover:text-white hover:bg-white/10 gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="hidden md:flex text-white/75 hover:text-white hover:bg-white/10 gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? "Masuk..." : "Masuk"}
                </Button>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white/75 hover:text-white p-2 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}

                {isAdminOrValidator && (
                  <Link
                    to="/validasi"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      currentPath.startsWith("/validasi")
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Validasi Data
                    {isValidator && !isAdmin && (
                      <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
                        VALIDATOR
                      </span>
                    )}
                  </Link>
                )}

                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                    currentPath === "/admin"
                      ? "bg-white/20 text-white"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>

                <Link
                  to="/admin-panel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                    currentPath.startsWith("/admin-panel")
                      ? "bg-amber-500/30 text-amber-300"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  Admin Panel
                </Link>

                <div className="border-t border-white/10 pt-2 mt-1">
                  {identity ? (
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        login();
                        setMobileMenuOpen(false);
                      }}
                      disabled={isLoggingIn}
                      className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 rounded-md"
                    >
                      <LogIn className="w-4 h-4" />
                      {isLoggingIn ? "Masuk..." : "Masuk"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white p-0.5 flex-shrink-0">
                  <img
                    src="/assets/uploads/v-AbSTb_400x400-1--1.jpg"
                    alt="Relawan TIK Indonesia"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-lg leading-none">
                    RELAWAN TIK INDONESIA
                  </p>
                  <p className="text-white/50 text-xs">
                    SISTEM INFORMASI RTIK INDONESIA PEDULI
                  </p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Sistem Informasi RTIK Indonesia Peduli untuk data penerima
                bantuan bencana. Transparansi dan akuntabilitas dalam
                pengelolaan bantuan bencana.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white/90 mb-3 text-sm">
                Navigasi
              </h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white/90 mb-3 text-sm">
                Informasi
              </h4>
              <ul className="space-y-1.5 text-sm text-white/60">
                {sortedFooterLinks.length > 0 ? (
                  sortedFooterLinks.map((link) => (
                    <li key={String(link.id)}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {link.linkLabel}
                      </a>
                    </li>
                  ))
                ) : (
                  <>
                    <li>Pemerintah Provinsi Aceh</li>
                    <li>Badan Penanggulangan Bencana Daerah</li>
                    <li>Banda Aceh, Aceh, Indonesia</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Relawan TIK Indonesia. Hak Cipta
              Dilindungi.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
