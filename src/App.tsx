import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StylesPage from "./pages/StylesPage";
import GalleryPage from "./pages/GalleryPage";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import CreatePage from "./pages/CreatePage";
import ProductPage from "./pages/ProductPage";
import AdminOrders from "./pages/AdminOrders";
import NotFound from "./pages/NotFound";
import SickThreadsPage from "./pages/SickThreadsPage";
import ThreadsProductPage from "./pages/ThreadsProductPage";
import SickRidesPage from "./pages/SickRidesPage";
import RidesProductPage from "./pages/RidesProductPage";
import SplashScreen from "./components/SplashScreen";
import ShutterTransition from "./components/ShutterTransition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SplashScreen />
        <ShutterTransition />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/styles" element={<StylesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/sick-threads" element={<SickThreadsPage />} />
          <Route path="/sick-threads/:slug" element={<ThreadsProductPage />} />
          <Route path="/sick-rides" element={<SickRidesPage />} />
          <Route path="/sick-rides/:slug" element={<RidesProductPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
