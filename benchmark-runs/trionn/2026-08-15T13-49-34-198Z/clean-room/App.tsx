import React from 'react';
import { HeroShowcaseSection } from '../packages/01-HeroShowcaseSection/HeroShowcaseSection';
import { VideoShowreelSection } from '../packages/02-VideoShowreelSection/VideoShowreelSection';
import { VideoShowreelSection } from '../packages/03-VideoShowreelSection/VideoShowreelSection';
import { Section_24 } from '../packages/04-Section_24/Section_24';
import { Interactive3DExperience } from '../packages/05-Interactive3DExperience/Interactive3DExperience';
import { Interactive3DExperience } from '../packages/06-Interactive3DExperience/Interactive3DExperience';

export function CleanRoomApp() {
  return (
    <div className="clean-room-container">
      <HeroShowcaseSection />
      <VideoShowreelSection />
      <VideoShowreelSection />
      <Section_24 />
      <Interactive3DExperience />
      <Interactive3DExperience />
    </div>
  );
}
