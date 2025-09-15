import Link from 'next/link'
import Image from 'next/image'
import { 
  BookOpen, 
  Award, 
  Users, 
  BarChart3, 
  Shield, 
  Download,
  CheckCircle,
  Upload,
  Eye,
  TrendingUp,
  GraduationCap,
  FileText,
  Clock,
  Star,
  Sparkles,
  Zap,
  Rocket,
  ArrowRight,
  Play,
  ChevronDown
} from 'lucide-react'
import heroImage from '../images/WhatsApp Image 2025-09-15 at 23.14.22_0ed1ac71.jpg'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Glassmorphism Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Smart Student Hub
              </span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/50 backdrop-blur-sm border border-transparent hover:border-gray-200">
                Login
              </Link>
              <Link href="/login" className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simplified */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Smart Student Hub</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Build and showcase your achievements in one simple, beautiful place. Track activities,
            get faculty validation, and generate a verified portfolio.
          </p>
          <div className="flex justify-center gap-4 mb-10">
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Get Started
            </Link>
            <Link href="#features" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
              Learn More
            </Link>
          </div>
          <div className="relative mx-auto rounded-2xl shadow-lg overflow-hidden">
            {/* Top gradient overlay starting slightly above the image */}
            <div className="pointer-events-none absolute -top-6 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/30 via-blue-500/15 to-transparent"></div>
            <Image src={heroImage} alt="Product preview" className="w-full h-auto object-cover" priority />
          </div>
        </div>
      </section>

      

      {/* Key Features - Simple */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Features that keep things organized</h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">Clean tools to manage, track, and showcase achievements</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="relative bg-white p-6 rounded-2xl border shadow-sm hover:shadow transition">
                <div className="relative w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-white">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Dashboard</h3>
                <p className="text-gray-600 text-sm">Track performance, attendance, and credits at a glance.</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="relative bg-white p-6 rounded-2xl border shadow-sm hover:shadow transition">
                <div className="relative w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Tracker</h3>
                <p className="text-gray-600 text-sm">Upload and validate seminars, MOOCs, internships, and more.</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="relative bg-white p-6 rounded-2xl border shadow-sm hover:shadow transition">
                <div className="relative w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 text-white">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Faculty Approval</h3>
                <p className="text-gray-600 text-sm">Keep records verified and credible with faculty reviews.</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-purple-200/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-purple-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Digital Portfolio</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Auto-generated, downloadable, and shareable verified student portfolio in PDF or web link format</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-green-200/50 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-green-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reporting</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Generate reports for NAAC, AICTE, NIRF, or internal evaluations with comprehensive data insights</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-indigo-200/50 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-blue-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Integration Support</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Seamlessly link with existing Learning Management Systems (LMS), ERP, or digital university platforms</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive minimal */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">Follow four simple steps to build a verified portfolio</p>
          </div>

          {/* Progress line */}
          <div className="hidden lg:block relative mb-10">
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="group relative">
              <div className="flex flex-col items-center text-center bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="hidden lg:block absolute -z-10 left-1/2 -translate-x-1/2 top-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-blue-100 border-r-8 border-r-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </div>
                <h3 className="mt-4 text-base md:text-lg font-semibold text-gray-900">Sign Up & Profile</h3>
                <p className="mt-2 text-sm text-gray-600">Create your account and fill basic profile details.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="group relative">
              <div className="flex flex-col items-center text-center bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">2</div>
                  <div className="hidden lg:block absolute -z-10 left-1/2 -translate-x-1/2 top-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-green-100 border-r-8 border-r-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </div>
                <h3 className="mt-4 text-base md:text-lg font-semibold text-gray-900">Upload Activities</h3>
                <p className="mt-2 text-sm text-gray-600">Add certificates and achievements with documents.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="group relative">
              <div className="flex flex-col items-center text-center bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                  <div className="hidden lg:block absolute -z-10 left-1/2 -translate-x-1/2 top-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-purple-100 border-r-8 border-r-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </div>
                <h3 className="mt-4 text-base md:text-lg font-semibold text-gray-900">Faculty Validation</h3>
                <p className="mt-2 text-sm text-gray-600">Get records reviewed and approved by faculty.</p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="group relative">
              <div className="flex flex-col items-center text-center bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">4</div>
                  <div className="hidden lg:block absolute -z-10 left-1/2 -translate-x-1/2 top-6 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-orange-100 border-r-8 border-r-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </div>
                <h3 className="mt-4 text-base md:text-lg font-semibold text-gray-900">Generate Portfolio</h3>
                <p className="mt-2 text-sm text-gray-600">Download a verified PDF or share a web link.</p>
              </div>
            </div>
          </div>

          {/* Subtle scroll-reveal hint (no JS, just utility animation) */}
          <div className="mt-10 text-center text-xs text-gray-400">Scroll to explore more ↓</div>
        </div>
      </section>

      {/* Benefits - Simple */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Impact & Benefits</h2>
            <p className="text-sm md:text-base text-blue-100 max-w-3xl mx-auto">
              Empowering students, faculty, and institutions with comprehensive achievement management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Verified holistic digital profile</li>
                <li>• Better placement opportunities</li>
                <li>• Streamlined scholarship applications</li>
                <li>• Career planning support</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Faculty</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Real-time student tracking</li>
                <li>• Simplified approval process</li>
                <li>• Enhanced mentoring capabilities</li>
                <li>• Reduced administrative workload</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Award className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Institutions</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Streamlined accreditation process</li>
                <li>• Data-driven decision making</li>
                <li>• Reduced paperwork and errors</li>
                <li>• Enhanced institutional reputation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-sm md:text-base text-blue-100 mb-8">Join students and institutions using Smart Student Hub today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">Get Started</Link>
            <Link href="#features" className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white/10">See Features</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-6">
                <span className="text-2xl font-bold text-white">
                  Smart Student Hub
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Centralized student achievement management platform for modern educational institutions.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold text-xs">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Dynamic Dashboard</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Activity Tracker</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Faculty Approval</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Digital Portfolio</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Analytics & Reporting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Contact Support</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">Training Resources</li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">API Reference</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  support@smartstudenthub.com
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Education Tech Center
                </li>
              </ul>
              
              <div className="mt-6">
                <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-105">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                &copy; 2024 Smart Student Hub. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-gray-400 text-sm">
                <span className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</span>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</span>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">Cookie Policy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
