'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Eye, 
  Users, 
  FileText,
  BarChart3,
  UserPlus
} from 'lucide-react'
import { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement)

interface Recruiter {
  id: number
  email: string
  first_name: string
  last_name: string
  company: string
  designation: string
  industry: string
  is_active: boolean
  created_at: string
}

interface JobPosting {
    id: number
    title: string
  company: string
  location: string
  job_type: string
  salary_range: string
  application_deadline: string
  is_active: boolean
    created_at: string
  admin_name: string
  recruiter_company: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/login')
      return
    }
  }, [router])

  // Fetch data
  useEffect(() => {
    if (activeTab === 'recruiters') {
      fetchRecruiters()
    } else if (activeTab === 'jobs') {
      fetchJobPostings()
    }
  }, [activeTab])

  const fetchRecruiters = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin-management/recruiters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecruiters(data.recruiters)
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobPostings = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin-management/job-postings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setJobPostings(data.jobPostings)
      }
    } catch (error) {
      console.error('Error fetching job postings:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleCreateJobPosting = async (jobData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin-management/create-job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.recruiterCreated) {
          alert(`Job posting created successfully!\n\nNew recruiter account created:\nUsername: ${data.recruiterCredentials.username}\nPassword: ${data.recruiterCredentials.password}`)
        } else {
          alert('Job posting created successfully!')
        }
        setShowCreateJob(false)
        fetchJobPostings()
        fetchRecruiters()
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Error creating job posting:', error)
      alert('Error creating job posting')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'recruiters', label: 'Recruiters', icon: Building2 },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage recruiters and job postings</p>
              </div>
              <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('userRole')
                router.push('/login')
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
              </button>
          </div>
        </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
            </button>
              )
            })}
          </nav>
          </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Recruiters</p>
                    <p className="text-2xl font-bold text-gray-900">{recruiters.length}</p>
                  </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Job Postings</p>
                    <p className="text-2xl font-bold text-gray-900">{jobPostings.filter(job => job.is_active).length}</p>
                  </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <button
                  onClick={() => setShowCreateJob(true)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-8 w-8 text-green-600 mr-4" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Create Job Posting</p>
                    <p className="text-sm text-gray-600">Post a new job opportunity</p>
                </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Institutional Analytics & NAAC Export</h2>
            <AdminAnalyticsPanel />
          </div>
        )}

        {/* Recruiters Tab */}
        {activeTab === 'recruiters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Recruiters Management</h2>
              <p className="text-sm text-gray-600">Recruiters are automatically created when job postings are made</p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading recruiters...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {recruiters.map((recruiter) => (
                    <li key={recruiter.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
              <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                </div>
                <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {recruiter.first_name} {recruiter.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {recruiter.company} • {recruiter.designation}
                            </div>
                            <div className="text-sm text-gray-500">
                              {recruiter.industry} • {recruiter.email}
                </div>
              </div>
            </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            recruiter.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {recruiter.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Eye className="h-5 w-5" />
                          </button>
                </div>
                </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Postings Management</h2>
              <button
                onClick={() => setShowCreateJob(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Job Posting
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading job postings...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {jobPostings.map((job) => (
                    <li key={job.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-green-600" />
            </div>
          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {job.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.company} • {job.location}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.job_type} • {job.salary_range}
                            </div>
                            <div className="text-sm text-gray-500">
                              Recruiter: {job.recruiter_company}
                            </div>
              </div>
            </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                </div>
            )}
                </div>
              )}
            </div>


      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobModal
          onClose={() => setShowCreateJob(false)}
          onSubmit={handleCreateJobPosting}
        />
      )}
    </div>
  )
}
function AdminAnalyticsPanel() {
  const [type, setType] = useState<'overview' | 'department' | 'activities'>('overview')
  const [department, setDepartment] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presets, setPresets] = useState<Array<{name: string, type: string, department?: string, startDate?: string, endDate?: string}>>([])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.set('type', type)
      if (department) params.set('department', department)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await fetch(`http://localhost:5000/api/admin/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const json = await res.json()
      setData(json.data)
    } catch (e) {
      alert('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.set('type', type)
      if (department) params.set('department', department)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await fetch(`http://localhost:5000/api/admin/reports/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_report.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to export CSV')
    }
  }

  const scheduleExport = async () => {
    try {
      const token = localStorage.getItem('token')
      const email = prompt('Enter email to receive report:') || ''
      const cronExpr = prompt('Enter CRON (e.g., 0 8 * * 1 for Mondays 8am):') || ''
      if (!email || !cronExpr) return
      const res = await fetch('http://localhost:5000/api/admin/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ cronExpr, type, department, startDate, endDate, email })
      })
      const json = await res.json()
      alert(json.message || 'Scheduled')
    } catch (e) {
      alert('Failed to schedule export')
    }
  }

  // Presets (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_report_presets')
      if (raw) setPresets(JSON.parse(raw))
    } catch {}
  }, [])

  const savePreset = () => {
    const newPreset = { name: presetName || `${type}-${Date.now()}`, type, department, startDate, endDate }
    const next = [...presets, newPreset]
    setPresets(next)
    localStorage.setItem('admin_report_presets', JSON.stringify(next))
    setPresetName('')
  }

  const loadPreset = (p: any) => {
    setType(p.type)
    setDepartment(p.department || '')
    setStartDate(p.startDate || '')
    setEndDate(p.endDate || '')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Report Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border rounded px-2 py-2">
            <option value="overview">Overview</option>
            <option value="department">By Department</option>
            <option value="activities">Activities Breakdown</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Department (optional)</label>
          <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full border rounded px-2 py-2" placeholder="e.g., CSE" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded px-2 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded px-2 py-2" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={fetchReport} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Report</button>
        <button onClick={exportCsv} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Download NAAC CSV</button>
        <button onClick={scheduleExport} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Schedule Email Export</button>
        <div className="flex items-center gap-2 ml-auto">
          <input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name" className="border rounded px-2 py-2" />
          <button onClick={savePreset} className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">Save Preset</button>
          {presets.length > 0 && (
            <select onChange={(e) => { const idx = Number(e.target.value); if (!isNaN(idx)) loadPreset(presets[idx]) }} className="border rounded px-2 py-2">
              <option value="">Load Preset...</option>
              {presets.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Generating report...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {type === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded p-4">
                <h4 className="text-sm font-semibold mb-2">Activities Status</h4>
                <Pie data={{
                  labels: ['Approved', 'Pending', 'Rejected'],
                  datasets: [{
                    data: [Number(data.approved_activities||0), Number(data.pending_activities||0), Number(data.rejected_activities||0)],
                    backgroundColor: ['#22c55e','#facc15','#ef4444']
                  }]
                }} options={{ plugins: { legend: { position: 'bottom' } } }} />
              </div>
              <div className="bg-white border rounded p-4 lg:col-span-2">
                <h4 className="text-sm font-semibold mb-2">Monthly Trends (last 12 months)</h4>
                <MonthlyTrendsChart />
              </div>
            </div>
          )}

          {type === 'department' && Array.isArray(data) && (
            <div className="bg-white border rounded p-4">
              <h4 className="text-sm font-semibold mb-2">Activities by Department</h4>
              <Bar data={{
                labels: data.map((d:any)=>d.department||'N/A'),
                datasets: [{
                  label: 'Activities',
                  data: data.map((d:any)=>Number(d.activity_count||0)),
                  backgroundColor: '#0ea5e9'
                },{
                  label: 'Approved',
                  data: data.map((d:any)=>Number(d.approved_count||0)),
                  backgroundColor: '#22c55e'
                }]
              }} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          )}

          {type === 'activities' && Array.isArray(data) && (
            <div className="bg-white border rounded p-4">
              <h4 className="text-sm font-semibold mb-2">Activities by Category</h4>
              <Bar data={{
                labels: data.map((d:any)=>d.category||'N/A'),
                datasets: [{
                  label: 'Total',
                  data: data.map((d:any)=>Number(d.total_count||0)),
                  backgroundColor: '#6366f1'
                },{
                  label: 'Approved',
                  data: data.map((d:any)=>Number(d.approved_count||0)),
                  backgroundColor: '#22c55e'
                },{
                  label: 'Pending',
                  data: data.map((d:any)=>Number(d.pending_count||0)),
                  backgroundColor: '#facc15'
                },{
                  label: 'Rejected',
                  data: data.map((d:any)=>Number(d.rejected_count||0)),
                  backgroundColor: '#ef4444'
                }]
              }} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          )}

          <div className="bg-gray-50 border rounded p-3">
            <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <p className="text-sm">Run a report to see results.</p>
      )}
    </div>
  )
}

