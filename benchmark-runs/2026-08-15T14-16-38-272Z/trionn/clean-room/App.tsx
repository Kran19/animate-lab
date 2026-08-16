import React from 'react';
import { HeroShowcaseSection } from '../packages/01-HeroShowcaseSection/HeroShowcaseSection';
import { VideoShowreelSection } from '../packages/02-VideoShowreelSection/VideoShowreelSection';
import { FeaturedProjectsSection } from '../packages/03-FeaturedProjectsSection/FeaturedProjectsSection';
import { FeaturedProjectsSection } from '../packages/04-FeaturedProjectsSection/FeaturedProjectsSection';
import { FeaturedProjectsSection } from '../packages/05-FeaturedProjectsSection/FeaturedProjectsSection';
import { FeaturedProjectsSection } from '../packages/06-FeaturedProjectsSection/FeaturedProjectsSection';
import { Section_23 } from '../packages/07-Section_23/Section_23';
import { Interactive3DExperience } from '../packages/08-Interactive3DExperience/Interactive3DExperience';

export function CleanRoomApp() {
  return (
    <div className="clean-room-stack">
      <HeroShowcaseSection />
      <VideoShowreelSection />
      <FeaturedProjectsSection />
      <FeaturedProjectsSection />
      <FeaturedProjectsSection />
      <FeaturedProjectsSection />
      <Section_23 />
      <Interactive3DExperience />
    </div>
  );
}
