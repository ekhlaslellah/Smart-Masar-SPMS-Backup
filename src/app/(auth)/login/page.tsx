'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/layout'
import { BiometricAuth } from '@/components/ui'
import { ShieldCheck, Target, Layers, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { t, isRTL } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(t.auth.invalidCredentials)
        setLoading(false)
      } else {
        fetch('/api/auth/update-last-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {})
        
        window.location.href = '/'
      }
    } catch {
      setError(t.auth.loginFailed)
      setLoading(false)
    }
  }

  const handleBiometricSuccess = async (credentialId: string, user?: unknown) => {
    setLoading(true)
    setError('')

    try {
      if (user && typeof user === 'object' && 'id' in user) {
        const userObj = user as { id: string; email?: string; username?: string }
        const result = await signIn('credentials', {
          identifier: userObj.email || userObj.username,
          biometricAuth: 'true',
          userId: userObj.id,
          redirect: false
        })

        if (result?.error) {
          throw new Error('Failed to create session')
        }

        fetch('/api/auth/update-last-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {})
        
        window.location.href = '/'
      } else {
        setError('')
        setLoading(false)
      }
    } catch (err) {
      console.error('Biometric login error:', err)
      setError(t.biometric?.failed || 'Biometric authentication failed')
      setLoading(false)
    }
  }

  const handleBiometricError = (error: string) => {
    setError(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle geometric background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-blue-600/10 pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Top bar: Language selector */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-950/50">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base sm:text-lg tracking-tight block leading-none">
                {isRTL ? 'سمارت مسار' : 'Smart Masar'}
              </span>
              <span className="text-teal-300/90 text-xs font-medium">
                SPMS v1.0
              </span>
            </div>
          </div>

          <LanguageSwitcher variant="orange-header" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Brand & Strategic Pillars Column */}
          <div className="lg:col-span-7 text-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/15 border border-teal-400/30 text-teal-200 text-xs sm:text-sm font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                {isRTL
                  ? 'حوكمة الاستراتيجية ← خطط الوحدات ← اتفاقيات الأداء'
                  : 'Strategy Governance → Unit Plans → Performance Agreements'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {t.auth.welcomeTo}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300">
                {isRTL ? 'سمارت مسار' : 'Smart Masar'}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {t.auth.performanceManagementSystem}
            </p>

            {/* Three-level Hierarchy Preview badges */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs mb-1">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>{isRTL ? 'المستوى 1: المؤسسة' : 'Level 1: Corporate'}</span>
                </div>
                <p className="text-xs text-slate-300/90">
                  {isRTL ? 'المحاور والأهداف الاستراتيجية المعتمدة' : 'Strategic pillars & approved corporate goals'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs mb-1">
                  <Target className="w-4 h-4 shrink-0" />
                  <span>{isRTL ? 'المستوى 2: الوحدات' : 'Level 2: Units'}</span>
                </div>
                <p className="text-xs text-slate-300/90">
                  {isRTL ? 'أهداف الأقسام التشغيلية ومؤشرات القياس' : 'Departmental operational objectives & KPIs'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isRTL ? 'المستوى 3: الفرد' : 'Level 3: Individual'}</span>
                </div>
                <p className="text-xs text-slate-300/90">
                  {isRTL ? 'اتفاقيات الأداء الفردية SMART والأدلة' : 'SMART performance agreements & evidence'}
                </p>
              </div>
            </div>
          </div>

          {/* Login Form Card Column */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-md py-7 px-5 sm:px-8 shadow-2xl rounded-2xl border border-white/20">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {t.auth.signIn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {t.auth.signInToAccount}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.auth.emailOrUsername}
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    dir="ltr"
                    className="block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 placeholder-slate-400 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 text-sm text-slate-900 text-start"
                    placeholder="hr@demo.com / manager@demo.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {t.auth.password}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      className="block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 pe-10 placeholder-slate-400 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 text-sm text-slate-900 text-start"
                      placeholder={t.auth.password}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center rounded-xl border border-transparent bg-teal-700 py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
                >
                  {loading ? t.auth.signingIn : t.auth.signIn}
                </button>
              </form>

              {/* Biometric Authentication Option */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 py-1 text-slate-500 font-medium rounded-full border border-slate-200">
                      {t.auth.orLoginWithBiometric}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <BiometricAuth
                    mode="login"
                    onSuccess={handleBiometricSuccess}
                    onError={handleBiometricError}
                    disabled={loading}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>{t.auth.copyright}</p>
          <p>Smart Masar SPMS • Phase 1A Foundation</p>
        </div>
      </div>
    </div>
  )
}