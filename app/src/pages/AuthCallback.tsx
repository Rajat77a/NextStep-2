import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      try {
        const params = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

        const code = params.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          window.history.replaceState(null, document.title, window.location.pathname)
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session) throw new Error('No session was created from the OAuth callback.')

        let role = session.user.user_metadata?.role as string | undefined
        if (!role) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle()
          role = profile?.role ?? 'parent'
        }
        const destination = role === 'teacher' || role === 'admin' ? `/${role}` : '/parent'
        if (!cancelled) navigate(destination, { replace: true })
      } catch (error) {
        console.error('OAuth callback failed:', error)
        if (!cancelled) {
          setMessage('Sign in could not be completed. Redirecting...')
          navigate('/login?error=auth_failed', { replace: true })
        }
      }
    }

    completeSignIn()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>{message}</p>
    </div>
  )
}
