import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './hooks/useTheme'
import { getPublicBase } from './lib/publicBase'
import './index.css'

// See the sibling app's 404.html trick: a deep-link reload under this
// mount path gets redirected here with the real path encoded in a query
// string. Restore it before the router reads the URL.
;(function restoreDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('msd_redirect')
  if (redirect) {
    const base = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
    window.history.replaceState(null, '', base + redirect)
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getPublicBase()}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
