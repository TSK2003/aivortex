import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Send,
  User,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

export default function AdminSupportManager() {
  const { showToast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState('tickets') // 'tickets' | 'enquiries'
  const [loading, setLoading] = useState(true)

  // Support Tickets State
  const [tickets, setTickets] = useState([])
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL')
  const [replyModal, setReplyModal] = useState({ open: false, ticket: null, message: '', isSubmitting: false })

  // Contact Enquiries State
  const [enquiries, setEnquiries] = useState([])
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = {}
      if (ticketStatusFilter !== 'ALL') params.status = ticketStatusFilter
      if (ticketSearch.trim()) params.search = ticketSearch.trim()

      const res = await api.admin.getSupportTickets(params)
      if (res?.data?.tickets) {
        setTickets(res.data.tickets)
      }
    } catch (err) {
      showToast(err.message || 'Failed to load support tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const params = {}
      if (enquiryStatusFilter !== 'ALL') params.status = enquiryStatusFilter
      if (enquirySearch.trim()) params.search = enquirySearch.trim()

      const res = await api.admin.getContactEnquiries(params)
      if (res?.data?.enquiries) {
        setEnquiries(res.data.enquiries)
      }
    } catch (err) {
      showToast(err.message || 'Failed to load contact enquiries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeSubTab === 'tickets') {
      fetchTickets()
    } else {
      fetchEnquiries()
    }
  }, [activeSubTab, ticketStatusFilter, enquiryStatusFilter])

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.admin.updateSupportTicketStatus(ticketId, newStatus)
      showToast(`Ticket status updated to ${newStatus}`, 'success')
      fetchTickets()
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyModal.message.trim()) {
      showToast('Please type a reply message', 'error')
      return
    }

    setReplyModal((prev) => ({ ...prev, isSubmitting: true }))
    try {
      await api.notifications.replyTicket(replyModal.ticket.id, replyModal.message.trim())
      showToast('Reply submitted successfully', 'success')
      setReplyModal({ open: false, ticket: null, message: '', isSubmitting: false })
      fetchTickets()
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error')
      setReplyModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleUpdateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      await api.admin.updateContactStatus(enquiryId, newStatus)
      showToast(`Enquiry marked as ${newStatus}`, 'success')
      fetchEnquiries()
    } catch (err) {
      showToast(err.message || 'Failed to update enquiry status', 'error')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
      case 'NEW':
        return { bg: '#FEF3C7', color: '#92400E', label: status }
      case 'IN_PROGRESS':
        return { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' }
      case 'RESOLVED':
        return { bg: '#DCFCE7', color: '#166534', label: 'Resolved' }
      case 'CLOSED':
        return { bg: '#F1F5F9', color: '#475569', label: 'Closed' }
      default:
        return { bg: '#F1F5F9', color: '#475569', label: status }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0F172A' }}>
              Support & Inquiries Governance
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
              Authoritative management of student support tickets and admissions enquiries
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setActiveSubTab('tickets')}
            style={{
              background: activeSubTab === 'tickets' ? '#2563EB' : '#F8FAFC',
              color: activeSubTab === 'tickets' ? '#FFFFFF' : '#475569',
              border: '1px solid ' + (activeSubTab === 'tickets' ? '#2563EB' : '#E2E8F0'),
              fontWeight: 600
            }}
          >
            Support Tickets
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setActiveSubTab('enquiries')}
            style={{
              background: activeSubTab === 'enquiries' ? '#2563EB' : '#F8FAFC',
              color: activeSubTab === 'enquiries' ? '#FFFFFF' : '#475569',
              border: '1px solid ' + (activeSubTab === 'enquiries' ? '#2563EB' : '#E2E8F0'),
              fontWeight: 600
            }}
          >
            Contact Enquiries
          </button>
        </div>
      </div>

      {/* Subtab 1: Student Support Tickets */}
      {activeSubTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              background: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0'
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                fetchTickets()
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search tickets by subject, message, student..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Filter
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Status:</span>
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  background: '#FFFFFF'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <p>Loading support tickets from database...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: 48,
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                color: '#64748B'
              }}
            >
              <CheckCircle size={36} color="#16A34A" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0F172A' }}>No Support Tickets Found</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>All student queries have been addressed or no tickets match the current filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickets.map((t) => {
                const badge = getStatusBadge(t.status)
                return (
                  <div
                    key={t.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.color
                            }}
                          >
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Priority: {t.priority}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A', fontWeight: 700 }}>{t.subject}</h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid #CBD5E1',
                            fontSize: '0.78rem',
                            background: '#F8FAFC',
                            fontWeight: 600
                          }}
                        >
                          <option value="OPEN">Mark Open</option>
                          <option value="IN_PROGRESS">Mark In Progress</option>
                          <option value="RESOLVED">Mark Resolved</option>
                          <option value="CLOSED">Mark Closed</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setReplyModal({ open: true, ticket: t, message: '', isSubmitting: false })}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          <Send size={12} style={{ marginRight: 4 }} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: '#334155', background: '#F8FAFC', padding: '12px 14px', borderRadius: 8 }}>
                      {t.message}
                    </div>

                    {/* Student Info & Replies Preview */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={13} />
                        <span>
                          From: <strong>{t.student?.name || 'Student'}</strong> ({t.student?.email})
                        </span>
                      </div>
                      <div>
                        <strong>{t.replies?.length || 0}</strong> {t.replies?.length === 1 ? 'reply' : 'replies'} on thread
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Contact & Admissions Enquiries */}
      {activeSubTab === 'enquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              background: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0'
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                fetchEnquiries()
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search inquiries by name, email, subject..."
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Filter
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Status:</span>
              <select
                value={enquiryStatusFilter}
                onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  background: '#FFFFFF'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Enquiries List */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <p>Loading enquiries from database...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: 48,
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                color: '#64748B'
              }}
            >
              <CheckCircle size={36} color="#16A34A" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0F172A' }}>No Contact Enquiries</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No public visitor enquiries match the current criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enquiries.map((enq) => {
                const badge = getStatusBadge(enq.status)
                return (
                  <div
                    key={enq.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: badge.bg,
                              color: badge.color
                            }}
                          >
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(enq.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A', fontWeight: 700 }}>{enq.subject}</h4>
                      </div>

                      <select
                        value={enq.status}
                        onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #CBD5E1',
                          fontSize: '0.78rem',
                          background: '#F8FAFC',
                          fontWeight: 600
                        }}
                      >
                        <option value="NEW">Mark New</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="RESOLVED">Mark Resolved</option>
                      </select>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: '#334155', background: '#F8FAFC', padding: '12px 14px', borderRadius: 8 }}>
                      {enq.message}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B' }}>
                      <div>
                        Prospect: <strong>{enq.name}</strong> • <a href={`mailto:${enq.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{enq.email}</a>
                      </div>
                      <a
                        href={`mailto:${enq.email}?subject=RE: ${encodeURIComponent(enq.subject)}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Mail size={12} />
                        <span>Email Prospect</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h4 style={{ margin: '0 0 8px', fontSize: '1.125rem', color: '#0F172A', fontWeight: 700 }}>
              Reply to: {replyModal.ticket?.subject}
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B' }}>
              Student: {replyModal.ticket?.student?.name} ({replyModal.ticket?.student?.email})
            </p>

            <form onSubmit={handleSendReply}>
              <textarea
                rows={5}
                placeholder="Type your official administrative reply..."
                value={replyModal.message}
                onChange={(e) => setReplyModal((prev) => ({ ...prev, message: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  marginBottom: 16
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setReplyModal({ open: false, ticket: null, message: '', isSubmitting: false })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={replyModal.isSubmitting}
                >
                  {replyModal.isSubmitting ? 'Sending...' : 'Send Official Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
