'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useOperationalStore } from '@/store/operational'
import { getUpdates, getInitiatives, getWorkItems, getNotes, createUpdate, logAiUsage, getUserAiAllowance } from '@/lib/api-calls'
import toast from 'react-hot-toast'

export default function UpdatesPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { updates, setUpdates, initiatives, workItems, notes } = useOperationalStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [allowance, setAllowance] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const loadData = async () => {
      try {
        const [updatesData, inits, items, notesData, userAllowance] = await Promise.all([
          getUpdates(user.id),
          getInitiatives(user.id),
          getWorkItems(user.id),
          getNotes(user.id),
          getUserAiAllowance(user.id),
        ])
        setUpdates(updatesData || [])
        setAllowance(userAllowance)
      } catch (error: any) {
        toast.error('Failed to load updates')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router, setUpdates])

  const handleGenerateUpdate = async () => {
    if (!user) return

    if (!allowance || allowance.used >= allowance.total_allowance) {
      toast.error('AI allowance exhausted')
      return
    }

    setIsGenerating(true)
    try {
      // Collect real operational data for AI context
      const aiContext = {
        initiatives: initiatives.filter(i => i.status === 'active' || i.status === 'planning'),
        workItems: workItems.slice(0, 10),
        notes: notes.filter(n => n.include_in_ai_summary).slice(0, 5),
      }

      // Simulate AI generation (would call OpenAI in production)
      const prompt = `Generate a brief stakeholder update based on this operational context:\n\nInitiatives: ${JSON.stringify(aiContext.initiatives.map(i => ({ name: i.name, status: i.status })))}\n\nRecent work: ${JSON.stringify(aiContext.workItems.map(w => ({ title: w.title, status: w.status })))}`

      // In production, this would call OpenAI
      const mockUpdate = {
        title: `Stakeholder Update - ${new Date().toLocaleDateString()}`,
        body: `Status update: We have ${initiatives.length} active initiatives with ${workItems.filter(w => w.status === 'in_progress').length} items in progress. Key focus areas remain on schedule.`,
      }

      const newUpdate = await createUpdate(user.id, {
        update_type: 'ai_generated',
        title: mockUpdate.title,
        body: mockUpdate.body,
        is_ai_generated: true,
        initiative_id: null,
        work_item_id: null,
      })

      // Log AI usage
      await logAiUsage(user.id, {
        action_type: 'generate_update',
        status: 'success',
        model: 'gpt-4',
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: Math.ceil(mockUpdate.body.length / 4),
        total_tokens: Math.ceil((prompt.length + mockUpdate.body.length) / 4),
      })

      setUpdates([newUpdate, ...updates])
      setAllowance({
        ...allowance,
        used: allowance.used + 1,
      })
      toast.success('Update generated successfully')
    } catch (error: any) {
      toast.error('Failed to generate update')
      await logAiUsage(user.id, {
        action_type: 'generate_update',
        status: 'failed',
        model: 'gpt-4',
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        error_message: error.message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!user) return null
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  const remaining = allowance ? allowance.total_allowance - allowance.used : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">&larr; Dashboard</a>
            <h1 className="text-2xl font-bold">Updates</h1>
          </div>
          <button
            onClick={handleGenerateUpdate}
            disabled={isGenerating || remaining <= 0}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate AI Update'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <p className="text-sm text-gray-600">
            AI allowance: <span className="font-semibold text-blue-600">{remaining}</span> / {allowance?.total_allowance || 0} remaining
          </p>
        </div>

        <div className="space-y-4">
          {updates.length === 0 ? (
            <p className="text-gray-600">No updates yet</p>
          ) : (
            updates.map(update => (
              <div key={update.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      {update.is_ai_generated && (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">AI Generated</span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{update.body}</p>
                    <p className="text-xs text-gray-500 mt-3">{new Date(update.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
