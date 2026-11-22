'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/layout'
import { CycleSelector } from '@/components/features/cycles'
import type { EvaluationCycle } from '@/types'
import {
  Settings,
  LogOut,
  Clipboard,
  FileText,
  Clock,
  RefreshCw,
  Menu,
  X,
  Target,
  Users,
  ShieldCheck,
  BarChart3,
  Eye,
  Archive,
  LayoutDashboard
} from 'lucide-react'

interface PerformanceCycle {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  createdBy: string
  closedBy?: string | null
  closedAt?: string | null
  _count: {
    evaluations: number
    evaluationItems: number
    partialAssessments: number
  }
}

interface DashboardHeaderProps {
  companyName: string
  activeCycle: EvaluationCycle | null
  allCycles: PerformanceCycle[]
}

export function DashboardHeader({ 
  companyName, 
  activeCycle, 
  allCycles 
}: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, isRTL } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const primaryNavItems = [
    {
      label: t.common.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
      style: 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm'
    },
    {
      label: t.nav.employeeEvaluations,
      href: '/evaluations',
      icon: Clipboard,
      active: pathname?.startsWith('/evaluations'),
      style: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
    },
    {
      label: t.nav.myEvaluations,
      href: '/my-evaluations',
      icon: FileText,
      active: pathname?.startsWith('/my-evaluations'),
      style: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
    },
    {
      label: t.dashboard.companyAssignments,
      href: '/dashboard/company-items',
      icon: Target,
      active: pathname?.startsWith('/dashboard/company-items'),
      style: 'bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100'
    },
    {
      label: t.dashboard.deadlines,
      href: '/dashboard/deadlines',
      icon: Clock,
      active: pathname?.startsWith('/dashboard/deadlines'),
      style: 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
    },
    {
      label: t.dashboard.cycles,
      href: '/admin/cycles',
      icon: RefreshCw,
      active: pathname?.startsWith('/admin/cycles'),
      style: 'bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100'
    }
  ]

  const secondaryDrawerItems = [
    {
      label: t.dashboard.manageUsers,
      href: '/users',
      icon: Users
    },
    {
      label: t.dashboard.departmentRatings,
      href: '/dashboard/ratings',
      icon: BarChart3
    },
    {
      label: t.dashboard.departmentOversight,
      href: '/dashboard/oversight',
      icon: Eye
    },
    {
      label: t.dashboard.auditLogs,
      href: '/dashboard/audit',
      icon: ShieldCheck
    },
    {
      label: t.dashboard.archivedEmployees,
      href: '/users/archive',
      icon: Archive
    }
  ]

  const navigateTo = (href: string) => {
    setIsMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3.5 sm:py-4 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-sm shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
                    {t.dashboard.hrDashboard}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {isRTL ? 'سمارت مسار SPMS' : 'Smart Masar SPMS'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mt-0.5">
                  {companyName === 'Demo Company' || companyName === 'DEMO S.A.'
                    ? (isRTL ? 'سمارت مسار — Smart Masar (بيئة التطوير التجريبية)' : 'Smart Masar — Demo Environment')
                    : companyName}
                </p>
              </div>
            </div>
            
            {/* Desktop Header Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <CycleSelector 
                showCreateButton={false} 
                onCycleSelect={() => {}}
                initialCycles={allCycles}
                selectedCycleId={activeCycle?.id || null}
              />
              <LanguageSwitcher />
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center justify-center min-w-[42px] min-h-[42px] bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200"
                title={t.nav?.settings || 'Settings'}
                aria-label={t.nav?.settings || 'Settings'}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center justify-center min-w-[42px] min-h-[42px] bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-md transition-all duration-200"
                title={t.auth.signOut}
                aria-label={t.auth.signOut}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Tablet & Mobile Controls (Language + Menu Drawer Button) */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-all duration-200 shadow-xs"
                title={isRTL ? 'القائمة الرئيسية' : 'Main Menu'}
                aria-label={isRTL ? 'القائمة الرئيسية' : 'Main Menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop & Tablet Horizontal Navigation Bar */}
          <div className="hidden md:block border-t border-slate-200/70 py-3">
            <nav className="flex items-center justify-between gap-4 flex-wrap" aria-label="Main Navigation">
              <div className="flex items-center gap-2 lg:gap-2.5 flex-wrap">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-200 min-h-[40px] ${item.style}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-xs lg:text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/70">
                <span className="text-slate-500">{t.nav.currentPeriod}: </span>
                <span className="font-semibold text-slate-800">
                  {activeCycle ? activeCycle.name : t.dashboard.noActivePerformanceCycle}
                </span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Responsive Side Drawer for Mobile & iPad (supports RTL & LTR smoothly) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Sidebar Panel */}
          <aside
            className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-e border-slate-200"
            aria-label={isRTL ? 'القائمة الجانبية' : 'Sidebar Navigation'}
          >
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {isRTL ? 'سمارت مسار SPMS' : 'Smart Masar SPMS'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activeCycle ? activeCycle.name : t.dashboard.noActivePerformanceCycle}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label={t.common.cancel}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cycle Selector in Drawer */}
              <div className="p-4 border-b border-slate-100">
                <CycleSelector 
                  showCreateButton={false} 
                  onCycleSelect={() => {}}
                  initialCycles={allCycles}
                  selectedCycleId={activeCycle?.id || null}
                />
              </div>

              {/* Primary Navigation Section */}
              <div className="p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
                  {t.dashboard.primaryManagement}
                </div>
                <div className="space-y-1.5">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                          item.active
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Secondary Governance & Admin Section */}
              <div className="px-4 pb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
                  {t.dashboard.systemAdministration}
                </div>
                <div className="space-y-1.5">
                  {secondaryDrawerItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all min-h-[44px]"
                      >
                        <Icon className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={() => navigateTo('/settings')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all min-h-[44px]"
              >
                <Settings className="w-4 h-4" />
                <span>{t.nav.settings}</span>
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.auth.signOut}</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}