import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { getPublicBase } from './lib/base'
import './index.css'

// See the root 404.html: a deep-link load (e.g. /bridge-course/success) is redirected
// to this app's index.html with the real path in ?bc_redirect=. Restore it before the
// router reads the URL.
;(function restoreDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('bc_redirect')
  if (redirect && redirect.startsWith('/')) {
    const base = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
    window.history.replaceState(null, '', base + redirect)
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getPublicBase()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
