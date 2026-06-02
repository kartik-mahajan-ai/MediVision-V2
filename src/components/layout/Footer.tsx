import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Disclaimer */}
        <div className="mb-10 p-4 rounded-lg bg-card border border-border">
          <MedicalDisclaimer variant="default" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">MediVision</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered diagnostic tools for healthcare professionals.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/xray-analysis" className="hover:text-foreground">X-Ray Analysis</Link></li>
              <li><Link to="/chat" className="hover:text-foreground">AI Assistant</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MediVision. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
