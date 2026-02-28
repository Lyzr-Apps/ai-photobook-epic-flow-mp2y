'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { callAIAgent, extractText } from '@/lib/aiAgent'
import {
  FiUsers, FiCreditCard, FiDollarSign, FiImage,
  FiSearch, FiBarChart2, FiTrendingUp, FiMessageSquare
} from 'react-icons/fi'
import AgentChatPanel from './AgentChatPanel'

const ADMIN_INSIGHTS_ID = '69a27fcf8e6d0e51fd5cd3fd'

interface AdminDashboardProps {
  showSample: boolean
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const MOCK_KPI = [
  { label: 'Total Users', value: '1,247', icon: <FiUsers className="w-5 h-5" />, change: '+86 this month' },
  { label: 'Active Subscriptions', value: '892', icon: <FiCreditCard className="w-5 h-5" />, change: '71.5% conversion' },
  { label: 'Monthly Revenue', value: '$47,320', icon: <FiDollarSign className="w-5 h-5" />, change: '+12.3% MoM' },
  { label: 'Total Albums', value: '3,241', icon: <FiImage className="w-5 h-5" />, change: '+214 this month' },
]

const MOCK_USERS = [
  { name: 'Sarah Mitchell', email: 'sarah@studio.co', tier: 'Professional', albums: 47, status: 'Active' },
  { name: 'James Chen', email: 'james@capture.io', tier: 'Enterprise', albums: 124, status: 'Active' },
  { name: 'Emily Parker', email: 'emily@photos.com', tier: 'Starter', albums: 8, status: 'Active' },
  { name: 'David Kim', email: 'david@lens.co', tier: 'Professional', albums: 31, status: 'Inactive' },
  { name: 'Lisa Rodriguez', email: 'lisa@snap.io', tier: 'Enterprise', albums: 89, status: 'Active' },
]

const MOCK_ALBUMS_ADMIN = [
  { title: 'Anderson Wedding', owner: 'Sarah Mitchell', photos: 342, views: 2847, status: 'Active' },
  { title: 'Tech Summit 2026', owner: 'James Chen', photos: 518, views: 5210, status: 'Active' },
  { title: 'Spring Fashion', owner: 'Emily Parker', photos: 96, views: 432, status: 'Draft' },
  { title: 'Corporate Retreat', owner: 'David Kim', photos: 187, views: 1205, status: 'Expired' },
  { title: 'Gala Dinner', owner: 'Lisa Rodriguez', photos: 254, views: 3890, status: 'Active' },
]

const MOCK_PAYMENTS = [
  { user: 'James Chen', plan: 'Enterprise', amount: '$199.00', date: 'Feb 28, 2026', status: 'Paid' },
  { user: 'Sarah Mitchell', plan: 'Professional', amount: '$79.00', date: 'Feb 27, 2026', status: 'Paid' },
  { user: 'Lisa Rodriguez', plan: 'Enterprise', amount: '$199.00', date: 'Feb 26, 2026', status: 'Paid' },
  { user: 'Emily Parker', plan: 'Starter', amount: '$29.00', date: 'Feb 25, 2026', status: 'Pending' },
  { user: 'David Kim', plan: 'Professional', amount: '$79.00', date: 'Feb 20, 2026', status: 'Failed' },
]

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
          return <li key={i} className="ml-4 list-disc text-sm font-light">{line.slice(2)}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm font-light">{line.replace(/^\d+\.\s/, '')}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm font-light">{line}</p>
      })}
    </div>
  )
}

