'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useOperationalStore } from '@/store/operational'
import { getInitiatives, getWorkItems, getNotes, getUpdates, getUserAiAllowance } from '@/lib/api-calls'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { initiatives, setInitiatives, workItems, setWorkItems, notes, setNotes, updates, setUpdates, aiAllowanceRemaining, setAiAllowanceRemaining } = useOperationalStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const loadData = async () => {
      try {
        const [inits, items, notesData, updatesData, allowance] = await Promise.all([
          getInitiatives(user.id),
          getWorkItems(user.id),
          getNotes(user.id),
          getUpdates(user.id),
          getUserAiAllowance(user.id),
        ])
        
        setInitiatives(inits || [])
        setWorkItems(items || [])
        setNotes(notesData || [])
        setUpdates(updatesData || [])
        
        if (allowance) {
          setAiAllowanceRemaining(allowance.total_allowance - allowance.used)
        }
      } catch (error: any) {
        toast.error('Failed to load dashboard data')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router, setInitiatives, setWorkItems, setNotes, setUpdates, setAiAllowanceRemaining])

  if (!user) return null
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  const blockedItems = workItems.filter(w => w.status === 'blocked')
  const dueItems = workItems.filter(w => {
    if (!w.due_date) return false
    const daysUntilDue = Math.ceil((new Date(w.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilDue <= 7 && daysUntilDue > 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PMDASH</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => router.push('/settings')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active Initiatives</div>
            <div className="text-3xl font-bold">{initiatives.filter(i => i.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-3xl font-bold">{workItems.filter(w => w.status === 'in_progress').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Blocked Items</div>
            <div className="text-3xl font-bold text-red-600">{blockedItems.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">AI Allowance Remaining</div>
            <div className="text-3xl font-bold">{aiAllowanceRemaining}</div>
          </div>
        </div>

        {/* Attention Areas */}
        <div className="grid grid-cols-2 gap-8">
          {/* Blocked Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Items Requiring Attention</h2>
            {blockedItems.length === 0 ? (
              <p className="text-sm text-gray-600">No blocked items</p>
            ) : (
              <ul className="space-y-2">
                {blockedItems.map(item => (
                  <li key={item.id} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Due Soon */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Due This Week</h2>
            {dueItems.length === 0 ? (
              <p className="text-sm text-gray-600">Nothing due this week</p>
            ) : (
              <ul className="space-y-2">
                {dueItems.map(item => (
                  <li key={item.id} className="text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
          {updates.length === 0 ? (
            <p className="text-sm text-gray-600">No updates yet</p>
          ) : (
            <ul className="space-y-3">
              {updates.slice(0, 5).map(update => (
                <li key={update.id} className="border-l-4 border-blue-400 pl-4 py-2">
                  <p className="font-medium text-sm">{update.title}</p>
                  <p className="text-xs text-gray-600">{new Date(update.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <a href="/roadmap" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg">
            <div className="text-lg font-semibold">Roadmap</div>
            <div className="text-sm text-gray-600">{initiatives.length} initiatives</div>
          </a>
          <a href="/work" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg">
            <div className="text-lg font-semibold">Work Tracker</div>
            <div className="text-sm text-gray-600">{workItems.length} items</div>
          </a>
          <a href="/notes" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg">
            <div className="text-lg font-semibold">Knowledge Base</div>
            <div className="text-sm text-gray-600">{notes.length} notes</div>
          </a>
          <a href="/updates" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg">
            <div className="text-lg font-semibold">Updates</div>
            <div className="text-sm text-gray-600">{updates.length} updates</div>
          </a>
        </div>
      </main>
    </div>
  )
}
