'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FiUpload, FiCamera, FiDownload, FiShare2,
  FiMessageSquare, FiRefreshCw, FiSearch, FiCheck, FiX,
  FiArrowLeft, FiImage
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'
import type { AlbumData } from '../page'

const PHOTO_DISCOVERY_ID = '69a27fcf00b22915dd81e164'

interface EndUserGalleryProps {
  album: AlbumData | null
  onBack: (() => void) | null
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

export default function EndUserGallery({ album, onBack, activeAgentId, setActiveAgentId }: EndUserGalleryProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'done'>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate matched photos from the album's actual photos (simulate facial recognition)
  // Each photo gets a random confidence score to simulate AI matching
  const matchedPhotos = useMemo(() => {
    if (!album || !album.photos || album.photos.length === 0) {
      // Fallback generic photos if no album context
      return [
        { id: 1, name: 'Event photo 1', confidence: 98, color: 'from-amber-200 to-amber-100' },
        { id: 2, name: 'Event photo 2', confidence: 95, color: 'from-rose-200 to-rose-100' },
        { id: 3, name: 'Event photo 3', confidence: 92, color: 'from-violet-200 to-violet-100' },
        { id: 4, name: 'Event photo 4', confidence: 88, color: 'from-sky-200 to-sky-100' },
      ]
    }
    // Select ~60-80% of album photos as "matches" and add confidence scores
    const shuffled = [...album.photos].sort(() => 0.5 - Math.random())
    const matchCount = Math.max(3, Math.ceil(album.photos.length * 0.7))
    return shuffled.slice(0, matchCount).map((photo, index) => ({
      id: photo.id,
      name: photo.name,
      confidence: Math.max(72, 99 - index * 3 - Math.floor(Math.random() * 4)),
      color: photo.color,
      previewUrl: photo.previewUrl,
    })).sort((a, b) => b.confidence - a.confidence)
  }, [album])

  const photos = uploadState === 'done' ? matchedPhotos : []

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

  const startScanFlow = (fileName?: string) => {
    setUploadState('processing')
    if (fileName) setUploadedFileName(fileName)
    setTimeout(() => {
      setUploadState('done')
      setSuccessMsg(`${matchedPhotos.length} photos found matching your face`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 2500)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startScanFlow(e.target.files[0].name)
    }
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
        startScanFlow(file.name)
      } else {
        setSuccessMsg('Please upload an image file (JPG, PNG, etc.)')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    }
  }

  const handleOpenChat = () => {
    setChatOpen(true)
    setActiveAgentId(PHOTO_DISCOVERY_ID)
  }

  const handleReset = () => {
    setUploadState('idle')
    setSelectedPhotos(new Set())
    setUploadedFileName('')
  }

  // Not found state - shared link has invalid album ID
  if (album === null && onBack) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md px-8">
          <FiImage className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-xl tracking-widest font-light mb-2">Album Not Found</h2>
          <p className="text-sm text-muted-foreground font-light tracking-wider mb-6">
            This album link may have expired or the album may have been removed by the photographer.
          </p>
          <Button
            onClick={onBack}
            className="rounded-none bg-primary tracking-widest text-xs uppercase"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Check if album sharing is disabled
  if (album && !album.shareEnabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md px-8">
          <FiImage className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-xl tracking-widest font-light mb-2">Album Not Available</h2>
          <p className="text-sm text-muted-foreground font-light tracking-wider mb-2">
            Sharing has been disabled for this album by the photographer.
          </p>
          <p className="text-xs text-muted-foreground/60 tracking-wider mb-6">
            Contact the photographer to request access.
          </p>
          {onBack && (
            <Button
              onClick={onBack}
              className="rounded-none bg-primary tracking-widest text-xs uppercase"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            {album ? (
              <>
                <h2 className="font-serif text-3xl tracking-[0.3em] font-light">{album.title}</h2>
                <p className="text-sm text-muted-foreground font-light tracking-wider mt-2">
                  {uploadState === 'done'
                    ? `${photos.length} photos matched from ${album.photos.length} total`
                    : `${album.photos.length} photos in this album -- upload a selfie to find yours`}
                </p>
                {album.description && uploadState === 'idle' && (
                  <p className="text-xs text-muted-foreground/60 font-light tracking-wider mt-3 max-w-lg mx-auto">
                    {album.description}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="font-serif text-3xl tracking-[0.3em] font-light">Your Photos</h2>
                <p className="text-sm text-muted-foreground font-light tracking-wider mt-2">
                  {uploadState === 'done'
                    ? `Showing results for "${uploadedFileName || 'your selfie'}"`
                    : 'Upload a selfie to find your photos from the event'}
                </p>
              </>
            )}
          </div>

          {/* Success/Info Message */}
          {successMsg && (
            <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 flex items-center gap-2 max-w-lg mx-auto">
              <FiCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-light tracking-wider text-emerald-700">{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="ml-auto">
                <FiX className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          )}

          {/* Upload Zone */}
          {uploadState === 'idle' && (
            <div className="mb-10">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed p-12 text-center transition-colors cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <FiUpload className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-serif text-lg tracking-wider font-light mb-2">
                  Upload Your Selfie
                </p>
                <p className="text-sm text-muted-foreground font-light tracking-wider mb-1">
                  Drag & drop a photo of yourself, or click to browse
                </p>
                <p className="text-xs text-muted-foreground/50 font-light tracking-wider mb-5">
                  Our AI will match your face across {album ? `all ${album.photos.length} photos in this album` : 'event photos'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                    className="rounded-none bg-primary tracking-widest text-xs uppercase"
                  >
                    <FiUpload className="w-4 h-4 mr-2" /> Upload Photo
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); startScanFlow('Camera capture') }}
                    variant="outline"
                    className="rounded-none tracking-widest text-xs uppercase"
                  >
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
                {album
                  ? `Matching your face across ${album.photos.length} photos in "${album.title}"...`
                  : `Analyzing "${uploadedFileName || 'your selfie'}" across event photos...`}
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
                        Matched by facial recognition{album ? ` in "${album.title}"` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={selectAll} className="text-xs text-primary tracking-wider hover:underline">
                        {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                        className="rounded-none text-xs tracking-wider"
                      >
                        <FiRefreshCw className="w-3 h-3 mr-1.5" /> New Search
                      </Button>
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
                          'relative aspect-square bg-gradient-to-br flex items-center justify-center cursor-pointer group transition-all overflow-hidden',
                          photo.color,
                          selectedPhotos.has(photo.id) && 'ring-2 ring-primary ring-offset-1'
                        )}
                        onClick={() => togglePhoto(photo.id)}
                      >
                        {photo.previewUrl ? (
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <FiCamera className="w-6 h-6 text-muted-foreground/20" />
                        )}
                        <Badge className="absolute top-2 right-2 rounded-none text-[9px] tracking-wider bg-white/90 text-foreground border-0 z-10">
                          {photo.confidence}%
                        </Badge>
                        <div className={cn(
                          'absolute top-2 left-2 w-5 h-5 border flex items-center justify-center bg-white/80 transition-opacity z-10',
                          selectedPhotos.has(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}>
                          {selectedPhotos.has(photo.id) && <div className="w-3 h-3 bg-primary" />}
                        </div>
                        <p className="absolute bottom-1.5 left-2 right-2 text-[9px] text-white/80 tracking-wider truncate z-10 drop-shadow-sm">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bulk Download */}
                  <div className="flex items-center justify-center gap-3">
                    <Button className="rounded-none bg-primary tracking-widest text-xs uppercase">
                      <FiDownload className="w-4 h-4 mr-2" /> Download All ({photos.length})
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
                    Try uploading a clearer selfie with good lighting
                  </p>
                  <Button
                    onClick={handleReset}
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
          className="fixed bottom-20 right-8 w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-10"
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
            placeholder={album ? `Ask about photos from "${album.title}"...` : "Try 'show group photos' or 'photos near the stage'..."}
            isOpen={chatOpen}
            onClose={() => { setChatOpen(false); setActiveAgentId(null) }}
          />
        </div>
      )}
    </div>
  )
}
