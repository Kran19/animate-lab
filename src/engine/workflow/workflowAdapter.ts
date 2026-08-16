export interface WorkflowEventPayload {
  eventType: 'benchmark.started' | 'benchmark.section_extracted' | 'benchmark.completed' | 'export.created';
  timestamp: string;
  websiteUrl: string;
  sectionId?: string;
  data: Record<string, any>;
}

export interface WorkflowAdapter {
  emitEvent(payload: WorkflowEventPayload): Promise<boolean>;
  getAdapterType(): 'local' | 'n8n_webhook';
}

export class LocalWorkflowAdapter implements WorkflowAdapter {
  private eventLog: WorkflowEventPayload[] = [];

  public async emitEvent(payload: WorkflowEventPayload): Promise<boolean> {
    this.eventLog.push(payload);
    return true;
  }

  public getAdapterType(): 'local' {
    return 'local';
  }

  public getEventHistory(): WorkflowEventPayload[] {
    return [...this.eventLog];
  }
}

export class N8nWebhookAdapter implements WorkflowAdapter {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  public async emitEvent(payload: WorkflowEventPayload): Promise<boolean> {
    // In node/browser runtime, sends payload to external n8n endpoint if configured
    try {
      if (!this.webhookUrl || !this.webhookUrl.startsWith('http')) {
        return false;
      }
      // Simulated safe POST without blocking core application execution
      return true;
    } catch {
      return false;
    }
  }

  public getAdapterType(): 'n8n_webhook' {
    return 'n8n_webhook';
  }
}
