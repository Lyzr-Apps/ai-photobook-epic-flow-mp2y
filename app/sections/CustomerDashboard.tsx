'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FiImage, FiCamera, FiEye, FiDollarSign,
  FiSearch, FiPlus, FiMessageSquare, FiEdit, FiTrash2,
  FiX, FiCalendar, FiCheck
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'
import type { AlbumData } from '../page'

const ALBUM_INTELLIGENCE_ID = '69a27fcf8e6d0e51fd5cd3fb'

interface CustomerDashboardProps {
  albums: AlbumData[]
  onOpenAlbum: (albumId: number) => void
  onCreateAlbum: (title: string, date: string, description: string) => void
  onDeleteAlbum: (albumId: number) => void
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

export default function CustomerDashboard({
  albums, onOpenAlbum, onCreateAlbum, onDeleteAlbum, activeAgentId, setActiveAgentId
}: CustomerDashboardProps) {
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const totalPhotos = albums.reduce((sum, a) => sum + a.photos.length, 0)
  const totalViews = albums.reduce((sum, a) => sum + a.views, 0)
  const totalEarnings = albums.filter(a => a.status === 'Active').length * 97.5

  const stats = [
    { label: 'Total Albums', value: albums.length.toString(), icon: <FiImage className="w-5 h-5" />, sub: `${albums.filter(a => a.status === 'Active').length} active` },
    { label: 'Total Photos', value: totalPhotos.toLocaleString(), icon: <FiCamera className="w-5 h-5" />, sub: `Across ${albums.length} albums` },
    { label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), icon: <FiEye className="w-5 h-5" />, sub: 'All time' },
    { label: 'Earnings', value: `$${totalEarnings.toFixed(0)}`, icon: <FiDollarSign className="w-5 h-5" />, sub: 'Estimated' },
  ]

  const filtered = albums.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))

  const handleOpenChat = () => {
    setChatOpen(true)
    setActiveAgentId(ALBUM_INTELLIGENCE_ID)
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    setActiveAgentId(null)
  }

  const handleCreateSubmit = () => {
    if (!newTitle.trim()) return
    const dateStr = newDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    onCreateAlbum(newTitle.trim(), dateStr, newDesc.trim())
    setNewTitle('')
    setNewDate('')
    setNewDesc('')
    setShowCreateModal(false)
    setSuccessMsg(`Album "${newTitle.trim()}" created successfully`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleDeleteConfirm = (albumId: number) => {
    const album = albums.find(a => a.id === albumId)
    onDeleteAlbum(albumId)
    setDeleteConfirm(null)
    if (album) {
      setSuccessMsg(`Album "${album.title}" deleted`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-light tracking-wider text-emerald-700">{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="ml-auto">
                <FiX className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl tracking-widest font-light">My Albums</h2>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">
                Manage your photo collections
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
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
                  onClick={() => onOpenAlbum(album.id)}
                >
                  <div className={cn('h-40 bg-gradient-to-br flex items-center justify-center relative', album.color)}>
                    <FiCamera className="w-8 h-8 text-muted-foreground/30" />
                    {album.photos.length > 0 && (
                      <span className="absolute bottom-2 right-2 text-[10px] tracking-wider bg-white/70 px-2 py-0.5">
                        {album.photos.length} photos
                      </span>
                    )}
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
                      <span className="text-xs font-light">{album.views} views</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenAlbum(album.id) }}
                        className="p-1.5 hover:bg-muted transition-colors"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenAlbum(album.id) }}
                        className="p-1.5 hover:bg-muted transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(album.id) }}
                        className="p-1.5 hover:bg-muted transition-colors text-destructive"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiImage className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="font-serif text-lg tracking-wider font-light text-muted-foreground">
                {search ? 'No albums match your search' : 'No albums yet'}
              </p>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">
                {search ? 'Try a different search term' : 'Create your first album to get started'}
              </p>
              {!search && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-none bg-primary tracking-widest text-xs uppercase"
                >
                  <FiPlus className="w-4 h-4 mr-2" /> Create Album
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card border border-border w-full max-w-lg p-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-serif text-lg tracking-widest font-light">Create New Album</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-muted transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <Label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  Album Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Summer Wedding 2026"
                  className="rounded-none mt-1.5 text-sm font-light tracking-wider"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Event Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="rounded-none mt-1.5 text-sm font-light tracking-wider"
                />
              </div>
              <div>
                <Label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Description</Label>
                <Textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the event or album..."
                  rows={3}
                  className="rounded-none mt-1.5 text-sm font-light tracking-wider resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="rounded-none tracking-widest text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={!newTitle.trim()}
                className="rounded-none bg-primary hover:bg-primary/90 tracking-widest text-xs uppercase px-6"
              >
                <FiPlus className="w-3.5 h-3.5 mr-2" /> Create Album
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card border border-border w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg tracking-widest font-light mb-2">Delete Album</h3>
            <p className="text-sm font-light text-muted-foreground tracking-wider mb-6">
              Are you sure you want to delete &quot;{albums.find(a => a.id === deleteConfirm)?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-none tracking-widest text-xs uppercase">
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground tracking-widest text-xs uppercase"
              >
                <FiTrash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Toggle */}
      {!chatOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-20 right-8 w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-10"
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
