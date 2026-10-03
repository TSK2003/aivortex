import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, Users, CheckCircle, Sparkles, AlertCircle, RefreshCw, X, User } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

export default function LiveSessionsPage() {
  const { showToast } = useToast()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [rsvpSuccess, setRsvpSuccess] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false)
  const [rsvpError, setRsvpError] = useState('')

  const loadSessions = async () => {
    try {
      setLoading(true)
      const res = await api.public.getLiveSessions()
      if (res.data?.sessions) {
        setSessions(res.data.sessions)
      } else {
        setSessions([])
      }
    } catch (err) {
      console.warn('LiveSessionsPage data fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleRsvp = async (e) => {
    e.preventDefault()
    if (!emailInput || !emailInput.trim()) {
      setRsvpError('Please enter a valid email address.')
      return
    }

    try {
      setIsSubmittingRsvp(true)
      setRsvpError('')

      const res = await api.public.rsvpLiveSession(selectedSession.id, {
        email: emailInput.trim(),
        name: nameInput.trim()
      })

      if (res.success) {
        setRsvpSuccess(res.message || `RSVP confirmed for "${selectedSession?.title}"! Meeting invitation and calendar invite sent to ${emailInput}.`)
        showToast(res.message || 'Seat reserved successfully!', 'success')
        setSelectedSession(null)
        setEmailInput('')
        setNameInput('')
        // Refresh sessions to show live updated seat count
        loadSessions()
      } else {
        setRsvpError(res.error || 'Failed to confirm RSVP')
      }
    } catch (err) {
      setRsvpError(err.message || 'Failed to complete RSVP')
    } finally {
      setIsSubmittingRsvp(false)
    }
  }

  return (
    <div className="live-sessions-page" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 28px auto' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.25rem)', fontWeight: 800, color: 'var(--color-primary, #0F172A)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Live Architectural Deep Dives
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary, #475569)', lineHeight: 1.6 }}>
            Direct interactive weekend sessions with industry architects. Learn hard-won production patterns, review real codebases, and ask complex architectural questions.
          </p>
        </div>

        {/* Success Alert */}
        {rsvpSuccess && (
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto 30px auto',
              padding: '16px 20px',
              borderRadius: 12,
              background: '#D1FAE5',
              border: '1px solid #10B981',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} color="#059669" />
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{rsvpSuccess}</div>
            </div>
            <button
              type="button"
              onClick={() => setRsvpSuccess(null)}
              style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 14px auto', color: '#2563EB' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading live architectural masterclasses...</p>
          </div>
        ) : sessions.length > 0 ? (
          /* Sessions Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 28 }}>
            {sessions.map((session) => {
              const isFull = session.isFull || session.seatsLeft <= 0 || session.dynamicStatus === 'FULL'
              const isCompleted = session.isCompleted || session.dynamicStatus === 'COMPLETED'
              const isCancelled = session.dynamicStatus === 'CANCELLED'
              const isLive = session.isLive || session.dynamicStatus === 'LIVE'

              const speakerName = session.speakerName || session.instructorName || session.instructor || 'Lead Architect'
              const speakerRole = session.speakerRole || session.role || 'Principal Engineering Specialist'
              const speakerInitial = speakerName.charAt(0).toUpperCase()

              return (
                <div
                  key={session.id}
                  className="card"
                  style={{
                    borderRadius: 8,
                    padding: 24,
                    border: '1px solid var(--color-border, #E2E8F0)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-surface, #FFFFFF)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <span className="badge badge-secondary" style={{ fontWeight: 600 }}>
                      {session.sessionDate || (session.scheduledAt ? new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Upcoming Weekend')}
                    </span>

                    {/* Dynamic Seats / Status Badge */}
                    {isCancelled ? (
                      <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                        Cancelled
                      </span>
                    ) : isCompleted ? (
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, background: '#F1F5F9', padding: '3px 10px', borderRadius: 9999 }}>
                        Concluded
                      </span>
                    ) : isLive ? (
                      <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, background: '#DCFCE7', padding: '3px 10px', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                        Live Now
                      </span>
                    ) : isFull ? (
                      <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                        Seats Full
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                        {session.seatsLeft} seats left
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', marginBottom: 8, lineHeight: 1.4 }}>
                    {session.title}
                  </h3>

                  {/* Speaker Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    {session.speakerPhoto ? (
                      <img
                        src={session.speakerPhoto}
                        alt={speakerName}
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      />
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '1.05rem' }}>
                        {speakerInitial}
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text, #0F172A)' }}>
                        {speakerName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748B)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {speakerRole}
                      </div>
                    </div>
                  </div>

                  {/* Time & Duration */}
                  <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} />
                    <span>
                      {session.startTime && session.endTime
                        ? `${session.startTime} - ${session.endTime} ${session.timezone || 'IST'}`
                        : (session.duration || '2.5 Hours')}
                    </span>
                  </div>

                  {/* Agenda */}
                  <div style={{ background: 'var(--color-bg-subtle, #F8FAFC)', borderRadius: 12, padding: 16, marginBottom: 20, flexGrow: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text, #1E293B)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.03em' }}>
                      Key Session Agenda:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0 }}>
                      {(session.agendaList || []).map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #475569)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#2563EB', fontWeight: 700, lineHeight: 1 }}>•</span>
                          <span style={{ lineHeight: 1.4 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RSVP Action */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontWeight: 700,
                      opacity: (isFull || isCompleted || isCancelled) ? 0.6 : 1,
                      cursor: (isFull || isCompleted || isCancelled) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isFull || isCompleted || isCancelled}
                    onClick={() => {
                      if (!isFull && !isCompleted && !isCancelled) {
                        setSelectedSession(session)
                        setRsvpError('')
                      }
                    }}
                  >
                    {isCompleted
                      ? 'Session Concluded'
                      : isCancelled
                      ? 'Session Cancelled'
                      : isFull
                      ? 'Seats Full'
                      : (session.ctaText || 'RSVP for Free Live Masterclass')}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Video size={36} style={{ margin: '0 auto 12px auto', color: '#94A3B8', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--color-primary, #0F172A)', fontSize: '1.1rem', fontWeight: 700 }}>
              No Upcoming Live Sessions Scheduled
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Check back soon for new architectural deep dives and weekend masterclasses.
            </p>
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {selectedSession && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => !isSubmittingRsvp && setSelectedSession(null)}
        >
          <div
            className="modal-card"
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              maxWidth: 520,
              width: '100%',
              padding: 28,
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                {selectedSession.sessionDate || 'Upcoming Weekend'}
              </span>
              <button
                type="button"
                onClick={() => !isSubmittingRsvp && setSelectedSession(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', marginBottom: 8, lineHeight: 1.35 }}>
              Reserve Your Live Session Seat
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary, #475569)', marginBottom: 20 }}>
              {selectedSession.title} with <strong>{selectedSession.speakerName || selectedSession.instructor}</strong> ({selectedSession.seatsLeft} seats remaining)
            </p>

            <form onSubmit={handleRsvp}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={isSubmittingRsvp}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Your Work or Personal Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="scholar@aivortex.com"
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: rsvpError ? '1px solid #EF4444' : '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setRsvpError('') }}
                  disabled={isSubmittingRsvp}
                />
                {rsvpError && (
                  <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 4, fontWeight: 600 }}>
                    {rsvpError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedSession(null)}
                  disabled={isSubmittingRsvp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingRsvp || !emailInput.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSubmittingRsvp ? <RefreshCw size={14} className="spin" /> : null}
                  <span>Confirm My Free Seat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
