import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import LibraryPage from './pages/LibraryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PricingPage from './pages/PricingPage';
import MyLibraryPage from './pages/MyLibraryPage';
import AdminRouteGuard from './components/admin/AdminRouteGuard';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LibraryPage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const myLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-library',
  component: MyLibraryPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, pricingRoute, myLibraryRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
