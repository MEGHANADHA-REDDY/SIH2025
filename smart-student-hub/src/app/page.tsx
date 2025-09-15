import Link from 'next/link'
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Spectacular Background Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-300/20 to-indigo-400/20 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl rotate-45 animate-float"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl rotate-12 animate-float-delayed"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-full animate-float"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative">
                <GraduationCap className="h-12 w-12 text-blue-600" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </div>
              <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
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

      {/* Hero Section - SPECTACULAR */}
      <section className="relative z-10 py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Epic Floating Elements */}
          <div className="absolute -top-10 left-10 animate-float">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400/40 to-indigo-600/40 rounded-3xl rotate-12 backdrop-blur-sm border border-white/20 shadow-2xl"></div>
          </div>
          <div className="absolute top-20 right-20 animate-float-delayed">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400/40 to-purple-600/40 rounded-2xl rotate-45 backdrop-blur-sm border border-white/20 shadow-xl"></div>
          </div>
          <div className="absolute -bottom-10 left-32 animate-float">
            <Sparkles className="w-12 h-12 text-blue-500 opacity-60 drop-shadow-lg" />
          </div>
          <div className="absolute top-1/3 right-10 animate-float-delayed">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-ping"></div>
          </div>

          {/* Stunning Badge */}
          <div className="mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full border border-blue-300/30 backdrop-blur-xl shadow-2xl mb-8 hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-blue-600 mr-3 animate-pulse" />
              <span className="font-bold text-base bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">✨ Transform Your Academic Journey</span>
              <Zap className="w-5 h-5 text-indigo-600 ml-3 animate-pulse delay-500" />
            </div>
          </div>

          {/* MASSIVE Hero Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-tight relative">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent drop-shadow-2xl">
              Centralized
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent animate-gradient drop-shadow-2xl relative">
              Student Hub
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-2xl -z-10"></div>
            </span>
            
            {/* Epic decorative elements around title */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-30 animate-pulse delay-1000"></div>
          </h1>
          
          {/* Stunning Description */}
          <p className="text-2xl md:text-3xl text-gray-700 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
            Transform scattered student records into a{' '}
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              comprehensive digital portfolio
            </span>
            . Track achievements, validate accomplishments, and generate verified portfolios for academic and career success.
          </p>
          
          {/* Epic CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <Link href="/login" className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all transform hover:scale-110 shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce relative z-10" />
              <span className="relative z-10">Start Building Portfolio</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform relative z-10" />
            </Link>
            
            <Link href="#features" className="group relative border-3 border-blue-600 text-blue-700 px-12 py-6 rounded-2xl text-xl font-bold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center backdrop-blur-sm bg-white/50">
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Watch Demo
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            </Link>
          </div>

          {/* Animated Scroll Indicator */}
          <div className="animate-bounce">
            <div className="inline-flex flex-col items-center">
              <span className="text-gray-500 text-sm font-medium mb-2">Discover More</span>
              <ChevronDown className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - MAGNIFICENT */}
      <section className="relative py-32 bg-gradient-to-r from-white via-blue-50/50 to-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200/50 backdrop-blur-sm mb-8">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-semibold">Trusted Worldwide</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              Leading Institutions Choose Us
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of students and hundreds of institutions already transforming their academic journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 group-hover:border-blue-300">
                <div className="text-6xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">10K+</div>
                <div className="text-gray-700 font-semibold text-lg">Active Students</div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-indigo-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 group-hover:border-indigo-300">
                <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-gray-700 font-semibold text-lg">Institutions</div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 group-hover:border-cyan-300">
                <div className="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">1M+</div>
                <div className="text-gray-700 font-semibold text-lg">Achievements Tracked</div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-indigo-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 group-hover:border-blue-300">
                <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">98%</div>
                <div className="text-gray-700 font-semibold text-lg">Satisfaction Rate</div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - BREATHTAKING */}
      <section id="features" className="relative py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-spin-slow"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full border border-blue-300/30 backdrop-blur-xl shadow-2xl mb-8 hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-blue-600 mr-3 animate-pulse" />
              <span className="font-bold text-lg bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">⚡ Powerful Features</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Comprehensive tools to manage, track, and showcase student achievements with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-blue-200/50 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-blue-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Dynamic Dashboard</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Real-time updates on academic performance, attendance, and credit-based activities with beautiful visualizations</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-indigo-200/50 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-indigo-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Activity Tracker</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Upload and validate participation in seminars, conferences, MOOCs, internships, and extracurricular activities</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-blue-200/50 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group-hover:transform group-hover:scale-105 group-hover:border-cyan-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-full blur-2xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Faculty Approval</h3>
                <p className="text-gray-600 leading-relaxed text-lg">Faculty and admin can approve uploaded records to maintain credibility and verification standards</p>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity"></div>
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

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A simple 4-step process to build your comprehensive digital portfolio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up & Profile</h3>
              <p className="text-gray-600">Create your account and set up your student profile with basic information</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Activities</h3>
              <p className="text-gray-600">Upload certificates, achievements, and activity records with supporting documents</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faculty Validation</h3>
              <p className="text-gray-600">Faculty members review and approve your uploaded records for verification</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Portfolio</h3>
              <p className="text-gray-600">Download your verified digital portfolio or share via web link for applications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact & Benefits</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
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

      {/* CTA Section - ABSOLUTELY STUNNING */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl animate-spin-slow"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-3xl rotate-45 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-indigo-300/20 rounded-2xl rotate-12 animate-float-delayed"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12">
            <div className="inline-flex items-center px-8 py-4 bg-white/20 rounded-full border border-white/30 backdrop-blur-xl shadow-2xl mb-8 hover:scale-105 transition-transform">
              <Rocket className="w-6 h-6 text-white mr-3 animate-pulse" />
              <span className="text-white font-bold text-lg">🚀 Ready to Get Started?</span>
              <Sparkles className="w-6 h-6 text-white ml-3 animate-pulse delay-500" />
            </div>
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight relative">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent animate-gradient"> 
              Academic Journey 
            </span>
            <span className="text-white">Today</span>
            
            {/* Epic glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-white/20 to-indigo-400/20 blur-2xl -z-10"></div>
          </h2>
          
          <p className="text-2xl text-blue-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join thousands of students and hundreds of institutions already using Smart Student Hub 
            to modernize their achievement management and unlock new opportunities
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
            <Link href="/login" className="group relative bg-white text-blue-700 px-12 py-6 rounded-2xl text-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-110 shadow-2xl hover:shadow-white/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce relative z-10" />
              <span className="relative z-10">Get Started Today</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform relative z-10" />
            </Link>
            
            <Link href="#features" className="group relative border-3 border-white text-white px-12 py-6 rounded-2xl text-xl font-bold hover:bg-white/10 transition-all transform hover:scale-105 shadow-xl backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Watch Demo
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            </Link>
          </div>
          
          {/* Epic Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-10 text-blue-100">
            <div className="flex items-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <span className="font-semibold text-lg">Free to get started</span>
            </div>
            <div className="flex items-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                <Shield className="w-6 h-6 text-blue-200" />
              </div>
              <span className="font-semibold text-lg">Secure & compliant</span>
            </div>
            <div className="flex items-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3 group-hover:bg-indigo-500/30 transition-colors">
                <Users className="w-6 h-6 text-indigo-200" />
              </div>
              <span className="font-semibold text-lg">Trusted by 500+ institutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <GraduationCap className="h-10 w-10 text-blue-400" />
                <span className="ml-3 text-2xl font-bold text-white">
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
