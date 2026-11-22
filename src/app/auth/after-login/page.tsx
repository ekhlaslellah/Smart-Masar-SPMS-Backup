import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

/**
 * Separate credentials failure from blocked session cookies in Preview.
 * Do not silently loop back to the login form when Auth.js accepted sign-in
 * but the subsequent server request cannot read the session.
 */
export default async function AfterLoginPage() {
  const session = await auth()
  if (session?.user?.id) {
    redirect('/')
  }

  return (
    <main dir="rtl" lang="ar" className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <section className="w-full max-w-lg bg-white border border-amber-200 rounded-2xl shadow-sm p-7 space-y-4 text-right">
        <h1 className="text-xl font-bold text-slate-900">تعذر الاحتفاظ بجلسة تسجيل الدخول</h1>
        <p className="text-slate-700 leading-7">
          أُرسلت بيانات الدخول إلى الخادم، لكن لم تظهر جلسة مستخدم صالحة عند الانتقال للصفحة التالية.
          يحدث ذلك أحيانًا بسبب قيود ملفات الارتباط في معاينة Google AI Studio داخل المتصفح.
        </p>
        <p className="text-sm text-slate-600 leading-6">
          هذا ليس خطأ ترجمة أو تصميم. لا تكرري محاولة تسجيل الدخول باستمرار؛
          يلزم فحص إعدادات الجلسة أو تجربة تشغيل التطبيق خارج المعاينة المدمجة.
        </p>
        <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 py-2 text-white font-semibold hover:bg-teal-800">
          العودة إلى تسجيل الدخول
        </Link>
      </section>
    </main>
  )
}
