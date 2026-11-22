'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Settings, Clipboard, FolderDown, ChevronRight, Users, RefreshCw, FileText, Clock, Star, Archive, Eye } from 'lucide-react'

interface AdministrativeActionsPanelProps {
  onExportCenterOpen: () => void
}

export function AdministrativeActionsPanel({ onExportCenterOpen }: AdministrativeActionsPanelProps) {
  const router = useRouter()
  const { t, isRTL } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 shadow-sm mb-6 lg:mb-8">
      <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center gap-2.5">
        <Settings className="w-5 lg:w-6 h-5 lg:h-6 text-teal-600 shrink-0" />
        <span>{t.dashboard.administrativeActions}</span>
      </h2>
      
      {/* Primary Actions - Featured */}
      <div className="mb-6 lg:mb-8">
        <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 lg:mb-4">
          {t.dashboard.primaryManagement}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <button 
            onClick={() => router.push('/dashboard/company-items')}
            className="flex items-center justify-between p-4 lg:p-6 bg-gradient-to-r from-teal-50 to-emerald-50/70 border border-teal-200 rounded-2xl hover:from-teal-100/80 hover:to-emerald-100/80 hover:border-teal-300 hover:shadow-md transition-all duration-300 group min-h-[44px] gap-3"
          >
            <div className="flex items-center flex-1 min-w-0 gap-3 lg:gap-4">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs">
                <Clipboard className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>
              <div className="text-start min-w-0 flex-1">
                <div className="text-base lg:text-lg font-bold text-gray-900 truncate">{t.dashboard.companyAssignments}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">{t.dashboard.manageCompanyOkrsCompetencies}</div>
              </div>
            </div>
            <ChevronRight className={`w-5 lg:w-6 h-5 lg:h-6 text-teal-700 group-hover:text-teal-900 transition-transform flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          <button 
            onClick={onExportCenterOpen}
            className="flex items-center justify-between p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl hover:from-blue-100/80 hover:to-indigo-100/80 hover:border-blue-300 hover:shadow-md transition-all duration-300 group min-h-[44px] gap-3"
          >
            <div className="flex items-center flex-1 min-w-0 gap-3 lg:gap-4">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs">
                <FolderDown className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>
              <div className="text-start min-w-0 flex-1">
                <div className="text-base lg:text-lg font-bold text-gray-900 truncate">{t.dashboard.pdfExportCenter}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">{t.dashboard.generateReportsAnalysis}</div>
              </div>
            </div>
            <ChevronRight className={`w-5 lg:w-6 h-5 lg:h-6 text-blue-600 group-hover:text-blue-800 transition-transform flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Secondary & Tertiary Actions - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* System Administration */}
        <div>
          <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 lg:mb-4">
            {t.dashboard.systemAdministration}
          </div>
          
          <div className="space-y-2.5 lg:space-y-3">
            <button 
              onClick={() => router.push('/users')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 lg:w-5 h-4 lg:h-5 text-purple-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.manageUsers}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => router.push('/users/archive')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Archive className="w-4 lg:w-5 h-4 lg:h-5 text-orange-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.archivedEmployees}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => router.push('/admin/cycles')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.cycles}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Monitoring & Analysis */}
        <div>
          <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 lg:mb-4">
            {t.dashboard.monitoringAnalysis}
          </div>
          
          <div className="space-y-2.5 lg:space-y-3">
            <button 
              onClick={() => router.push('/dashboard/audit')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 lg:w-5 h-4 lg:h-5 text-indigo-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.auditLogs}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => router.push('/dashboard/deadlines')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 lg:w-5 h-4 lg:h-5 text-amber-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.deadlines}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => router.push('/dashboard/ratings')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 lg:w-5 h-4 lg:h-5 text-yellow-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.departmentRatings}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button 
              onClick={() => router.push('/dashboard/oversight')}
              className="w-full flex items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group min-h-[44px] gap-3"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-9 lg:w-10 h-9 lg:h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 lg:w-5 h-4 lg:h-5 text-teal-700" />
                </div>
                <span className="font-semibold text-gray-800 text-sm lg:text-base truncate text-start">{t.dashboard.departmentOversight}</span>
              </div>
              <ChevronRight className={`w-4 lg:w-5 h-4 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}