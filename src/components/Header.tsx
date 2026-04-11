import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Languages } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
            <Languages className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
            SignBridge
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/translate" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Live Translation
          </Link>
          <Link to="/integrations" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Integrations
          </Link>
          <Link to="/accessibility" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Accessibility
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="hero" size="sm" className="hidden md:inline-flex">
            <Link to="/translate">Start Translating</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
