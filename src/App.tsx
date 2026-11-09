import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/useAuth";
import { SignInModalProvider } from "@/components/auth/SignInModal";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import DupeDetail from "./pages/DupeDetail";
import DupesFinderAdvanced from "./pages/DupesFinderAdvanced";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import IngredientAnalyzer from "./pages/IngredientAnalyzer";
import CompareProducts from "./pages/CompareProducts";
import IngredientsDatabase from "./pages/IngredientsDatabase";
import SkinQuiz from "./pages/SkinQuiz";
import SkinStory from "./pages/SkinStory";
import ProfilePage from "./pages/Profile";
import Brands from "./pages/Brands";
import RoutineBuilder from "./pages/RoutineBuilder";
import SkinGuide from "./pages/SkinGuide";
import Methodology from "./pages/Methodology";
import Disclaimer from "./pages/Disclaimer";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import GoRedirect from "./pages/GoRedirect";
import Newsletter from "./pages/Newsletter";
import SignupAttribution from "./pages/admin/SignupAttribution";
import AttributionTracker from "./components/AttributionTracker";
import HeardAboutPrompt from "./components/HeardAboutPrompt";

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
        <SignInModalProvider>
          <ScrollToTop />
          <AttributionTracker />
          <HeardAboutPrompt />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/dupe/:id" element={<DupeDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/dupes-finder" element={<Navigate to="/dupes" replace />} />
            <Route path="/dupes" element={<DupesFinderAdvanced />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/ingredient-analyzer" element={<IngredientAnalyzer />} />
            <Route path="/compare" element={<CompareProducts />} />
            <Route path="/product/compare" element={<CompareProducts />} />
            <Route path="/ingredients" element={<IngredientsDatabase />} />
            <Route path="/quiz" element={<SkinQuiz />} />
            <Route path="/skin-story" element={<SkinStory />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/routine-builder" element={<RoutineBuilder />} />
            <Route path="/skin-guide" element={<SkinGuide />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/search" element={<Browse />} />
            <Route path="/go/:slug" element={<GoRedirect />} />
            <Route path="/admin/attribution" element={<SignupAttribution />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SignInModalProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
