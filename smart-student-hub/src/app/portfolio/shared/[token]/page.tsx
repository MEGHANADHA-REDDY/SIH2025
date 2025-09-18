'use client'

import { use, useEffect, useState } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

interface SharedPortfolioPageProps {
  params: Promise<{ token: string }>
}

export default function SharedPortfolioPage({ params }: SharedPortfolioPageProps) {
  const resolved = use(params)
  const token = resolved.token
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/students/portfolio/shared/${token}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Not Available</h2>
          <p className="text-gray-600">{error || 'No data to display'}</p>
          <Link href="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> Home
          </Link>
        </div>
      </div>
    )
  }

  const onPrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-gray-700 font-semibold">Verified Portfolio</div>
          <button onClick={onPrint} className="inline-flex items-center text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.first_name} {data.last_name}</h1>
              <p className="text-gray-600 text-sm">{data.student_id} • {data.department} • Year {data.year_of_study}</p>
              <p className="text-gray-500 text-sm mt-1">{data.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              {data.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">About</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{data.description}</p>
                </div>
              )}
              {data.skills && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Skills</h3>
                  <p className="text-sm text-gray-600">{data.skills}</p>
                </div>
              )}
              {data.linkedin_url && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Links</h3>
                  <div className="text-sm text-blue-600 break-all">
                    <a href={data.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Approved Activities</h2>
                <div className="text-sm text-gray-600">Total: {data.total_activities} • Points: {data.total_points}</div>
              </div>
              <div className="divide-y">
                {data.activities.map((a: any) => (
                  <div key={a.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Approved</span>
                    </div>
                    <p className="text-xs text-gray-500">{a.category_name || a.category} • {new Date(a.approved_at || a.created_at).toLocaleDateString()}</p>
                    {a.description && <p className="text-sm text-gray-700 mt-1">{a.description}</p>}
                    {a.certificate_url && (
                      <a className="text-xs text-blue-600 underline" href={a.certificate_url} target="_blank" rel="noreferrer">View Certificate</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


