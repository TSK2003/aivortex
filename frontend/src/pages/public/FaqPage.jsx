import { useState } from 'react'
import { HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, CreditCard, Video } from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    title: 'Admissions & Prerequisites',
    faqs: [
      {
        q: 'What prior technical background is required for advanced AI courses?',
        a: 'Our foundational and intermediate courses assume basic familiarity with Python or JavaScript. Advanced tracks (such as LangGraph Agent Swarms or Edge Vision with TensorRT) require foundational knowledge of data structures, async programming, and basic Linux command-line workflows.'
      },
      {
        q: 'Are courses self-paced or do they follow a rigid cohort calendar?',
        a: 'All recorded modules, interactive code workbooks, quizzes, and projects are 100% self-paced with 24/7 access. In addition, weekend live masterclasses are offered each Saturday and Sunday for live code review and architectural Q&A.'
      }
    ]
  },
  {
    title: 'Learning Player & Content Security',
    faqs: [
      {
        q: 'Why are subsequent lessons locked when I first start a course?',
        a: 'To guarantee real academic achievement and certification validity, our platform enforces sequential progression. Completing a video lesson (and passing its required quiz where configured by Admin) automatically unlocks the subsequent lesson.'
      },
      {
        q: 'Can I stream course videos on multiple devices simultaneously?',
        a: 'No. To prevent credential sharing and protect copyrighted curriculum, our backend enforces a Single Active Video Session policy. If you start playing a video on a new device, your previous active video session is gracefully retired.'
      },
      {
        q: 'Are video streams watermarked?',
        a: 'Yes. Every authorized video stream includes a dynamic, semi-transparent watermark containing your verified Student ID and unique session timestamp.'
      }
    ]
  },
  {
    title: 'Payments, Invoices & Access Expiry',
    faqs: [
      {
        q: 'What payment methods are supported via Razorpay?',
        a: 'We accept all major Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking across 50+ banks, and EMI options through our secured Razorpay payment gateway.'
      },
      {
        q: 'How long do I retain access to purchased courses?',
        a: 'Courses feature lifetime access by default unless an explicit time-bound cohort access duration is configured by Admin on the course management panel.'
      },
      {
        q: 'Can I claim a refund if the curriculum does not suit my needs?',
        a: 'Yes. We provide a 7-day satisfaction window if less than 20% of the total course video content has been watched and no final certificate has been generated.'
      }
    ]
  },
  {
    title: 'Certificates & Industry Recognition',
    faqs: [
      {
        q: 'How do I earn my official Course Certificate?',
        a: 'Upon completing 100% of the course lessons and passing all mandatory assessments with a passing grade, our backend transactionally generates an authentic Certificate of Completion with a unique cryptographic verification serial.'
      },
      {
        q: 'Can employers verify my certificate online?',
        a: 'Yes. Every certificate features a permanent public verification URL and Certificate ID that anyone can verify instantly via our public Certificate Verification portal.'
      }
    ]
  }
]

export default function FaqPage() {
  const [openItems, setOpenItems] = useState({ '0-0': true, '1-0': true })

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="faq-page" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 32px auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <HelpCircle size={14} style={{ marginRight: 6 }} />
            Knowledge Base
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 16 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Everything you need to know about our curriculum standards, secure video delivery, payment workflows, and accredited certifications.
          </p>
        </div>

        {/* Categories */}
        <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {FAQ_CATEGORIES.map((cat, catIdx) => (
            <div key={catIdx}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16, borderBottom: '2px solid var(--color-border)', paddingBottom: 8 }}>
                {cat.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cat.faqs.map((faq, faqIdx) => {
                  const key = `${catIdx}-${faqIdx}`
                  const isOpen = !!openItems[key]

                  return (
                    <div
                      key={faqIdx}
                      className="card"
                      style={{
                        borderRadius: 12,
                        padding: 0,
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                        background: '#FFFFFF',
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '18px 24px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: isOpen ? 'var(--color-secondary)' : 'var(--color-primary)',
                        }}
                        onClick={() => toggleItem(key)}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={18}
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0,
                            marginLeft: 16,
                          }}
                        />
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: '0 24px 20px 24px',
                            fontSize: '0.92rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.7,
                            animation: 'fadeIn 0.2s ease-out',
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
