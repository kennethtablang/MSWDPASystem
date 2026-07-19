import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Toaster from './shared/components/ui/Toast.jsx'
import './index.css'
import App from './App.jsx'
import { applyStoredAppearance, watchSystemTheme } from './shared/utils/appearance'

// Applied before first paint so the app does not flash light before switching
// to dark. The server copy arrives later and re-applies only if it differs.
applyStoredAppearance()
watchSystemTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
