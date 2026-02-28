'use client'

import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

// --- Agent Info ---
const AGENTS = [
  { id: '69a27fcf8e6d0e51fd5cd3fb', name: 'Album Intelligence', purpose: 'Descriptions, analytics & tags' },
  { id: '69a27fcf00b22915dd81e164', name: 'Photo Discovery', purpose: 'Natural language photo search' },
  { id: '69a27fcf8e6d0e51fd5cd3fd', name: 'Admin Insights', purpose: 'Platform analytics & trends' },
]

type Screen = 'customer-dashboard' | 'album-detail' | 'end-user-gallery' | 'admin-dashboard'
type UserRole = 'admin' | 'customer' | 'enduser'

// --- Main Page ---
export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('customer-dashboard')
  const [userRole, setUserRole] = useState<UserRole>('customer')
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const renderScreen = () => {
    switch (currentScreen) {
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            onOpenAlbum={() => setCurrentScreen('album-detail')}
            showSample={showSample}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'album-detail':
        return (
          <AlbumDetail
            onBack={() => setCurrentScreen('customer-dashboard')}
            showSample={showSample}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'end-user-gallery':
        return (
          <EndUserGallery
            showSample={showSample}
            activeAgentId={activeAgentId}
            setActiveAgentId={setActiveAgentId}
          />
        )
      case 'admin-dashboard':
        return (
          <AdminDashboard
            showSample={showSample}
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
            <div />
            <div className="flex items-center gap-5">
              {/* Sample Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase cursor-pointer">
                  Sample Data
                </Label>
                <Switch
                  id="sample-toggle"
                  checked={showSample}
                  onCheckedChange={setShowSample}
                />
              </div>
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
