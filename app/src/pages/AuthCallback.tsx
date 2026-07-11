import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [state, setState] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      try {
        const params = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

        const code = params.get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (!data.session) throw new Error('No session returned from code exchange.')
          window.history.replaceState(null, document.title, window.location.pathname)
          const role = await getRole(data.session)
          if (!cancelled) window.location.href = `/${role}`
          return
        }

        const accessToken = hashParams.get('access_token') || params.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          if (!data.session) throw new Error('No session returned from setSession.')
          window.history.replaceState(null, document.title, window.location.pathname)
          const role = await getRole(data.session)
          if (!cancelled) window.location.href = `/${role}`
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const role = await getRole(session)
          if (!cancelled) window.location.href = `/${role}`
          return
        }

        throw new Error('No session was created from the OAuth callback.')
      } catch (error) {
        console.error('OAuth callback failed:', error)
        if (!cancelled) {
          setState('error')
          setTimeout(() => {
            if (!cancelled) window.location.href = '/login?error=auth_failed'
          }, 2500)
        }
      }
    }

    async function getRole(session: import('@supabase/supabase-js').Session): Promise<string> {
      const metaRole = session.user.user_metadata?.role as string | undefined
      if (metaRole === 'teacher' || metaRole === 'admin' || metaRole === 'parent') return metaRole
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        if (profile?.role === 'teacher' || profile?.role === 'admin' || profile?.role === 'parent') return profile.role
      } catch {
        // profiles table may not exist or RLS may block — fall through to 'parent'
      }
      return 'parent'
    }

    completeSignIn()

    return () => { cancelled = true }
  }, [])

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-sm mx-4 text-center">
          <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="font-display text-xl text-charcoal mb-2">Sign-in issue</h2>
          <p className="font-body text-sm text-medium-gray mb-5">
            Could not complete sign in. Redirecting you back...
          </p>
          <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-card p-8 max-w-sm mx-4 text-center">
        <div className="w-10 h-10 border-2 border-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-body text-sm text-medium-gray">
          Completing sign in...
        </p>
      </div>
    </div>
  )
}
