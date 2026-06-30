import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [message, setMessage] = useState('Completing sign in...')

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
          setMessage('Sign in could not be completed. Redirecting...')
          window.location.href = '/login?error=auth_failed'
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>{message}</p>
    </div>
  )
}
