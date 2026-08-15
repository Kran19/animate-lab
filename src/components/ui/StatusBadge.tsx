import React from 'react';
import { Badge } from './Badge';
import { CrawlStatus, ProcessStatus, ComponentCandidateStatus } from '../../domain/types';
import { Play, Pause, CheckCircle2, AlertTriangle, XCircle, Clock, Ban } from 'lucide-react';

export interface StatusBadgeProps {
  status: CrawlStatus | ProcessStatus | ComponentCandidateStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'running':
    case 'processing':
      return (
        <Badge variant="accent" size={size} icon={<Play className="w-3 h-3 animate-pulse" />}>
          {status}
        </Badge>
      );

    case 'queued':
    case 'pending':
      return (
        <Badge variant="default" size={size} icon={<Clock className="w-3 h-3" />}>
          {status}
        </Badge>
      );

    case 'paused':
      return (
        <Badge variant="warning" size={size} icon={<Pause className="w-3 h-3" />}>
          paused
        </Badge>
      );

    case 'completed':
    case 'verified':
      return (
        <Badge variant="success" size={size} icon={<CheckCircle2 className="w-3 h-3" />}>
          {status}
        </Badge>
      );

    case 'partial':
      return (
        <Badge variant="warning" size={size} icon={<AlertTriangle className="w-3 h-3" />}>
          partial
        </Badge>
      );

    case 'failed':
      return (
        <Badge variant="error" size={size} icon={<XCircle className="w-3 h-3" />}>
          failed
        </Badge>
      );

    case 'canceled':
      return (
        <Badge variant="outline" size={size} icon={<Ban className="w-3 h-3" />}>
          canceled
        </Badge>
      );

    case 'candidate':
      return (
        <Badge variant="purple" size={size}>
          candidate
        </Badge>
      );

    case 'exported':
      return (
        <Badge variant="info" size={size}>
          exported
        </Badge>
      );

    case 'unsupported':
      return (
        <Badge variant="outline" size={size}>
          unsupported
        </Badge>
      );

    default:
      return <Badge variant="default" size={size}>{status}</Badge>;
  }
};
