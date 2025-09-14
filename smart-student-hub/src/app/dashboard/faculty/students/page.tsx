'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Calendar, 
  Award,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Search,
  Filter,
  Eye,
  Download,
  ArrowLeft,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'

interface Student {
  id: number
  student_number: string
  department: string
  year_of_study: string
  description: string
  tech_stack: string[]
  skills: string[]
  interests: string[]
  career_goals: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  resume_url: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  total_activities: number
  approved_activities: number
  pending_activities: number
  total_points: number
}

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])


  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedDepartment, selectedYear])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No token found')
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/faculty/students-simple', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Ensure data.data is an array
        const studentsArray = Array.isArray(data.data) ? data.data : []
        setStudents(studentsArray)
      } else {
        console.error('Failed to fetch students:', response.status, response.statusText)
        setStudents([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    // Ensure students is an array
    if (!Array.isArray(students)) {
      setFilteredStudents([])
      return
    }

    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDepartment) {
      filtered = filtered.filter(student => student.department === selectedDepartment)
    }

    if (selectedYear) {
      filtered = filtered.filter(student => student.year_of_study === selectedYear)
    }

    setFilteredStudents(filtered)
  }

  const viewStudentProfile = (studentId: number) => {
    router.push(`/profile/${studentId}`)
  }

  const downloadResume = (resumeUrl: string, studentName: string) => {
    if (resumeUrl) {
      const link = document.createElement('a')
      link.href = `http://localhost:5000${resumeUrl}`
      link.download = `${studentName}_Resume.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getDepartments = () => {
    if (!Array.isArray(students)) return []
    return [...new Set(students.map(student => student.department))].filter(Boolean)
  }

  const getYears = () => {
    if (!Array.isArray(students)) return []
    return [...new Set(students.map(student => student.year_of_study))].filter(Boolean).sort()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/faculty')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  All Students
                </h1>
                <p className="text-gray-600">Complete student directory with details</p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-blue-800 font-medium">{filteredStudents.length} Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {getYears().map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedDepartment('')
                setSelectedYear('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Student Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">ID: {student.student_number}</p>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {student.department}
                      </span>
                      <span className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Year {student.year_of_study}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => viewStudentProfile(student.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`mailto:${student.email}`} className="hover:text-blue-600">
                      {student.email}
                    </a>
                  </div>
                  {student.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${student.phone}`} className="hover:text-blue-600">
                        {student.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                {student.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {student.description}
                  </p>
                )}
              </div>

              {/* Skills & Tech Stack */}
              <div className="p-6 border-b border-gray-100">
                {Array.isArray(student.tech_stack) && student.tech_stack.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {student.tech_stack.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {student.tech_stack.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{student.tech_stack.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {Array.isArray(student.skills) && student.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{student.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Statistics */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Activity Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{student.total_activities}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{student.approved_activities}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">{student.total_points}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                </div>
                {student.pending_activities > 0 && (
                  <div className="mt-2 flex items-center justify-center text-xs text-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {student.pending_activities} pending review
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Social Links */}
                  <div className="flex space-x-2">
                    {student.linkedin_url && (
                      <a
                        href={student.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {student.github_url && (
                      <a
                        href={student.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {student.portfolio_url && (
                      <a
                        href={student.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Resume Download */}
                  {student.resume_url && (
                    <button
                      onClick={() => downloadResume(student.resume_url, `${student.first_name}_${student.last_name}`)}
                      className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Resume
                    </button>
                  )}
                </div>

                {/* View Profile Button */}
                <button
                  onClick={() => viewStudentProfile(student.id)}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Complete Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
