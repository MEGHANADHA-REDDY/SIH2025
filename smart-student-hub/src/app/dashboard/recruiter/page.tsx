'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Eye, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building,
  Calendar,
  Mail,
  Phone,
  Star,
  Award,
  Linkedin,
  Github,
  Globe
} from 'lucide-react'

interface JobApplication {
  id: number
  job_title: string
  company: string
  student_id: string
  student_name: string
  student_email: string
  student_department: string
  student_year: number
  student_cgpa: number
  cover_letter: string
  resume_url: string
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  applied_at: string
  updated_at: string
}

interface StudentProfile {
  id: number
  user_id: number
  student_id: string
  department: string
  year_of_study: number
  cgpa: number
  attendance_percentage: number
  description: string
  tech_stack: string
  skills: string
  interests: string
  career_goals: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  resume_url: string
  first_name: string
  last_name: string
  email: string
  phone: string
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
}

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<number | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<StudentProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'recruiter') {
        router.push('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchRecruiterData(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const fetchRecruiterData = async (token: string) => {
    try {
      setIsLoading(true)
      
      // Fetch job postings for this recruiter
      const jobPostingsResponse = await fetch('http://localhost:5000/api/jobs/recruiter-postings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (jobPostingsResponse.ok) {
        const jobPostingsData = await jobPostingsResponse.json()
        setJobPostings(jobPostingsData.data || [])
        
        // If there are job postings, fetch applications for the first one
        if (jobPostingsData.data && jobPostingsData.data.length > 0) {
          setSelectedJob(jobPostingsData.data[0].id)
          fetchJobApplications(token, jobPostingsData.data[0].id)
        }
      }

    } catch (error) {
      console.error('Error fetching recruiter data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobApplications = async (token: string, jobId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/applications/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setJobApplications(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching job applications:', error)
    }
  }

  const handleJobSelect = (jobId: number) => {
    setSelectedJob(jobId)
    const token = localStorage.getItem('token')
    if (token) {
      fetchJobApplications(token, jobId)
    }
  }

  const handleApplicationStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/jobs/update-application-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Update the local state
        setJobApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus as any, updated_at: new Date().toISOString() }
              : app
          )
        )
        alert(`Application status updated to ${newStatus}`)
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Error updating application status')
    }
  }

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
  }

  const handleViewStudentProfile = async (application: JobApplication) => {
    try {
      setProfileLoading(true)
      const token = localStorage.getItem('token')
      
      // Extract student ID from the application
      const studentId = application.student_id
      const applicationId = application.id
      
      const response = await fetch(`http://localhost:5000/api/jobs/student-profile/${studentId}/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedStudentProfile(data.data.student)
        setShowProfileModal(true)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to fetch student profile')
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
      alert('Error fetching student profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleDownloadResume = (resumeUrl: string, studentName: string) => {
    if (resumeUrl) {
      // Create a temporary link to download the file
      const link = document.createElement('a')
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = resumeUrl.startsWith('/') ? resumeUrl.substring(1) : resumeUrl
      link.href = `http://localhost:5000/${cleanUrl}`
      link.download = `${studentName}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('No resume available for this student')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Job Postings Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Job Postings</h2>
            {jobPostings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobPostings.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob === job.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings</h3>
                <p className="text-gray-500">You don't have any job postings yet.</p>
              </div>
            )}
          </div>

          {/* Applications */}
          {selectedJob && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Job Applications</h2>
                <p className="text-sm text-gray-600">
                  {jobApplications.length} application{jobApplications.length !== 1 ? 's' : ''} received
                </p>
              </div>

              {jobApplications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {jobApplications.map((application) => (
                    <div key={application.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {application.student_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {application.student_id} • {application.student_department} • Year {application.student_year}
                              </p>
                              <p className="text-sm text-gray-500">
                                CGPA: {application.student_cgpa} • Applied: {new Date(application.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          
                          <button
                            onClick={() => handleViewStudentProfile(application)}
                            disabled={profileLoading}
                            className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            {profileLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
                            ) : (
                              <User className="h-4 w-4 mr-1" />
                            )}
                            View Profile
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleApplicationStatusUpdate(application.id, 'shortlisted')}
                          className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                          className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApplicationStatusUpdate(application.id, 'hired')}
                          className="flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 rounded"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Hire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500">No students have applied for this job posting.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedApplication.student_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-medium">{selectedApplication.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.student_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{selectedApplication.student_department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year of Study</p>
                      <p className="font-medium">Year {selectedApplication.student_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CGPA</p>
                      <p className="font-medium">{selectedApplication.student_cgpa}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cover Letter</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.cover_letter || 'No cover letter provided.'}
                  </p>
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resume_url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Resume</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a
                      href={`http://localhost:5000/${selectedApplication.resume_url.startsWith('/') ? selectedApplication.resume_url.substring(1) : selectedApplication.resume_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApplicationStatusUpdate(selectedApplication.id, 'shortlisted')
                      setShowApplicationModal(false)
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Shortlist
                  </button>
                  <button
                    onClick={() => {
                      handleApplicationStatusUpdate(selectedApplication.id, 'rejected')
                      setShowApplicationModal(false)
                    }}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApplicationStatusUpdate(selectedApplication.id, 'hired')
                      setShowApplicationModal(false)
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Hire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudentProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Complete Student Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedStudentProfile.first_name} {selectedStudentProfile.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-medium">{selectedStudentProfile.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudentProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedStudentProfile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{selectedStudentProfile.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year of Study</p>
                    <p className="font-medium">Year {selectedStudentProfile.year_of_study}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CGPA</p>
                    <p className="font-medium">{selectedStudentProfile.cgpa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="font-medium">{selectedStudentProfile.attendance_percentage}%</p>
                  </div>
                </div>
              </div>

              {/* About Me */}
              {selectedStudentProfile.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">About Me</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentProfile.description}</p>
                </div>
              )}

              {/* Technical Skills */}
              {selectedStudentProfile.tech_stack && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Technical Skills</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentProfile.tech_stack}</p>
                </div>
              )}

              {/* Additional Skills */}
              {selectedStudentProfile.skills && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Skills & Competencies</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentProfile.skills}</p>
                </div>
              )}

              {/* Interests */}
              {selectedStudentProfile.interests && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Interests & Hobbies</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentProfile.interests}</p>
                </div>
              )}

              {/* Career Goals */}
              {selectedStudentProfile.career_goals && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Career Goals</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudentProfile.career_goals}</p>
                </div>
              )}

              {/* Online Presence */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Online Presence</h4>
                <div className="space-y-2">
                  {selectedStudentProfile.linkedin_url && (
                    <div className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                      <a href={selectedStudentProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {selectedStudentProfile.github_url && (
                    <div className="flex items-center">
                      <Github className="h-4 w-4 mr-2 text-gray-800" />
                      <a href={selectedStudentProfile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {selectedStudentProfile.portfolio_url && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-purple-600" />
                      <a href={selectedStudentProfile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        Portfolio Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Download */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Resume</h4>
                {selectedStudentProfile.resume_url ? (
                  <button
                    onClick={() => handleDownloadResume(selectedStudentProfile.resume_url, `${selectedStudentProfile.first_name}_${selectedStudentProfile.last_name}`)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </button>
                ) : (
                  <p className="text-gray-500">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}