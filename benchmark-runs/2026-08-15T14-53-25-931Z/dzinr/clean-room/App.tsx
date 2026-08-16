import React from 'react';
import { Section_3 } from '../packages/01-Section_3/Section_3';
import { Section_4 } from '../packages/02-Section_4/Section_4';
import { Section_6 } from '../packages/03-Section_6/Section_6';
import { Section_7 } from '../packages/04-Section_7/Section_7';
import { StudioFooterSection } from '../packages/05-StudioFooterSection/StudioFooterSection';

export function CleanRoomApp() {
  return (
    <div className="clean-room-stack">
      <Section_3 />
      <Section_4 />
      <Section_6 />
      <Section_7 />
      <StudioFooterSection />
    </div>
  );
}
