import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, Shield } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-8 text-center">
            What is Sovereign Ledger?
          </h2>
          <div className="text-lg text-slate-700 space-y-6 mb-12">
            <p>
              Sovereign Ledger is a private, neutral recordkeeping system where individuals can publish lawful declarations, affidavits, contracts, and notices—outside of statutory jurisdictions.
            </p>
            <p>
              Each document is timestamped, assigned a unique record number, and stored in the public archive for transparency and evidence of constructive notice.
            </p>
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Use it to:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Record affidavits, trusts, declarations, and revocations</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Give lawful notice to agencies, entities, or individuals</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Maintain historical evidence of your claims, standing, or actions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;