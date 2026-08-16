import { PythonMotionBridge, NarrativeGraphResult } from './pythonBridge';

export interface SectionStoryNode {
  sectionId: string;
  category: string;
  title: string;
  hasMotion?: boolean;
  hasScrollTrigger?: boolean;
  hasPin?: boolean;
}

export class StorytellingEngine {
  /**
   * Constructs the connected narrative storytelling graph for an entire webpage across its sections.
   */
  public static buildGraph(sections: SectionStoryNode[]): NarrativeGraphResult {
    return PythonMotionBridge.buildStorytellingGraph(sections);
  }
}
