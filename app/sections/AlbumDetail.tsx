'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  FiUpload, FiCamera, FiArrowLeft, FiShare2, FiTrash2,
  FiDownload, FiMessageSquare, FiLink
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'

const ALBUM_INTELLIGENCE_ID = '69a27fcf8e6d0e51fd5cd3fb'

interface AlbumDetailProps {
  onBack: () => void
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const MOCK_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `IMG_${(4200 + i).toString()}.jpg`,
  selected: false,
  color: [
    'from-amber-200 to-amber-100',
    'from-rose-200 to-rose-100',
    'from-sky-200 to-sky-100',
    'from-emerald-200 to-emerald-100',
    'from-violet-200 to-violet-100',
    'from-slate-200 to-slate-100',
  ][i % 6],
}))

export default function AlbumDetail({ onBack, showSample, activeAgentId, setActiveAgentId }: AlbumDetailProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [albumTitle, setAlbumTitle] = useState(showSample ? 'Anderson Wedding' : '')
  const [albumDesc, setAlbumDesc] = useState(showSample ? 'A beautiful celebration of love at the Anderson estate. Golden hour portraits, candid moments, and elegant ceremony coverage.' : '')
  const [shareEnabled, setShareEnabled] = useState(true)
  const [dragOver, setDragOver] = useState(false)

  const photos = showSample ? MOCK_PHOTOS : []

  const togglePhoto = (id: number) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)))
    }
  }

  const handleOpenChat = () => {
    setChatOpen(true)
    setActiveAgentId(ALBUM_INTELLIGENCE_ID)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-muted transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-serif text-2xl tracking-widest font-light">
                {albumTitle || 'New Album'}
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-0.5">
                {showSample ? '342 photos | Created Feb 14, 2026' : 'Configure your album'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Photo Grid + Upload */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
                className={cn(
                  'border-2 border-dashed p-8 text-center transition-colors',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <FiUpload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-light tracking-wider text-muted-foreground">
                  Drag & drop photos here or
                </p>
                <Button className="mt-3 rounded-none bg-primary tracking-widest text-xs uppercase">
                  Browse Files
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedPhotos.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted">
                  <span className="text-xs tracking-wider font-light">
                    {selectedPhotos.size} selected
                  </span>
                  <div className="flex-1" />
                  <Button variant="outline" size="sm" className="rounded-none text-xs tracking-wider">
                    <FiDownload className="w-3.5 h-3.5 mr-1.5" /> Download
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-none text-xs tracking-wider text-destructive">
                    <FiTrash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              )}

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Photos</p>
                    <button onClick={selectAll} className="text-xs text-primary tracking-wider hover:underline">
                      {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {photos.map(photo => (
                      <div
                        key={photo.id}
                        className={cn(
                          'relative aspect-square bg-gradient-to-br flex items-center justify-center cursor-pointer group transition-all',
                          photo.color,
                          selectedPhotos.has(photo.id) && 'ring-2 ring-primary ring-offset-1'
                        )}
                        onClick={() => togglePhoto(photo.id)}
                      >
                        <FiCamera className="w-5 h-5 text-muted-foreground/20" />
                        <div className={cn(
                          'absolute top-1.5 left-1.5 w-5 h-5 border flex items-center justify-center bg-white/80 transition-opacity',
                          selectedPhotos.has(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}>
                          {selectedPhotos.has(photo.id) && (
                            <div className="w-3 h-3 bg-primary" />
                          )}
                        </div>
                        <p className="absolute bottom-1 right-1.5 text-[8px] text-muted-foreground/50 tracking-wider">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FiCamera className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="font-serif text-base tracking-wider font-light text-muted-foreground">
                    No photos uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground font-light tracking-wider mt-1">
                    Upload photos to get started
                  </p>
                </div>
              )}

              {/* Mini Analytics */}
              {showSample && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Views', value: '2,847', change: '+12%' },
                    { label: 'Downloads', value: '186', change: '+8%' },
                    { label: 'Shares', value: '43', change: '+24%' },
                  ].map((stat, i) => (
                    <Card key={i} className="rounded-none border-border">
                      <CardContent className="p-4 text-center">
                        <p className="text-[9px] tracking-[0.3em] text-muted-foreground uppercase">{stat.label}</p>
                        <p className="font-serif text-xl font-light mt-1">{stat.value}</p>
                        <p className="text-[10px] text-primary tracking-wider mt-0.5">{stat.change}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Album Settings */}
            <div className="space-y-6">
              <Card className="rounded-none border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-sm tracking-[0.2em] uppercase font-light">Album Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Title</Label>
                    <Input
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="Album title"
                      className="rounded-none mt-1.5 text-sm font-light tracking-wider"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Description</Label>
                    <Textarea
                      value={albumDesc}
                      onChange={(e) => setAlbumDesc(e.target.value)}
                      placeholder="Describe this album..."
                      rows={4}
                      className="rounded-none mt-1.5 text-sm font-light tracking-wider resize-none"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light tracking-wider">Sharing</p>
                      <p className="text-[10px] text-muted-foreground tracking-wider">Allow public access</p>
                    </div>
                    <Switch checked={shareEnabled} onCheckedChange={setShareEnabled} />
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full rounded-none text-xs tracking-widest uppercase">
                    <FiLink className="w-3.5 h-3.5 mr-2" /> Generate QR Code
                  </Button>
                  <Button variant="outline" className="w-full rounded-none text-xs tracking-widest uppercase">
                    <FiShare2 className="w-3.5 h-3.5 mr-2" /> Copy Share Link
                  </Button>
                </CardContent>
              </Card>

              {/* AI Assist Button */}
              <Button
                onClick={handleOpenChat}
                className="w-full rounded-none bg-primary tracking-widest text-xs uppercase"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" /> Ask AI for Descriptions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-96 flex-shrink-0">
          <AgentChatPanel
            agentId={ALBUM_INTELLIGENCE_ID}
            title="Album Intelligence"
            placeholder="Ask me to write descriptions, suggest tags, or summarize analytics..."
            isOpen={chatOpen}
            onClose={() => { setChatOpen(false); setActiveAgentId(null) }}
          />
        </div>
      )}
    </div>
  )
}
