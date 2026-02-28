'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FiImage, FiCamera, FiEye, FiDollarSign,
  FiSearch, FiPlus, FiMessageSquare, FiEdit, FiTrash2
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'

const ALBUM_INTELLIGENCE_ID = '69a27fcf8e6d0e51fd5cd3fb'

interface CustomerDashboardProps {
  onOpenAlbum: () => void
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const MOCK_STATS = [
  { label: 'Total Albums', value: '24', icon: <FiImage className="w-5 h-5" />, sub: '+3 this month' },
  { label: 'Total Photos', value: '3,847', icon: <FiCamera className="w-5 h-5" />, sub: '+412 this week' },
  { label: 'Total Views', value: '12.5K', icon: <FiEye className="w-5 h-5" />, sub: '+18% vs last month' },
  { label: 'Earnings', value: '$2,340', icon: <FiDollarSign className="w-5 h-5" />, sub: '+$340 pending' },
]

const MOCK_ALBUMS = [
  { id: 1, title: 'Anderson Wedding', date: 'Feb 14, 2026', photos: 342, status: 'Active', color: 'from-amber-100 to-amber-50' },
  { id: 2, title: 'Corporate Gala 2026', date: 'Jan 28, 2026', photos: 187, status: 'Active', color: 'from-slate-200 to-slate-100' },
  { id: 3, title: 'Summer Collection', date: 'Jan 15, 2026', photos: 96, status: 'Draft', color: 'from-sky-100 to-sky-50' },
  { id: 4, title: 'Lakeside Retreat', date: 'Dec 20, 2025', photos: 254, status: 'Active', color: 'from-emerald-100 to-emerald-50' },
  { id: 5, title: 'Fashion Week Milano', date: 'Dec 5, 2025', photos: 518, status: 'Expired', color: 'from-rose-100 to-rose-50' },
  { id: 6, title: 'Birthday Celebration', date: 'Nov 18, 2025', photos: 143, status: 'Active', color: 'from-violet-100 to-violet-50' },
]

export default function CustomerDashboard({ onOpenAlbum, showSample, activeAgentId, setActiveAgentId }: CustomerDashboardProps) {
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const stats = showSample ? MOCK_STATS : MOCK_STATS.map(s => ({ ...s, value: '--', sub: '' }))
  const albums = showSample ? MOCK_ALBUMS : []
  const filtered = albums.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))

  const handleOpenChat = () => {
    setChatOpen(true)
    setActiveAgentId(ALBUM_INTELLIGENCE_ID)
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    setActiveAgentId(null)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl tracking-widest font-light">My Albums</h2>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">
                Manage your photo collections
              </p>
            </div>
            <Button
              onClick={onOpenAlbum}
              className="rounded-none bg-primary hover:bg-primary/90 tracking-widest text-xs uppercase px-6"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="rounded-none border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{stat.label}</p>
                      <p className="font-serif text-3xl font-light mt-2">{stat.value}</p>
                      {stat.sub && (
                        <p className="text-[10px] tracking-wider text-muted-foreground mt-1">{stat.sub}</p>
                      )}
                    </div>
                    <div className="p-2 bg-primary/10 text-primary">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search albums..."
                className="pl-10 rounded-none text-sm font-light tracking-wider"
              />
            </div>
          </div>

          {/* Album Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((album) => (
                <Card
                  key={album.id}
                  className="rounded-none border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={onOpenAlbum}
                >
                  <div className={cn('h-40 bg-gradient-to-br flex items-center justify-center', album.color)}>
                    <FiCamera className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-base tracking-wider font-light">{album.title}</h3>
                      <Badge
                        variant={album.status === 'Active' ? 'default' : album.status === 'Draft' ? 'secondary' : 'outline'}
                        className="rounded-none text-[9px] tracking-widest uppercase"
                      >
                        {album.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-light tracking-wider">{album.date}</span>
                      <span className="text-xs font-light">{album.photos} photos</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-muted transition-colors"><FiEdit className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 hover:bg-muted transition-colors"><FiEye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 hover:bg-muted transition-colors text-destructive"><FiTrash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiImage className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="font-serif text-lg tracking-wider font-light text-muted-foreground">
                {showSample ? 'No albums match your search' : 'No albums yet'}
              </p>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">
                {showSample ? 'Try a different search term' : 'Create your first album to get started'}
              </p>
              {!showSample && (
                <Button onClick={onOpenAlbum} className="mt-4 rounded-none bg-primary tracking-widest text-xs uppercase">
                  <FiPlus className="w-4 h-4 mr-2" /> Create Album
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Toggle */}
      {!chatOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-8 right-8 w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-10"
        >
          <FiMessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-96 flex-shrink-0">
          <AgentChatPanel
            agentId={ALBUM_INTELLIGENCE_ID}
            title="Album Intelligence"
            placeholder="Ask about album descriptions, analytics, or tag suggestions..."
            isOpen={chatOpen}
            onClose={handleCloseChat}
          />
        </div>
      )}
    </div>
  )
}
