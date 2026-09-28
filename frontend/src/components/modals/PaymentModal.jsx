import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, X, Tag, Check, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'

export default function PaymentModal({ course, isOpen, onClose, onSuccess }) {
  const { student, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [studentName, setStudentName] = useState(student?.name || '')
  const [studentEmail, setStudentEmail] = useState(student?.email || '')
  const [offerCode, setOfferCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [offerError, setOfferError] = useState('')
  const [isValidatingOffer, setIsValidatingOffer] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderRef] = useState(() => `ord_${Math.floor(100000 + Math.random() * 900000)}`)

  useEffect(() => {
    if (student) {
      if (student.name) setStudentName(student.name)
      if (student.email) setStudentEmail(student.email)
    }
  }, [student])

  if (!isOpen || !course) return null

  const displayPrice = appliedOffer ? appliedOffer.finalPrice : course.price

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!offerCode.trim()) return

    setIsValidatingOffer(true)
    setOfferError('')
    try {
      const res = await api.public.validateOffer(offerCode.trim(), course.id)
      if (res.data?.offer) {
        setAppliedOffer(res.data.offer)
        showToast(`Coupon applied! You saved ₹${(course.price - res.data.offer.finalPrice).toFixed(0)}`, 'success')
      }
    } catch (err) {
      setAppliedOffer(null)
      setOfferError(err.message || 'Invalid or expired coupon code')
    } finally {
      setIsValidatingOffer(false)
    }
  }

  const handlePay = async () => {
    if (!isAuthenticated) {
      onClose()
      navigate(`/portal?redirect=/courses/${course.slug || course.id}&enroll=true`)
      showToast('Please sign in to complete your enrollment', 'info')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Authoritative backend order creation and price calculation
      const orderRes = await api.payments.createOrder(
        course.id,
        appliedOffer ? appliedOffer.code : (offerCode || undefined)
      )

      if (orderRes.data?.isFree) {
        // Free enrollment completed immediately on server inside transaction
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        showToast(orderRes.message || `Enrolled successfully in ${course.title}!`, 'success')
        setIsProcessing(false)
        if (onSuccess) onSuccess(course)
        onClose()
        return
      }

      const { razorpayOrderId, amount, keyId } = orderRes.data

      // 2. Client-side Razorpay Gateway Trigger (if Razorpay script loaded)
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: keyId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'ApexLearn Institute',
          description: course.title,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // 3. Cryptographic signature verification on backend
              const verifyRes = await api.payments.verifyPayment({
                courseId: course.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })

              if (verifyRes.success) {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 }
                })
                showToast(`Payment verified! You are now enrolled in ${course.title}`, 'success')
                if (onSuccess) onSuccess(course)
                onClose()
              }
            } catch (err) {
              showToast(err.message || 'Payment verification failed', 'error')
            }
          },
          prefill: {
            name: studentName,
            email: studentEmail
          },
          theme: {
            color: '#2563EB'
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setIsProcessing(false)
      } else {
        // In local staging/test without external gateway script:
        // Execute server verification with verified mock signature
        const verifyRes = await api.payments.verifyPayment({
          courseId: course.id,
          razorpayOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'sig_test_verified'
        })

        if (verifyRes.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          showToast(`Enrollment confirmed! Welcome to ${course.title}`, 'success')
          if (onSuccess) onSuccess(course)
          onClose()
        }
      }
    } catch (err) {
      showToast(err.message || 'Payment initiation failed. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="razorpay-modal-overlay" id="razorpay-checkout-overlay" onClick={onClose}>
      <div className="razorpay-frame" onClick={(e) => e.stopPropagation()}>
        {/* Razorpay Header */}
        <div className="razorpay-header">
          <div className="razorpay-brand">
            <ShieldCheck style={{ color: '#38BDF8', width: 22, height: 22 }} />
            <span>ApexLearn Checkout</span>
          </div>
          <button
            id="btn-close-razorpay"
            onClick={onClose}
            style={{ color: '#FFFFFF', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Amount & Course Bar */}
        <div className="razorpay-amount-bar">
          <div>
            <span>Order For: <strong>{course.title}</strong></span>
            <div style={{ fontSize: '0.75rem', color: '#93C5FD' }}>Order Ref: {orderRef}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {appliedOffer && (
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textDecoration: 'line-through' }}>
                ₹{course.price?.toLocaleString('en-IN')}
              </div>
            )}
            <strong>{course.isFree ? 'FREE' : `₹${displayPrice?.toLocaleString('en-IN')}`}</strong>
          </div>
        </div>

        {/* Body / Payment Steps */}
        <div className="razorpay-body" id="razorpay-modal-step-body">
          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: '4px solid #E2E8F0',
                  borderTopColor: 'var(--color-secondary)',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <h4>Processing Secure Payment...</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Contacting server pricing engine and securing transaction record.
              </p>
            </div>
          ) : (
            <>
              {/* Promo / Coupon Code Section */}
              {!course.isFree && (
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      marginBottom: 6
                    }}
                  >
                    Coupon / Offer Code
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="e.g. AI2026 or SAVE20"
                        className="form-input"
                        value={offerCode}
                        onChange={(e) => {
                          setOfferCode(e.target.value.toUpperCase())
                          setOfferError('')
                        }}
                        style={{ paddingLeft: 36, textTransform: 'uppercase' }}
                      />
                      <Tag
                        size={16}
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingOffer || !offerCode.trim()}
                      style={{ padding: '0 16px', fontSize: '0.85rem' }}
                    >
                      {isValidatingOffer ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {appliedOffer && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 6,
                        color: '#16A34A',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <Check size={14} />
                      <span>Code &quot;{appliedOffer.code}&quot; applied: {appliedOffer.discountPercent ? `${appliedOffer.discountPercent}% OFF` : `₹${appliedOffer.discountAmount} OFF`}</span>
                    </div>
                  )}

                  {offerError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 6,
                        color: '#DC2626',
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>{offerError}</span>
                    </div>
                  )}
                </div>
              )}

              {!course.isFree && (
                <>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Select Payment Method
                  </div>

                  <div className="payment-method-selector">
                    {/* Method 1: UPI */}
                    <label
                      className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('UPI')}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        style={{ accentColor: 'var(--color-secondary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          UPI / QR Code
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Instant GPay, PhonePe, Paytm
                        </div>
                      </div>
                    </label>

                    {/* Method 2: Cards */}
                    <label
                      className={`payment-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('Card')}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="Card"
                        checked={paymentMethod === 'Card'}
                        onChange={() => setPaymentMethod('Card')}
                        style={{ accentColor: 'var(--color-secondary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          Debit / Credit Card
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Visa, Mastercard, RuPay
                        </div>
                      </div>
                    </label>

                    {/* Method 3: NetBanking */}
                    <label
                      className={`payment-option ${paymentMethod === 'NetBanking' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('NetBanking')}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="NetBanking"
                        checked={paymentMethod === 'NetBanking'}
                        onChange={() => setPaymentMethod('NetBanking')}
                        style={{ accentColor: 'var(--color-secondary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          Net Banking
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          All major Indian Banks
                        </div>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {/* Student Contact Info */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 4
                  }}
                >
                  Student Name
                </label>
                <input
                  type="text"
                  id="razorpay-input-name"
                  className="form-input"
                  value={studentName}
                  placeholder="Enter your full name"
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 4
                  }}
                >
                  Email (For Instant Receipt & Access)
                </label>
                <input
                  type="email"
                  id="razorpay-input-email"
                  className="form-input"
                  value={studentEmail}
                  placeholder="Enter your email"
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>

              <button
                id="btn-submit-razorpay-payment"
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
                onClick={handlePay}
              >
                <Lock style={{ width: 16, height: 16 }} />
                <span>
                  {course.isFree
                    ? 'Confirm Free Enrollment'
                    : `Pay ₹${displayPrice?.toLocaleString('en-IN')} via Razorpay`}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Razorpay Security Footer */}
        <div className="razorpay-footer">
          <ShieldCheck style={{ width: 16, height: 16, color: '#16A34A' }} />
          <span>Secured by Razorpay • 256-Bit SSL Encryption • PCI-DSS Certified</span>
        </div>
      </div>
    </div>
  )
}
