import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import AdminPage from "./pages/AdminPage";
import BerandaPage from "./pages/BerandaPage";
import PetaPage from "./pages/PetaPage";
import PublikasiPage from "./pages/PublikasiPage";
import TanggapiPage from "./pages/TanggapiPage";

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

const routeTree = rootRoute.addChildren([
  berandaRoute,
  petaRoute,
  tanggapiRoute,
  publikasiRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function DataInitializer() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || initialized.current) return;
    initialized.current = true;

    actor
      .initializeSampleData()
      .then(() => {
        queryClient.invalidateQueries();
      })
      .catch(console.error);
  }, [actor, isFetching, queryClient]);

  return null;
}

export default function App() {
  return (
    <>
      <DataInitializer />
      <RouterProvider router={router} />
    </>
  );
}
