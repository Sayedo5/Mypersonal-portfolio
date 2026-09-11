import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

/**
 * The admin panel is code-split: visitors to the portfolio never download
 * it, and the public bundle stays the size it was.
 */
const AdminApp = lazy(() => import('./admin/AdminApp'))

function AdminBoot() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg text-fg-subtle">
      <span className="label-mono">Loading…</span>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminBoot />}>
              <AdminApp />
            </Suspense>
          }
        />
        {/* Owner-only draft preview; the API refuses preview data to anyone else. */}
        <Route path="/preview" element={<App preview />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
