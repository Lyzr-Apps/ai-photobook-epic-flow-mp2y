'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { FiCpu } from 'react-icons/fi'

import Sidebar from './sections/Sidebar'
import CustomerDashboard from './sections/CustomerDashboard'
import AlbumDetail from './sections/AlbumDetail'
import EndUserGallery from './sections/EndUserGallery'
import AdminDashboard from './sections/AdminDashboard'

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="font-serif text-xl tracking-widest mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm font-light tracking-wider">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-6 py-2 bg-primary text-primary-foreground text-xs tracking-widest uppercase"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Types ---
export interface AlbumData {
  id: number
  title: string
  date: string
  description: string
  photos: PhotoData[]
  status: 'Active' | 'Draft' | 'Expired'
  color: string
  shareEnabled: boolean
  views: number
  downloads: number
  shares: number
}

export interface PhotoData {
  id: number
  name: string
  color: string
  size?: string
  uploadedAt?: string
}

// --- Agent Info ---
const AGENTS = [
  { id: '69a27fcf8e6d0e51fd5cd3fb', name: 'Album Intelligence', purpose: 'Descriptions, analytics & tags' },
  { id: '69a27fcf00b22915dd81e164', name: 'Photo Discovery', purpose: 'Natural language photo search' },
  { id: '69a27fcf8e6d0e51fd5cd3fd', name: 'Admin Insights', purpose: 'Platform analytics & trends' },
]

const GRADIENT_COLORS = [
  'from-amber-100 to-amber-50',
  'from-slate-200 to-slate-100',
  'from-sky-100 to-sky-50',
  'from-emerald-100 to-emerald-50',
  'from-rose-100 to-rose-50',
  'from-violet-100 to-violet-50',
]

const PHOTO_COLORS = [
  'from-amber-200 to-amber-100',
  'from-rose-200 to-rose-100',
  'from-sky-200 to-sky-100',
  'from-emerald-200 to-emerald-100',
  'from-violet-200 to-violet-100',
  'from-slate-200 to-slate-100',
]

// Seed albums so app is not empty
const INITIAL_ALBUMS: AlbumData[] = [
  { id: 1, title: 'Anderson Wedding', date: 'Feb 14, 2026', description: 'A beautiful celebration of love at the Anderson estate.', photos: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `IMG_${4200 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Active', color: GRADIENT_COLORS[0], shareEnabled: true, views: 2847, downloads: 186, shares: 43 },
  { id: 2, title: 'Corporate Gala 2026', date: 'Jan 28, 2026', description: 'Annual corporate gala with keynote speakers and networking.', photos: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `GALA_${300 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Active', color: GRADIENT_COLORS[1], shareEnabled: true, views: 1520, downloads: 94, shares: 21 },
  { id: 3, title: 'Summer Collection', date: 'Jan 15, 2026', description: 'Summer fashion collection photoshoot.', photos: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `SUMMER_${100 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Draft', color: GRADIENT_COLORS[2], shareEnabled: false, views: 432, downloads: 28, shares: 5 },
  { id: 4, title: 'Lakeside Retreat', date: 'Dec 20, 2025', description: 'Team retreat at the lakeside venue.', photos: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `LAKE_${500 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Active', color: GRADIENT_COLORS[3], shareEnabled: true, views: 980, downloads: 67, shares: 12 },
  { id: 5, title: 'Fashion Week Milano', date: 'Dec 5, 2025', description: 'Runway and backstage coverage from Milan Fashion Week.', photos: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `MILAN_${700 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Expired', color: GRADIENT_COLORS[4], shareEnabled: false, views: 5210, downloads: 312, shares: 89 },
  { id: 6, title: 'Birthday Celebration', date: 'Nov 18, 2025', description: 'Private birthday party celebration.', photos: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `BDAY_${200 + i}.jpg`, color: PHOTO_COLORS[i % 6] })), status: 'Active', color: GRADIENT_COLORS[5], shareEnabled: true, views: 340, downloads: 45, shares: 8 },
]

type Screen = 'customer-dashboard' | 'album-detail' | 'end-user-gallery' | 'admin-dashboard'
type UserRole = 'admin' | 'customer' | 'enduser'

// --- Main Page ---
export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('customer-dashboard')
  const [userRole, setUserRole] = useState<UserRole>('customer')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [albums, setAlbums] = useState<AlbumData[]>(INITIAL_ALBUMS)
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)
  const [nextId, setNextId] = useState(7)

  const handleOpenAlbum = useCallback((albumId: number) => {
    setSelectedAlbumId(albumId)
    setCurrentScreen('album-detail')
  }, [])

  const handleCreateAlbum = useCallback((title: string, date: string, description: string) => {
    const newAlbum: AlbumData = {
      id: nextId,
      title,
      date,
      description,
      photos: [],
      status: 'Draft',
      color: GRADIENT_COLORS[(nextId - 1) % GRADIENT_COLORS.length],
      shareEnabled: false,
      views: 0,
      downloads: 0,
      shares: 0,
    }
    setAlbums(prev => [newAlbum, ...prev])
    setNextId(prev => prev + 1)
    setSelectedAlbumId(newAlbum.id)
    setCurrentScreen('album-detail')
  }, [nextId])

  const handleUpdateAlbum = useCallback((updated: AlbumData) => {
    setAlbums(prev => prev.map(a => a.id === updated.id ? updated : a))
  }, [])

  const handleDeleteAlbum = useCallback((albumId: number) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId))
    if (selectedAlbumId === albumId) {
      setSelectedAlbumId(null)
      setCurrentScreen('customer-dashboard')
    }
  }, [selectedAlbumId])

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId) || null

  const renderScreen = () => {
    switch (currentScreen) {
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            albums={albums}
            onOpenAlbum={handleOpenAlbum}
            onCreateAlbum={handleCreateAlbum}
            onDeleteAlbum={handleDeleteAlbum}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'album-detail':
        return (
          <AlbumDetail
            album={selectedAlbum}
            onBack={() => setCurrentScreen('customer-dashboard')}
            onUpdateAlbum={handleUpdateAlbum}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'end-user-gallery':
        return (
          <EndUserGallery
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'admin-dashboard':
        return (
          <AdminDashboard
            albums={albums}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <Sidebar
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header Bar */}
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase font-light">
              {currentScreen === 'customer-dashboard' ? 'Albums Overview' : currentScreen === 'album-detail' ? 'Album Management' : currentScreen === 'end-user-gallery' ? 'Photo Gallery' : 'Administration'}
            </p>
            <div className="flex items-center gap-5">
              <p className="text-[10px] tracking-wider text-muted-foreground">
                {albums.length} albums | {albums.reduce((sum, a) => sum + a.photos.length, 0)} photos
              </p>
            </div>
          </header>

          {/* Screen Content */}
          <main className="flex-1 overflow-hidden">
            {renderScreen()}
          </main>

          {/* Agent Status Footer */}
          <footer className="border-t border-border bg-card px-6 py-2.5 flex-shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FiCpu className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">AI Agents</span>
              </div>
              <div className="flex items-center gap-5">
                {AGENTS.map(agent => (
                  <div key={agent.id} className="flex items-center gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
                    )} />
                    <span className={cn(
                      'text-[10px] tracking-wider',
                      activeAgentId === agent.id ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {agent.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 tracking-wider hidden lg:inline">
                      {agent.purpose}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}
