import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FinalCta, FeaturesSection, LandingFooter, StepsSection, StoriesSection } from '@/components/landing/LandingSections';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';

export default function LandingPage() {
  const { startDemo } = useAuth();
  const navigate = useNavigate();

  const exploreDemo = () => {
    startDemo();
    navigate('/app/dashboard');
  };

  return (
    <div className="page-shell-landing page-landing relative min-h-screen overflow-x-hidden" data-page="landing">
      <LandingHeader onExploreDemo={exploreDemo} />
      <LandingHero onExploreDemo={exploreDemo} />
      <FeaturesSection />
      <StepsSection />
      <StoriesSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
