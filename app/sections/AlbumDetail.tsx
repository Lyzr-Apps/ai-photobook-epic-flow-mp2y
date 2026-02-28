'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  FiUpload, FiCamera, FiArrowLeft, FiShare2, FiTrash2,
  FiDownload, FiMessageSquare, FiLink, FiCheck, FiX, FiFile,
  FiCopy
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'
import type { AlbumData, PhotoData } from '../page'

const ALBUM_INTELLIGENCE_ID = '69a27fcf8e6d0e51fd5cd3fb'

const PHOTO_COLORS = [
  'from-amber-200 to-amber-100',
  'from-rose-200 to-rose-100',
  'from-sky-200 to-sky-100',
  'from-emerald-200 to-emerald-100',
  'from-violet-200 to-violet-100',
  'from-slate-200 to-slate-100',
]

interface AlbumDetailProps {
  album: AlbumData | null
  onBack: () => void
  onUpdateAlbum: (album: AlbumData) => void
  onShareAlbum: (albumId: number) => void
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

export default function AlbumDetail({ album, onBack, onUpdateAlbum, onShareAlbum, activeAgentId, setActiveAgentId }: AlbumDetailProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [albumTitle, setAlbumTitle] = useState(album?.title || '')
  const [albumDesc, setAlbumDesc] = useState(album?.description || '')
  const [shareEnabled, setShareEnabled] = useState(album?.shareEnabled || false)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successMsg, setSuccessMsg] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nextPhotoId, setNextPhotoId] = useState(album ? Math.max(0, ...album.photos.map(p => p.id)) + 1 : 1)

  const photos = album?.photos || []

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

  // Process files from either drag-and-drop or file input
  const processFiles = useCallback((files: FileList | File[]) => {
    if (!album || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(f =>
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|gif|webp|heic|tiff|bmp)$/i)
    )

    if (imageFiles.length === 0) {
      setSuccessMsg('No image files detected. Please upload image files.')
      setTimeout(() => setSuccessMsg(''), 3000)
      setUploading(false)
      return
    }

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // Create photo entries for uploaded files
        const newPhotos: PhotoData[] = imageFiles.map((file, index) => ({
          id: nextPhotoId + index,
          name: file.name,
          color: PHOTO_COLORS[(nextPhotoId + index) % PHOTO_COLORS.length],
          size: `${(file.size / 1024).toFixed(0)} KB`,
          uploadedAt: new Date().toISOString(),
        }))

        setNextPhotoId(prev => prev + imageFiles.length)

        // Update the album with new photos
        const updatedAlbum: AlbumData = {
          ...album,
          title: albumTitle || album.title,
          description: albumDesc || album.description,
          shareEnabled,
          photos: [...album.photos, ...newPhotos],
        }
        onUpdateAlbum(updatedAlbum)

        setUploading(false)
        setUploadProgress(100)
        setSuccessMsg(`${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''} uploaded successfully`)
        setTimeout(() => { setSuccessMsg(''); setUploadProgress(0) }, 3000)
      }
      setUploadProgress(Math.min(progress, 100))
    }, 200)
  }, [album, albumTitle, albumDesc, shareEnabled, nextPhotoId, onUpdateAlbum])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input so the same file can be uploaded again
    e.target.value = ''
  }

  const handleDeleteSelected = () => {
    if (!album) return
    const updatedAlbum: AlbumData = {
      ...album,
      photos: album.photos.filter(p => !selectedPhotos.has(p.id)),
    }
    onUpdateAlbum(updatedAlbum)
    setSelectedPhotos(new Set())
    setSuccessMsg(`${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''} deleted`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleSaveSettings = () => {
    if (!album) return
    const updatedAlbum: AlbumData = {
      ...album,
      title: albumTitle || album.title,
      description: albumDesc,
      shareEnabled,
      status: shareEnabled ? 'Active' : 'Draft',
    }
    onUpdateAlbum(updatedAlbum)
    setSuccessMsg('Album settings saved')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const getShareLink = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}?album=${album?.id || 'new'}`
  }

  const handleCopyLink = () => {
    const shareLink = getShareLink()
    navigator.clipboard?.writeText(shareLink).catch(() => {})
    setLinkCopied(true)
    setSuccessMsg('Share link copied to clipboard')
    setTimeout(() => { setLinkCopied(false); setSuccessMsg('') }, 2500)
  }

  const handlePreviewAsGuest = () => {
    if (album) onShareAlbum(album.id)
  }

  if (!album) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FiCamera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-serif text-lg tracking-wider font-light text-muted-foreground mb-2">No album selected</p>
          <Button onClick={onBack} className="rounded-none bg-primary tracking-widest text-xs uppercase">
            <FiArrowLeft className="w-4 h-4 mr-2" /> Back to Albums
          </Button>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-muted transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-serif text-2xl tracking-widest font-light">
                {album.title}
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-0.5">
                {photos.length} photos | Created {album.date}
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
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {uploading ? (
                  <div>
                    <div className="w-full h-2 bg-muted mb-3 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm font-light tracking-wider text-muted-foreground">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-light tracking-wider text-muted-foreground">
                      Drag & drop photos here, or click to browse
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 tracking-wider mt-1">
                      Supports JPG, PNG, WEBP, HEIC
                    </p>
                  </>
                )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none text-xs tracking-wider text-destructive"
                    onClick={handleDeleteSelected}
                  >
                    <FiTrash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              )}

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                      Photos ({photos.length})
                    </p>
                    <button onClick={selectAll} className="text-xs text-primary tracking-wider hover:underline">
                      {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {photos.map(photo => (
                      <div
                        key={photo.id}
                        className={cn(
                          'relative aspect-square bg-gradient-to-br flex flex-col items-center justify-center cursor-pointer group transition-all',
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
                        <p className="absolute bottom-1 left-1.5 right-1.5 text-[8px] text-muted-foreground/50 tracking-wider truncate">
                          {photo.name}
                        </p>
                        {photo.size && (
                          <span className="absolute top-1.5 right-1.5 text-[7px] text-muted-foreground/40 tracking-wider">
                            {photo.size}
                          </span>
                        )}
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
                    Drag & drop photos above or click to browse files
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 rounded-none bg-primary tracking-widest text-xs uppercase"
                  >
                    <FiUpload className="w-4 h-4 mr-2" /> Upload Photos
                  </Button>
                </div>
              )}

              {/* Mini Analytics */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Views', value: album.views.toLocaleString(), change: '+12%' },
                    { label: 'Downloads', value: album.downloads.toLocaleString(), change: '+8%' },
                    { label: 'Shares', value: album.shares.toLocaleString(), change: '+24%' },
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
                  <Button
                    onClick={handleSaveSettings}
                    className="w-full rounded-none bg-primary hover:bg-primary/90 tracking-widest text-xs uppercase"
                  >
                    <FiCheck className="w-3.5 h-3.5 mr-2" /> Save Settings
                  </Button>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full rounded-none text-xs tracking-widest uppercase"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? (
                      <><FiCheck className="w-3.5 h-3.5 mr-2" /> Link Copied</>
                    ) : (
                      <><FiCopy className="w-3.5 h-3.5 mr-2" /> Copy Share Link</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-none text-xs tracking-widest uppercase"
                    onClick={() => setShowQRModal(true)}
                  >
                    <FiLink className="w-3.5 h-3.5 mr-2" /> Generate QR Code
                  </Button>
                  <Separator />
                  <Button
                    onClick={handlePreviewAsGuest}
                    className="w-full rounded-none bg-accent text-accent-foreground hover:bg-accent/90 tracking-widest text-xs uppercase"
                  >
                    <FiShare2 className="w-3.5 h-3.5 mr-2" /> Preview as Guest
                  </Button>
                  <p className="text-[9px] text-center text-muted-foreground tracking-wider">
                    See what guests see when they open the shared link
                  </p>
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-card border border-border w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg tracking-widest font-light mb-4">QR Code</h3>
            <div className="w-48 h-48 mx-auto bg-muted flex items-center justify-center mb-4 border border-border">
              <div className="grid grid-cols-5 gap-1 p-4">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={cn('w-4 h-4', Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent')} />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground tracking-wider mb-2">
              Share this QR code with event participants
            </p>
            <div className="mb-4 p-2 bg-muted text-[9px] tracking-wider text-muted-foreground break-all">
              {getShareLink()}
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleCopyLink} variant="outline" className="rounded-none tracking-widest text-xs uppercase">
                <FiCopy className="w-3 h-3 mr-1.5" /> Copy Link
              </Button>
              <Button onClick={() => setShowQRModal(false)} className="rounded-none bg-primary tracking-widest text-xs uppercase">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
