import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleKnowledgeBaseClick = () => {
    navigate('/knowledge-base');
  };

  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Sovereign Ledger</h3>
              <p className="text-slate-300 text-sm">
                A public notice and document recording platform built for free people, by free people.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Email: support@asnconsulting.co</p>
                <button 
                  onClick={handleKnowledgeBaseClick}
                  className="block hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Knowledge Base / FAQ
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Disclaimer</p>
              </div>
            </div>
          </div>
          
          <Separator className="bg-slate-600 mb-8" />
          
          <div className="text-center space-y-4">
            <p className="text-slate-300 text-sm">
              © {new Date().getFullYear()} Sovereign Ledger. All rights reserved.
            </p>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-300 text-xs font-semibold mb-2">IMPORTANT DISCLAIMER</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sovereign Ledger is not a statutory recordkeeping service and does not operate under any government jurisdiction. 
                This platform is provided for informational and recordkeeping purposes only. Users are responsible for ensuring 
                compliance with applicable laws in their jurisdiction. This service does not constitute legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;