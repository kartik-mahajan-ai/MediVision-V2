import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The landing page has a dark video at the top, so we need a transparent
  // navbar with white text when unscrolled. Other pages have standard backgrounds.
  const isLandingPage = location.pathname === '/';
  const isTransparent = isLandingPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 pointer-events-none px-4">
      <div className="container mx-auto max-w-6xl">
        <div className={cn(
          "pointer-events-auto flex h-16 items-center justify-between px-6 md:px-8 rounded-full transition-all duration-300 shadow-xl border",
          !isTransparent
            ? "bg-background/80 backdrop-blur-md border-border/50" 
            : "bg-white/10 backdrop-blur-sm border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="MediVision" className="h-9 w-9" />
            <span className={cn(
              "font-bold text-xl transition-colors",
              !isTransparent ? "text-foreground" : "text-white"
            )}>
              MediVision
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={cn(
              "text-sm font-medium transition-colors",
              !isTransparent ? "text-foreground hover:text-primary" : "text-white/90 hover:text-white"
            )}>
              Home
            </Link>
            <Link to="/features" className={cn(
              "text-sm font-medium transition-colors",
              !isTransparent ? "text-foreground/80 hover:text-foreground" : "text-white/70 hover:text-white"
            )}>
              Features
            </Link>
            <Link to="/about" className={cn(
              "text-sm font-medium transition-colors",
              !isTransparent ? "text-foreground/80 hover:text-foreground" : "text-white/70 hover:text-white"
            )}>
              About
            </Link>
          </div>


          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle className={cn(!isTransparent ? "" : "text-white hover:bg-white/10 hover:text-white")} />
            {user ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className={cn(!isTransparent ? "" : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white")} asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("rounded-full", !isTransparent ? "" : "hover:bg-white/10")}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs border shadow-sm">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" className={cn(!isTransparent ? "" : "text-white hover:bg-white/10 hover:text-white")} asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className={cn(!isTransparent ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white text-black hover:bg-white/90")} asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              className={cn("p-2 transition-colors", !isTransparent ? "text-foreground" : "text-white")}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/features" className="block py-2 text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link to="/about" className="block py-2 text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
