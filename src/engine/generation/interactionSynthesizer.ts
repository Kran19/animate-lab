import { FIRInteractionEvidence } from '../domain/fir/sectionFIR';

export interface InteractionSynthesisResult {
  hasInteractionCode: boolean;
  hookCode: string;
  injectedEventAttributes: Record<string, string>;
  diagnostics: string[];
}

export class InteractionSynthesizer {
  /**
   * Synthesizes idiomatic React state and event handling from FIR interaction evidence.
   * Crucial principle: "Recover observable behavior and state deltas, not original source closures."
   */
  public static synthesize(interactions: FIRInteractionEvidence[]): InteractionSynthesisResult {
    const diagnostics: string[] = [];

    if (!interactions || interactions.length === 0) {
      return {
        hasInteractionCode: false,
        hookCode: '',
        injectedEventAttributes: {},
        diagnostics,
      };
    }

    let hookCode = '  // Synthesized Interaction State via AnimateLab Behavioral Reconstructor\n';
    const injectedEventAttributes: Record<string, string> = {};

    interactions.forEach((inter, idx) => {
      const trigger = inter.triggerType;

      if (trigger === 'pointermove' || trigger === 'hover') {
        // Pointer spring physics / magnetic hover model
        hookCode += `  const [pointerOffset_${idx}, setPointerOffset_${idx}] = React.useState({ x: 0, y: 0 });\n`;
        hookCode += `  const handlePointerMove_${idx} = (e: React.PointerEvent<HTMLElement>) => {\n`;
        hookCode += `    const rect = e.currentTarget.getBoundingClientRect();\n`;
        hookCode += `    const relX = (e.clientX - (rect.left + rect.width / 2)) * 0.35;\n`;
        hookCode += `    const relY = (e.clientY - (rect.top + rect.height / 2)) * 0.35;\n`;
        hookCode += `    setPointerOffset_${idx}({ x: Math.round(relX), y: Math.round(relY) });\n`;
        hookCode += `  };\n`;
        hookCode += `  const handlePointerLeave_${idx} = () => {\n`;
        hookCode += `    setPointerOffset_${idx}({ x: 0, y: 0 });\n`;
        hookCode += `  };\n\n`;

        injectedEventAttributes[inter.targetSelector] = `onPointerMove={handlePointerMove_${idx}} onPointerLeave={handlePointerLeave_${idx}} style={{ transform: \`translate3d(\${pointerOffset_${idx}.x}px, \${pointerOffset_${idx}.y}px, 0)\`, transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}`;
      } else if (trigger === 'click') {
        // Click toggle / accordion state model
        hookCode += `  const [isActive_${idx}, setIsActive_${idx}] = React.useState(false);\n`;
        hookCode += `  const handleClickToggle_${idx} = () => {\n`;
        hookCode += `    setIsActive_${idx}((prev) => !prev);\n`;
        hookCode += `  };\n\n`;

        injectedEventAttributes[inter.targetSelector] = `onClick={handleClickToggle_${idx}} aria-expanded={isActive_${idx}}`;
      }
    });

    return {
      hasInteractionCode: true,
      hookCode,
      injectedEventAttributes,
      diagnostics,
    };
  }
}
