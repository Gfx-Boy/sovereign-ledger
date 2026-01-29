import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search } from 'lucide-react';

interface HeroSectionProps {
  onRecordClick: () => void;
  onSearchClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onRecordClick, onSearchClick }) => {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
          Record Lawful Notices & Private Documents with Confidence
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-slate-200 max-w-4xl mx-auto">
          Sovereign Ledger is a public notice and document recording platform built for free people, by free people.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onRecordClick}
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-semibold"
          >
            <FileText className="mr-2 h-5 w-5" />
            Record Document
          </Button>
          <Button 
            onClick={onSearchClick}
            variant="outline" 
            size="lg" 
            className="border-white text-slate-900 bg-white hover:bg-slate-100 hover:text-slate-900 px-8 py-3 text-lg font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Archive
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;