export default function AdminDashboard({ showSample, activeAgentId, setActiveAgentId }: AdminDashboardProps) {
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insights, setInsights] = useState<{ response: string; actionItems: string[] } | null>(null)

  const kpis = showSample ? MOCK_KPI : MOCK_KPI.map(k => ({ ...k, value: '--', change: '' }))
  const users = showSample ? MOCK_USERS : []
  const albums = showSample ? MOCK_ALBUMS_ADMIN : []
  const payments = showSample ? MOCK_PAYMENTS : []

  const handleGenerateInsights = async () => {
    setInsightsLoading(true)
    setActiveAgentId(ADMIN_INSIGHTS_ID)
    try {
      const result = await callAIAgent(
        'Generate a comprehensive platform analytics summary including user growth trends, revenue analysis, album activity, and engagement patterns.',
        ADMIN_INSIGHTS_ID
      )
      if (result.success) {
        const response = result.response?.result?.response || extractText(result.response) || 'No insights available.'
        const actionItems = Array.isArray(result.response?.result?.action_items) ? result.response.result.action_items : []
        setInsights({ response, actionItems })
      }
    } catch {
      setInsights({ response: 'Failed to generate insights. Please try again.', actionItems: [] })
    } finally {
      setInsightsLoading(false)
      setActiveAgentId(null)
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl tracking-widest font-light">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground font-light tracking-wider mt-1">Platform overview & management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateInsights}
                disabled={insightsLoading}
                className="rounded-none bg-primary hover:bg-primary/90 tracking-widest text-xs uppercase"
              >
                {insightsLoading ? (
                  <><div className="w-3.5 h-3.5 border border-primary-foreground/40 border-t-primary-foreground animate-spin mr-2" /> Generating...</>
                ) : (
                  <><FiBarChart2 className="w-4 h-4 mr-2" /> Generate Insights</>
                )}
              </Button>
              <Button
                onClick={() => { setChatOpen(true); setActiveAgentId(ADMIN_INSIGHTS_ID) }}
                variant="outline"
                className="rounded-none tracking-widest text-xs uppercase"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" /> AI Chat
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <Card key={i} className="rounded-none border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{kpi.label}</p>
                      <p className="font-serif text-3xl font-light mt-2">{kpi.value}</p>
                      {kpi.change && (
                        <p className="text-[10px] tracking-wider text-primary mt-1">{kpi.change}</p>
                      )}
                    </div>
                    <div className="p-2 bg-primary/10 text-primary">{kpi.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insights Panel */}
          {insights && (
            <Card className="rounded-none border-border shadow-sm mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-sm tracking-[0.2em] uppercase font-light flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-primary" /> Platform Insights
                  </CardTitle>
                  <button onClick={() => setInsights(null)} className="text-xs text-muted-foreground hover:text-foreground tracking-wider">
                    Dismiss
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {renderMarkdown(insights.response)}
                {insights.actionItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">Recommended Actions</p>
                    <ul className="space-y-1.5">
                      {insights.actionItems.map((item, j) => (
                        <li key={j} className="text-sm font-light flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Tables */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-muted rounded-none h-auto p-0 border border-border">
              <TabsTrigger value="users" className="rounded-none text-xs tracking-widest uppercase px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
              <TabsTrigger value="albums" className="rounded-none text-xs tracking-widest uppercase px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Albums</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-none text-xs tracking-widest uppercase px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Payments</TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10 rounded-none text-sm font-light tracking-wider"
              />
            </div>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="rounded-none border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Name</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Email</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Tier</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Albums</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map((user, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-light tracking-wider">{user.name}</TableCell>
                        <TableCell className="text-sm font-light text-muted-foreground">{user.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="rounded-none text-[9px] tracking-widest uppercase">{user.tier}</Badge></TableCell>
                        <TableCell className="text-sm font-light">{user.albums}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'outline'} className="rounded-none text-[9px] tracking-widest uppercase">{user.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-light tracking-wider">No data available</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Albums Tab */}
            <TabsContent value="albums">
              <Card className="rounded-none border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Title</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Owner</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Photos</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Views</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {albums.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map((album, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-light tracking-wider">{album.title}</TableCell>
                        <TableCell className="text-sm font-light text-muted-foreground">{album.owner}</TableCell>
                        <TableCell className="text-sm font-light">{album.photos}</TableCell>
                        <TableCell className="text-sm font-light">{album.views?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={album.status === 'Active' ? 'default' : album.status === 'Draft' ? 'secondary' : 'outline'} className="rounded-none text-[9px] tracking-widest uppercase">{album.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {albums.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-light tracking-wider">No data available</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card className="rounded-none border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">User</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Plan</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Amount</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Date</TableHead>
                      <TableHead className="text-[10px] tracking-[0.2em] uppercase font-normal">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.filter(p => p.user.toLowerCase().includes(search.toLowerCase())).map((payment, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-light tracking-wider">{payment.user}</TableCell>
                        <TableCell><Badge variant="secondary" className="rounded-none text-[9px] tracking-widest uppercase">{payment.plan}</Badge></TableCell>
                        <TableCell className="text-sm font-light">{payment.amount}</TableCell>
                        <TableCell className="text-sm font-light text-muted-foreground">{payment.date}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'Paid' ? 'default' : payment.status === 'Pending' ? 'secondary' : 'destructive'} className="rounded-none text-[9px] tracking-widest uppercase">{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-light tracking-wider">No data available</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-96 flex-shrink-0">
          <AgentChatPanel
            agentId={ADMIN_INSIGHTS_ID}
            title="Admin Insights"
            placeholder="Ask about revenue trends, user growth, or engagement patterns..."
            isOpen={chatOpen}
            onClose={() => { setChatOpen(false); setActiveAgentId(null) }}
          />
        </div>
      )}
    </div>
  )
}
