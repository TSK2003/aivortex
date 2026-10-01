import { Outlet } from 'react-router-dom'

/**
 * AuthLayout wraps login/signup/portal pages.
 * No navbar or footer — fullscreen split-screen auth experience.
 * Uses existing .auth-* CSS classes from auth.css.
 */
export default function AuthLayout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
