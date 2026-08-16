import React from 'react';
import { HeroSection } from '../reproduction/01-HeroSection/HeroSection';
import { InfiniteMarqueeSection } from '../reproduction/02-InfiniteMarqueeSection/InfiniteMarqueeSection';
import { AboutAgencySection } from '../reproduction/03-AboutAgencySection/AboutAgencySection';
import { FeaturedProjectsGrid } from '../reproduction/04-FeaturedProjectsGrid/FeaturedProjectsGrid';
import { Interactive3DExperience } from '../reproduction/05-Interactive3DExperience/Interactive3DExperience';
import { VideoShowreelSection } from '../reproduction/06-VideoShowreelSection/VideoShowreelSection';
import { InteractiveGallerySection } from '../reproduction/07-InteractiveGallerySection/InteractiveGallerySection';
import { TestimonialsSection } from '../reproduction/08-TestimonialsSection/TestimonialsSection';
import { CallToActionSection } from '../reproduction/09-CallToActionSection/CallToActionSection';
import { FooterSection } from '../reproduction/10-FooterSection/FooterSection';

export function CleanRoomConsumerApp() {
  return (
    <main className="clean-room-app">
      <HeroSection />
      <InfiniteMarqueeSection />
      <AboutAgencySection />
      <FeaturedProjectsGrid />
      <Interactive3DExperience />
      <VideoShowreelSection />
      <InteractiveGallerySection />
      <TestimonialsSection />
      <CallToActionSection />
      <FooterSection />
    </main>
  );
}
