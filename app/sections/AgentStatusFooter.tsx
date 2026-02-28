'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FiCpu } from 'react-icons/fi'

interface AgentInfo {
  id: string
  name: string
  purpose: string
}

interface AgentStatusFooterProps {
  agents: AgentInfo[]
  activeAgentId: string | null
}

const AGENTS: AgentInfo[] = [
  { id: '69a27fcf8e6d0e51fd5cd3fb', name: 'Album Intelligence', purpose: 'Descriptions, analytics & tags' },
  { id: '69a27fcf00b22915dd81e164', name: 'Photo Discovery', purpose: 'Natural language photo search' },
  { id: '69a27fcf8e6d0e51fd5cd3fd', name: 'Admin Insights', purpose: 'Platform analytics & trends' },
]

export default function AgentStatusFooter({ agents, activeAgentId }: AgentStatusFooterProps) {
  return (
    <div className="border-t border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <FiCpu className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">AI Agents</span>
        </div>
        <div className="flex items-center gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center gap-2">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/40'
              )} />
              <span className={cn(
                'text-[10px] tracking-wider',
                activeAgentId === agent.id ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {agent.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { AGENTS }
export type { AgentInfo }
