import { Badge } from '@/components/ui/Badge'
import { PROTOCOL_STATUS_CONFIG, RESEARCHER_STATUS_CONFIG } from '@/pages/protocols/protocol-status'
import type { ProtocolStatus } from '@/types/entities'

/** `researcher` muestra el estado en lenguaje llano y sin siglas; el listado administrativo conserva el detalle por comité. */
export function ProtocolStatusBadge({ status, audience = 'admin' }: { status: ProtocolStatus; audience?: 'admin' | 'researcher' }) {
  const configs = audience === 'researcher' ? RESEARCHER_STATUS_CONFIG : PROTOCOL_STATUS_CONFIG
  const config = configs[status] ?? { label: status, tone: 'neutral' }
  return <Badge tone={config.tone}>{config.label}</Badge>
}
