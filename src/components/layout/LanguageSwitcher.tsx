'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  variant?: 'default' | 'orange-header'
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  const isOrange = variant === 'orange-header'

  return (
    <div
      className={`inline-flex items-center rounded-xl p-1 transition-all ${
        isOrange
          ? 'bg-white/15 backdrop-blur-md border border-white/25 text-white'
          : 'bg-slate-100 border border-slate-200/80 text-slate-700'
      }`}
      role="group"
      aria-label="Language Switcher"
    >
      <Globe className={`w-3.5 h-3.5 mx-1.5 ${isOrange ? 'text-teal-300' : 'text-teal-600'}`} />
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all min-h-[30px] ${
          language === 'ar'
            ? isOrange
              ? 'bg-teal-500 text-white shadow-sm'
              : 'bg-white text-teal-700 shadow-sm'
            : isOrange
            ? 'text-white/80 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'ar'}
        title="اللغة العربية (RTL)"
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all min-h-[30px] ${
          language === 'en'
            ? isOrange
              ? 'bg-teal-500 text-white shadow-sm'
              : 'bg-white text-teal-700 shadow-sm'
            : isOrange
            ? 'text-white/80 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        aria-pressed={language === 'en'}
        title="English (LTR)"
      >
        EN
      </button>
    </div>
  )
}