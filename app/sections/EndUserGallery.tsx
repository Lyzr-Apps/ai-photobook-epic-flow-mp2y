'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FiUpload, FiCamera, FiDownload, FiShare2,
  FiMessageSquare, FiRefreshCw, FiSearch
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'

const PHOTO_DISCOVERY_ID = '69a27fcf00b22915dd81e164'

interface EndUserGalleryProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const MOCK_MATCHED_PHOTOS = [
  { id: 1, name: 'Ceremony entrance', confidence: 98, color: 'from-amber-200 to-amber-100' },
  { id: 2, name: 'Group photo - family', confidence: 95, color: 'from-rose-200 to-rose-100' },
  { id: 3, name: 'Dancing reception', confidence: 92, color: 'from-violet-200 to-violet-100' },
  { id: 4, name: 'Toast moment', confidence: 90, color: 'from-sky-200 to-sky-100' },
  { id: 5, name: 'Candid laugh', confidence: 88, color: 'from-emerald-200 to-emerald-100' },
  { id: 6, name: 'Near the stage', confidence: 85, color: 'from-slate-200 to-slate-100' },
  { id: 7, name: 'Outdoor portrait', confidence: 82, color: 'from-amber-100 to-yellow-50' },
  { id: 8, name: 'Table candid', confidence: 78, color: 'from-pink-200 to-pink-100' },
]

export default function EndUserGallery({ showSample, activeAgentId, setActiveAgentId }: EndUserGalleryProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'done'>(showSample ? 'done' : 'idle')
  const [dragOver, setDragOver] = useState(false)

  const photos = showSample ? MOCK_MATCHED_PHOTOS : []

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

  const simulateUpload = () => {
    setUploadState('processing')
    setTimeout(() => setUploadState('done'), 2500)
  }

  const handleOpenChat = () => {
    setChatOpen(true)
    setActiveAgentId(PHOTO_DISCOVERY_ID)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl tracking-[0.3em] font-light">Your Photos</h2>
            <p className="text-sm text-muted-foreground font-light tracking-wider mt-2">
              Upload a selfie to find your photos from the event
            </p>
          </div>

          {/* Upload Zone */}
          {uploadState === 'idle' && (
            <div className="mb-10">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); simulateUpload() }}
                className={cn(
                  'border-2 border-dashed p-12 text-center transition-colors',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <FiUpload className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-serif text-lg tracking-wider font-light mb-2">
                  Upload Your Selfie
                </p>
                <p className="text-sm text-muted-foreground font-light tracking-wider mb-4">
                  Drag & drop a photo of yourself, or use one of the options below
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={simulateUpload} className="rounded-none bg-primary tracking-widest text-xs uppercase">
                    <FiUpload className="w-4 h-4 mr-2" /> Upload Photo
                  </Button>
                  <Button onClick={simulateUpload} variant="outline" className="rounded-none tracking-widest text-xs uppercase">
                    <FiCamera className="w-4 h-4 mr-2" /> Use Camera
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {uploadState === 'processing' && (
            <div className="mb-10 text-center py-16">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-2 border-primary/20" />
                <div className="absolute inset-0 border-t-2 border-primary animate-spin" />
                <FiSearch className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <p className="font-serif text-lg tracking-wider font-light">Scanning Event Photos</p>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-2">
                Finding your matches across 3,847 photos...
              </p>
            </div>
          )}

          {/* Results */}
          {uploadState === 'done' && (
            <>
              {photos.length > 0 ? (
                <div>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-serif text-lg tracking-wider font-light">
                        {photos.length} Photos Found
                      </p>
                      <p className="text-xs text-muted-foreground tracking-wider mt-0.5">
                        Matched by facial recognition
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={selectAll} className="text-xs text-primary tracking-wider hover:underline">
                        {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedPhotos.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted mb-4">
                      <span className="text-xs tracking-wider font-light">
                        {selectedPhotos.size} selected
                      </span>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="rounded-none text-xs tracking-wider">
                        <FiDownload className="w-3.5 h-3.5 mr-1.5" /> Download Selected
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-none text-xs tracking-wider">
                        <FiShare2 className="w-3.5 h-3.5 mr-1.5" /> Share
                      </Button>
                    </div>
                  )}

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
                        <FiCamera className="w-6 h-6 text-muted-foreground/20" />
                        <Badge className="absolute top-2 right-2 rounded-none text-[9px] tracking-wider bg-white/90 text-foreground border-0">
                          {photo.confidence}%
                        </Badge>
                        <div className={cn(
                          'absolute top-2 left-2 w-5 h-5 border flex items-center justify-center bg-white/80 transition-opacity',
                          selectedPhotos.has(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}>
                          {selectedPhotos.has(photo.id) && <div className="w-3 h-3 bg-primary" />}
                        </div>
                        <p className="absolute bottom-1.5 left-2 right-2 text-[9px] text-muted-foreground/60 tracking-wider truncate">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bulk Download */}
                  <div className="flex items-center justify-center gap-3">
                    <Button className="rounded-none bg-primary tracking-widest text-xs uppercase">
                      <FiDownload className="w-4 h-4 mr-2" /> Download All
                    </Button>
                    <Button onClick={handleOpenChat} variant="outline" className="rounded-none tracking-widest text-xs uppercase">
                      <FiMessageSquare className="w-4 h-4 mr-2" /> Explore My Photos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FiCamera className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-serif text-lg tracking-wider font-light text-muted-foreground">
                    No matching photos found
                  </p>
                  <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">
                    Try uploading a clearer selfie
                  </p>
                  <Button
                    onClick={() => setUploadState('idle')}
                    variant="outline"
                    className="mt-4 rounded-none tracking-widest text-xs uppercase"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Toggle */}
      {!chatOpen && uploadState === 'done' && photos.length > 0 && (
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
            agentId={PHOTO_DISCOVERY_ID}
            title="Photo Discovery"
            placeholder="Try 'show group photos' or 'photos near the stage'..."
            isOpen={chatOpen}
            onClose={() => { setChatOpen(false); setActiveAgentId(null) }}
          />
        </div>
      )}
    </div>
  )
}
