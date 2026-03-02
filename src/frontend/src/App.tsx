import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import AdminPanelPasswordPage from "./pages/AdminPanelPasswordPage";
import BerandaPage from "./pages/BerandaPage";
import PenerimaBantuanPage from "./pages/PenerimaBantuanPage";
import PetaPage from "./pages/PetaPage";
import PublikasiPage from "./pages/PublikasiPage";
import RekapPage from "./pages/RekapPage";
import TanggapiPage from "./pages/TanggapiPage";
import ValidasiPage from "./pages/ValidasiPage";

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Layout />
      <Toaster richColors position="top-right" />
    </>
  );
}

// Page routes
const berandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BerandaPage,
});

const petaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/peta",
  component: PetaPage,
});

const tanggapiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tanggapi",
  component: TanggapiPage,
});

const publikasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publikasi",
  component: PublikasiPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const validasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/validasi",
  component: ValidasiPage,
});

const penerimaBantuanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/penerima-bantuan",
  component: PenerimaBantuanPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-panel",
  component: AdminPanelPasswordPage,
});

const rekapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rekap",
  component: RekapPage,
});

const routeTree = rootRoute.addChildren([
  berandaRoute,
  petaRoute,
  tanggapiRoute,
  publikasiRoute,
  adminRoute,
  validasiRoute,
  penerimaBantuanRoute,
  adminPanelRoute,
  rekapRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
