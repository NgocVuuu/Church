import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import ScrollToTop from './components/ScrollToTop'
import { LoadingProvider } from './contexts/LoadingContext'
import PageTransition from './components/PageTransition'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoadingProvider>
        <ScrollToTop />
        <App />
        <PageTransition />
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
)
