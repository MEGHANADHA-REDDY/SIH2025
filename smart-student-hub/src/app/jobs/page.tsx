'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  Calendar,
  FileText,
  Send,
  Eye
} from 'lucide-react'

interface JobPosting {
  id: number
  title: string
  description: string
  company: string
  location: string
  job_type: string
  salary_range: string
  requirements: string
  benefits: string
  application_deadline: string
  created_at: string
  recruiter_company: string
  recruiter_designation: string
}

interface JobApplication {
  id: number
  cover_letter: string
  resume_url: string
  status: string
  applied_at: string
  job_title: string
  company: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    setUserRole(role)
    fetchJobs()
    if (role === 'student') {
      fetchMyApplications()
    }
  }, [router])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/jobs/active')
      
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobPostings)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/jobs/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const handleApply = (job: JobPosting) => {
    setSelectedJob(job)
    setShowApplicationModal(true)
  }

  const handleSubmitApplication = async (applicationData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/jobs/${selectedJob?.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        alert('Application submitted successfully!')
        setShowApplicationModal(false)
        setSelectedJob(null)
        fetchMyApplications()
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'hired': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
              <p className="text-gray-600">Find and apply for exciting career opportunities</p>
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
        {/* My Applications Section (for students) */}
        {userRole === 'student' && applications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Applications</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.job_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.company}
                          </div>
                          <div className="text-sm text-gray-500">
                            Applied on: {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Available Jobs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.job_type}
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary_range}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                          {job.application_deadline && (
                            <>
                              <span className="mx-2">•</span>
                              <Clock className="h-4 w-4 mr-1" />
                              Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                            </>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedJob(job)
                              setShowApplicationModal(true)
                            }}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          {userRole === 'student' && (
                            <button
                              onClick={() => handleApply(job)}
                              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {jobs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
              <p className="text-gray-600">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showApplicationModal && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          userRole={userRole}
          onClose={() => {
            setShowApplicationModal(false)
            setSelectedJob(null)
          }}
          onSubmitApplication={handleSubmitApplication}
        />
      )}
    </div>
  )
}

// Job Details Modal Component
function JobDetailsModal({ 
  job, 
  userRole, 
  onClose, 
  onSubmitApplication 
}: { 
  job: JobPosting, 
  userRole: string | null, 
  onClose: () => void, 
  onSubmitApplication: (data: any) => void 
}) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeUrl: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitApplication(applicationData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {!showApplicationForm ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {job.company}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.job_type}
                </div>
                {job.salary_range && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary_range}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.requirements && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}

            {job.benefits && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                <div>Posted: {new Date(job.created_at).toLocaleDateString()}</div>
                {job.application_deadline && (
                  <div>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</div>
                )}
                <div>Recruiter: {job.recruiter_company}</div>
              </div>
              
              {userRole === 'student' && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply for this job
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Apply for {job.title}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Write your cover letter here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume URL (optional)
                </label>
                <input
                  type="url"
                  value={applicationData.resumeUrl}
                  onChange={(e) => setApplicationData({...applicationData, resumeUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/resume.pdf"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Back to Details
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
