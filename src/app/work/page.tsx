'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useOperationalStore } from '@/store/operational'
import { getWorkItems, getInitiatives, createWorkItem, updateWorkItem, deleteWorkItem } from '@/lib/api-calls'
import toast from 'react-hot-toast'

export default function WorkPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { workItems, setWorkItems, initiatives } = useOperationalStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    initiative_id: '',
    title: '',
    description: '',
    status: 'backlog',
    priority: 'medium',
    source: '',
    due_date: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const loadData = async () => {
      try {
        const [items, inits] = await Promise.all([
          getWorkItems(user.id),
          getInitiatives(user.id),
        ])
        setWorkItems(items || [])
      } catch (error: any) {
        toast.error('Failed to load work items')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router, setWorkItems])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.initiative_id) {
      toast.error('Please select an initiative')
      return
    }
    try {
      const newItem = await createWorkItem(user.id, {
        initiative_id: formData.initiative_id,
        title: formData.title,
        description: formData.description,
        status: formData.status as any,
        priority: formData.priority as any,
        source: formData.source,
        external_key: null,
        due_date: formData.due_date || null,
      })
      setWorkItems([newItem, ...workItems])
      setFormData({
        initiative_id: '',
        title: '',
        description: '',
        status: 'backlog',
        priority: 'medium',
        source: '',
        due_date: '',
      })
      setShowForm(false)
      toast.success('Work item created')
    } catch (error: any) {
      toast.error('Failed to create work item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    try {
      await deleteWorkItem(user.id, id)
      setWorkItems(workItems.filter(w => w.id !== id))
      toast.success('Work item deleted')
    } catch (error: any) {
      toast.error('Failed to delete work item')
    }
  }

  const filteredItems = filterStatus === 'all' ? workItems : workItems.filter(w => w.status === filterStatus)

  if (!user) return null
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">&larr; Dashboard</a>
            <h1 className="text-2xl font-bold">Work Tracker</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Work Item
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleCreate} className="space-y-4">
              <select
                value={formData.initiative_id}
                onChange={(e) => setFormData({ ...formData, initiative_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select initiative</option>
                {initiatives.map(init => (
                  <option key={init.id} value={init.id}>{init.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {['all', 'backlog', 'in_progress', 'blocked', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-gray-600">No work items</p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">{item.status}</span>
                    {item.due_date && <span className="text-gray-600">{new Date(item.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-4"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
