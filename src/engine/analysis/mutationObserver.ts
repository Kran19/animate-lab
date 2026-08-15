import { TargetedComputedStyle } from './computedStyleAnalyzer';

export interface StyleMutationRecord {
  selector: string;
  tagName: string;
  propertyName: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
  triggerHint?: string;
}

export class DOMMutationObserver {
  private records: StyleMutationRecord[] = [];
  private isObserving = false;
  private maxObservations: number;

  constructor(maxObservations = 500) {
    this.maxObservations = maxObservations;
  }

  public start(): void {
    this.isObserving = true;
    this.records = [];
  }

  public recordMutation(record: StyleMutationRecord): void {
    if (!this.isObserving) return;
    if (this.records.length >= this.maxObservations) return;

    this.records.push(record);
  }

  public stop(): StyleMutationRecord[] {
    this.isObserving = false;
    return [...this.records];
  }

  public getRecords(): StyleMutationRecord[] {
    return [...this.records];
  }

  public clear(): void {
    this.records = [];
  }
}