function MonthlyTrendsChart() {
  const [series, setSeries] = useState<{ labels: string[], total: number[], approved: number[] }>({ labels: [], total: [], approved: [] })

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
        const json = await res.json()
        const rows = json?.data?.monthlyTrends || []
        setSeries({
          labels: rows.map((r:any)=> new Date(r.month).toLocaleDateString(undefined,{ year:'2-digit', month:'short'})),
          total: rows.map((r:any)=> Number(r.activity_count||0)),
          approved: rows.map((r:any)=> Number(r.approved_count||0))
        })
      } catch {}
    }
    load()
  }, [])

  return (
    <Line data={{
      labels: series.labels,
      datasets: [{ label: 'Total', data: series.total, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.2)', tension: 0.3, fill: true }, { label: 'Approved', data: series.approved, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', tension: 0.3, fill: true }]
    }} options={{ plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
  )
}


// Create Job Modal Component
function CreateJobModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    jobType: '',
    salaryRange: '',
    requirements: '',
    benefits: '',
    applicationDeadline: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Job Posting</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Job Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
          <textarea
            placeholder="Job Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            rows={3}
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Type"
              value={formData.jobType}
              onChange={(e) => setFormData({...formData, jobType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <input
              type="text"
              placeholder="Salary Range"
              value={formData.salaryRange}
              onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <textarea
            placeholder="Requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            rows={2}
          />
          <textarea
            placeholder="Benefits"
            value={formData.benefits}
            onChange={(e) => setFormData({...formData, benefits: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            rows={2}
          />
          <input
            type="date"
            placeholder="Application Deadline"
            value={formData.applicationDeadline}
            onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A recruiter account will be automatically created for this company if one doesn't already exist.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Job Posting
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}