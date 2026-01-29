import React from 'react';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import HowItWorksSection from './HowItWorksSection';
import SearchArchiveSection from './SearchArchiveSection';
import WhyItMattersSection from './WhyItMattersSection';

interface HomepageProps {
  onRecordClick: () => void;
  onSearchClick: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onRecordClick, onSearchClick }) => {
  // Handle search click - allow search for all users
  const handleSearchClick = () => {
    onSearchClick();
  };

  return (
    <div className="min-h-screen">
      <HeroSection onRecordClick={onRecordClick} onSearchClick={handleSearchClick} />
      <AboutSection />
      <HowItWorksSection />
      <SearchArchiveSection />
      <WhyItMattersSection />
    </div>
  );
};

export default Homepage;