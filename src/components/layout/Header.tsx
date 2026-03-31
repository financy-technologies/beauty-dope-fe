import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, Menu, X, LogOut, FlaskConical, ChevronDown, GitCompareArrows, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TOOLS = [
  { name: "Dupe Finder", href: "/dupes", icon: Search, desc: "Find similar alternatives" },
  { name: "Ingredient Analyzer", href: "/ingredient-analyzer", icon: FlaskConical, desc: "Decode any ingredient list" },
  { name: "Compare Products", href: "/compare", icon: GitCompareArrows, desc: "Side-by-side comparison" },
  { name: "Ingredients Database", href: "/ingredients", icon: Search, desc: "Browse skincare ingredients" },
  { name: "Routine Builder", href: "/routine-builder", icon: Sparkles, desc: "Build AM/PM routine" },
  { name: "Skin Guide", href: "/skin-guide", icon: Sparkles, desc: "Goal-based guidance" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Skincare", href: "/browse?category=skincare" },
    { name: "Makeup", href: "/browse?category=makeup" },
    { name: "Brands", href: "/brands" },
    { name: "Trending", href: "/browse?sort=trending" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/skinevora_final.png" alt="Skinevora logo" className="h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}

          {/* Tools dropdown */}
          <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground outline-none">
                Tools
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 p-2">
              {TOOLS.map(({ name, href, icon: Icon, desc }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link to={href} className="flex items-start gap-3 px-2 py-2.5 cursor-pointer rounded-lg">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link to="/browse">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link to="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem className="text-muted-foreground text-xs">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile#rewards" className="cursor-pointer">
                    <Gift className="mr-2 h-4 w-4" />
                    Rewards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border md:hidden"
          >
            <nav className="container flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Tools section in mobile */}
              <div className="pt-2 mt-1 border-t border-border">
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Tools
                </p>
                {TOOLS.map(({ name, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                    {name}
                  </Link>
                ))}
              </div>

              <div className="flex gap-2 pt-3 mt-1 border-t border-border flex-wrap">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Link>
                </Button>
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
