/**
 * Language Context Provider
 * 
 * Provides multilingual support throughout the application with:
 * - Default Arabic (ar) language with automatic RTL document direction
 * - Dynamic language switching between Arabic (ar) and English (en)
 * - Persistent language preference in localStorage
 * - Type-safe translations with complete TypeScript support
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, translations, Translations } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  toggleLanguage: () => void
  isRTL: boolean
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Synchronize document lang and dir attributes whenever language changes
  useEffect(() => {
    const isRtlLang = language === 'ar'
    document.documentElement.lang = language
    document.documentElement.dir = isRtlLang ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const toggleLanguage = () => {
    const newLang: Language = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
  }

  const isRTL = language === 'ar'
  const dir: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr'

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language] || translations.ar,
    toggleLanguage,
    isRTL,
    dir
  }

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir} className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}