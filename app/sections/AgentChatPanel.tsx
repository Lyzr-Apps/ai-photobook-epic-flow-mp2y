'use client'

import React, { useState, useRef, useEffect } from 'react'
import { callAIAgent, extractText } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  actionItems?: string[]
}

interface AgentChatPanelProps {
  agentId: string
  title: string
  placeholder: string
  isOpen: boolean
  onClose: () => void
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-serif font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-serif font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-serif font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm font-light">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm font-light">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm font-light">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

export default function AgentChatPanel({ agentId, title, placeholder, isOpen, onClose }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const result = await callAIAgent(userMessage, agentId)
      if (result.success) {
        const agentResponse = result.response?.result?.response || extractText(result.response) || 'No response received.'
        const actionItems = Array.isArray(result.response?.result?.action_items) ? result.response.result.action_items : []
        setMessages(prev => [...prev, { role: 'assistant', content: agentResponse, actionItems }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-sm tracking-widest uppercase">{title}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted transition-colors">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FiMessageSquare className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-light text-muted-foreground tracking-wider">{placeholder}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : (
                <p className="text-sm font-light">{msg.content}</p>
              )}
              {Array.isArray(msg.actionItems) && msg.actionItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs tracking-widest uppercase font-semibold mb-2 opacity-70">Action Items</p>
                  <ul className="space-y-1">
                    {msg.actionItems.map((item, j) => (
                      <li key={j} className="text-xs font-light flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-current mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 text-sm font-light rounded-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="rounded-none bg-primary hover:bg-primary/90"
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
