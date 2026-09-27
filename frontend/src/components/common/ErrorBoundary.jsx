import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'var(--color-bg, #F8FAFC)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 580,
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 36,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: 10,
              }}
            >
              Application Error Encountered
            </h2>

            <p
              style={{
                fontSize: '0.92rem',
                color: '#64748B',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              An unexpected error occurred while rendering this view. Your session and account data remain secure.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 24,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#475569',
                  textAlign: 'left',
                  maxHeight: 120,
                  overflowY: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { window.location.href = '/' }}
                style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Home size={16} />
                Return to Home
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
