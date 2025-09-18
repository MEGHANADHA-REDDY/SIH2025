'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Share2, TrendingUp } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement)

interface Activity {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function StudentAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'student') {
        router.push('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchActivities(token)
    } catch (err) {
      router.push('/login')
    }
  }, [router])

  const fetchActivities = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/students/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setActivities(data.data.activities)
      }
    } catch (err) {
    } finally {
      setIsLoading(false)
    }
  }

  const onShare = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const link = `${origin}/analytics/${user?.studentId || user?.id}`
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // noop
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { approved: 0, pending: 0, rejected: 0 }
    for (const a of activities) counts[a.status] = (counts as any)[a.status] + 1
    return counts
  }, [activities])

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of activities) {
      map.set(a.category || 'Uncategorized', (map.get(a.category || 'Uncategorized') || 0) + 1)
    }
    return map
  }, [activities])

  const uploadsByMonth = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of activities) {
      const d = new Date(a.created_at)
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [activities])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard/student')} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </button>
          <div className="flex items-center text-gray-700">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-semibold">My Activity Analytics</span>
          </div>
          <button onClick={onShare} className={`inline-flex items-center text-sm px-3 py-1.5 rounded-md border ${copied ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Share2 className="h-4 w-4 mr-2" /> {copied ? 'Copied!' : 'Share Analytics'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
              <Pie 
                data={{
                  labels: ['Approved', 'Pending', 'Rejected'],
                  datasets: [{
                    data: [statusCounts.approved, statusCounts.pending, statusCounts.rejected],
                    backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
                    borderWidth: 0
                  }]
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Uploads Over Time</h3>
              <Line 
                data={{
                  labels: uploadsByMonth.map(([k]) => k),
                  datasets: [{
                    label: 'Uploads',
                    data: uploadsByMonth.map(([, v]) => v),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    tension: 0.3,
                    fill: true
                  }]
                }}
                options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
            <Bar 
              data={{
                labels: Array.from(categoryCounts.keys()),
                datasets: [{
                  label: 'Activities',
                  data: Array.from(categoryCounts.values()),
                  backgroundColor: '#0ea5e9'
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Uploads</h3>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No activities yet.</p>
            ) : (
              <div className="divide-y">
                {activities.slice(0, 10).map(a => (
                  <div key={a.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.category || 'Uncategorized'} • {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${
                      a.status === 'approved' ? 'bg-green-100 text-green-800' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


