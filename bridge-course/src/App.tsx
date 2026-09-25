import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CheckStatus from './pages/CheckStatus'
import Landing from './pages/Landing'
import { Contact, NotFound, Privacy, Refund, Terms } from './pages/Legal'
import PaymentFailed from './pages/PaymentFailed'
import Success from './pages/Success'

// Admin pulls in supabase-js; keep it out of the landing-page bundle.
const Admin = lazy(() => import('./pages/Admin'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/check-status" element={<CheckStatus />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
