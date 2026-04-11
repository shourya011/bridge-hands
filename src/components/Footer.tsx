import { Link } from "react-router-dom";
import { Github, Heart, Languages } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg bg-gradient-hero bg-clip-text text-transparent">
                SignBridge
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Breaking the silence with technology. Inclusive communication for everyone.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/translate" className="hover:text-primary transition-colors">Live Translation</Link></li>
              <li><Link to="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><a href="https://github.com/SiddharthaChakrabarty/Sign-Language-Translation-Across-Multiple-Languages" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><Link to="/about#faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://github.com/SiddharthaChakrabarty/Sign-Language-Translation-Across-Multiple-Languages" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li><Link to="/about#contribute" className="hover:text-primary transition-colors">Contribute</Link></li>
              <li><Link to="/about#support" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 SignBridge. Built with accessibility in mind.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive" /> for inclusive communication
          </p>
        </div>
      </div>
    </footer>
  );
};
