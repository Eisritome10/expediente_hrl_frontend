import { Badge } from '@/components/ui/Badge'
import { PROTOCOL_STATUS_CONFIG } from '@/pages/protocols/protocol-status'
import type { ProtocolStatus } from '@/types/entities'

export function ProtocolStatusBadge({ status }: { status: ProtocolStatus }) {
  const config = PROTOCOL_STATUS_CONFIG[status] ?? { label: status, tone: 'neutral' }
  return <Badge tone={config.tone}>{config.label}</Badge>
}
