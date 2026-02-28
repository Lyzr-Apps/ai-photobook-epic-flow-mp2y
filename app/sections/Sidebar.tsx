'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import {
  FiGrid, FiImage, FiLayers, FiBell, FiUser, FiCamera
} from 'react-icons/fi'

type Screen = 'customer-dashboard' | 'album-detail' | 'end-user-gallery' | 'admin-dashboard'
type UserRole = 'admin' | 'customer' | 'enduser'

interface SidebarProps {
  currentScreen: Screen
  setCurrentScreen: (s: Screen) => void
  userRole: UserRole
  setUserRole: (r: UserRole) => void
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  customer: 'Photographer',
  enduser: 'Guest'
}

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { id: 'admin-dashboard', label: 'Dashboard', icon: <FiGrid className="w-4 h-4" /> },
    { id: 'customer-dashboard', label: 'Albums', icon: <FiImage className="w-4 h-4" /> },
  ],
  customer: [
    { id: 'customer-dashboard', label: 'My Albums', icon: <FiImage className="w-4 h-4" /> },
    { id: 'album-detail', label: 'Album Detail', icon: <FiLayers className="w-4 h-4" /> },
  ],
  enduser: [
    { id: 'end-user-gallery', label: 'My Photos', icon: <FiCamera className="w-4 h-4" /> },
  ]
}

const ROLES: UserRole[] = ['admin', 'customer', 'enduser']

export default function Sidebar({ currentScreen, setCurrentScreen, userRole, setUserRole }: SidebarProps) {
  return (
    <div className="w-64 h-screen flex flex-col bg-card border-r border-border">
      {/* Branding */}
      <div className="px-6 py-6">
        <h1 className="font-serif text-2xl tracking-[0.3em] font-light">LUMIERE</h1>
        <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase mt-1">Photo Platform</p>
      </div>

      <Separator />

      {/* User Info */}
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-muted flex items-center justify-center">
          <FiUser className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-light truncate">
            {userRole === 'admin' ? 'Admin User' : userRole === 'customer' ? 'Jane Doe' : 'Guest User'}
          </p>
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {ROLE_LABELS[userRole]}
          </p>
        </div>
        <button className="relative p-1 hover:bg-muted transition-colors">
          <FiBell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>

      <Separator />

      {/* Role Switcher */}
      <div className="px-6 py-3">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">Switch Role</p>
        <div className="flex gap-1">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => {
                setUserRole(role)
                const defaultScreen = role === 'admin' ? 'admin-dashboard' : role === 'customer' ? 'customer-dashboard' : 'end-user-gallery'
                setCurrentScreen(defaultScreen)
              }}
              className={cn(
                'flex-1 py-1.5 text-[10px] tracking-wider uppercase transition-colors',
                userRole === role
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {role === 'enduser' ? 'Guest' : role === 'admin' ? 'Admin' : 'Photo'}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">Navigation</p>
        {NAV_ITEMS[userRole].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-light tracking-wider transition-colors text-left',
              currentScreen === item.id
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-foreground hover:bg-muted'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-[10px] tracking-widest text-muted-foreground text-center uppercase">
          Lumiere v1.0
        </p>
      </div>
    </div>
  )
}
