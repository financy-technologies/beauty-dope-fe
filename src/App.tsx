import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/useAuth";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import DupeDetail from "./pages/DupeDetail";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import IngredientAnalyzer from "./pages/IngredientAnalyzer";
import CompareProducts from "./pages/CompareProducts";
import IngredientsDatabase from "./pages/IngredientsDatabase";
import SkinQuiz from "./pages/SkinQuiz";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/dupe/:id" element={<DupeDetail />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/ingredient-analyzer" element={<IngredientAnalyzer />} />
            <Route path="/compare" element={<CompareProducts />} />
            <Route path="/ingredients" element={<IngredientsDatabase />} />
            <Route path="/quiz" element={<SkinQuiz />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
