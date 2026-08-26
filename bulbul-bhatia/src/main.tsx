import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { getPublicBase } from './lib/publicBase'
import './index.css'

// If the GitHub Pages 404.html redirect encoded a deep path, restore the
// real URL before the router reads it. See public/404.html for the other
// half of this trick.
;(function restoreDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('bm_redirect')
  if (redirect) {
    const base = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
    window.history.replaceState(null, '', base + redirect)
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getPublicBase()}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
