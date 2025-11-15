export default function AuthPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <section className="w-full max-w-md rounded-2xl bg-white/70 shadow-glass backdrop-blur p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">سجّل دخولك</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          أدخل بياناتك للوصول للوحة التحكم
        </p>

        <form className="space-y-4">
          <label className="block">
            <span className="block text-sm mb-1">البريد الإلكتروني</span>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">كلمة المرور</span>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-medium transition"
          >
            دخول
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-4 ltr:font-mono">
          Demo: admin@example.com / password123
        </p>
      </section>
    </main>
  )
}