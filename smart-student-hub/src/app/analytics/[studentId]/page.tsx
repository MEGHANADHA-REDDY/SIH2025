'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Share2, TrendingUp } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'
import Link from 'next/link'

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement)

interface PublicAnalyticsPageProps {
  params: Promise<{ studentId: string }>
}

export default function PublicAnalyticsPage({ params }: PublicAnalyticsPageProps) {
  const resolved = use(params)
  const studentId = resolved.studentId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/students/analytics/${studentId}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [studentId])

  const status = useMemo(() => {
    const map: Record<string, number> = { approved: 0, pending: 0, rejected: 0 }
    for (const row of data?.statusCounts || []) map[row.status] = row.count
    return map
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Not Available</h2>
          <p className="text-gray-600">{error || 'No data to display'}</p>
          <Link href="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Home
          </Link>
          <div className="flex items-center text-gray-700">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-semibold">Student Activity Analytics</span>
          </div>
          <div />
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
                    data: [status.approved, status.pending, status.rejected],
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
                  labels: (data.uploadsByMonth || []).map((r: any) => r.month),
                  datasets: [{
                    label: 'Uploads',
                    data: (data.uploadsByMonth || []).map((r: any) => r.count),
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
                labels: (data.categoryCounts || []).map((r: any) => r.category),
                datasets: [{
                  label: 'Activities',
                  data: (data.categoryCounts || []).map((r: any) => r.count),
                  backgroundColor: '#0ea5e9'
                }]
              }}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Uploads</h3>
            {(!data.recentActivities || data.recentActivities.length === 0) ? (
              <p className="text-gray-500 text-sm">No activities yet.</p>
            ) : (
              <div className="divide-y">
                {data.recentActivities.slice(0, 10).map((a: any) => (
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


