import React from 'react'
import ReactDOM from 'react-dom/client'
import { Agentation } from 'agentation'
import App from './App'
import './index.css'

// Dev-only toolbar. `import.meta.env.DEV` is the Vite equivalent of the
// `process.env.NODE_ENV === "development"` check (which has no `process`
// global in the browser), so both are honored here.
const isDev =
  import.meta.env.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')

// Without `endpoint`, annotations stay in the browser only (localStorage /
// copy-paste) and never reach the MCP server, so agents can't see them.
// Point at the local `agentation-mcp server` so Send/Sync delivers them.
const agentationEndpoint =
  (typeof process !== 'undefined' && process.env?.AGENTATION_ENDPOINT) ||
  import.meta.env.VITE_AGENTATION_ENDPOINT ||
  'http://localhost:4747'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {isDev ? <Agentation endpoint={agentationEndpoint} /> : null}
  </React.StrictMode>,
)
