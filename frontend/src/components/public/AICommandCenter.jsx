import { Cpu, Terminal, TrendingUp, Layers, Flame, Award, Sparkles, ChevronRight, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AICommandCenter() {
  const { student, isStudentAuthenticated } = useAuth()
  const isStudentAuth = isStudentAuthenticated ? isStudentAuthenticated() : false

  const progressPercent = student ? (student.progress || 68) : 75
  const completedProjects = student ? (student.completedProjects || 4) : 8
  const streakDays = student ? (student.streak || 14) : 18
  const certificateCount = student ? (student.certificates || 2) : 3

  return (
    <section className="section section-ai-command" id="ai-command-center">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge badge-glow">
            <Cpu style={{ width: 14, height: 14 }} />
            <span>AI COMMAND CENTER</span>
          </div>
          <h2 className="section-title">
            Your Learning. Your Progress. <span className="highlight-blue">Your Future.</span>
          </h2>
          <p className="section-subtitle">
            Experience an intelligent, data-driven learning ecosystem engineered to track your mastery, suggest optimal project paths, and accelerate your engineering career.
          </p>
        </div>

        {/* Dashboard Terminal Interface */}
        <div className="command-center-window">
          {/* Top Window Control Bar */}
          <div className="command-window-bar">
            <div className="window-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="command-window-title">
              <Terminal style={{ width: 14, height: 14, color: 'var(--color-secondary)' }} />
              <span>
                aivortex AI Command Engine v3.4 •{' '}
                {isStudentAuth ? `Active Session: ${student?.name || 'Student'}` : 'Live Platform Preview'}
              </span>
            </div>
            <div className="command-status-badge">
              <span className="status-pulse"></span>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>

          {/* Command Center Grid Content */}
          <div className="command-grid-layout">
            {/* Left Side: Analytics & Progress Cards */}
            <div className="command-main-metrics">
              <div className="command-stat-card">
                <div className="command-stat-header">
                  <div>
                    <span className="stat-label">Active Track Progress</span>
                    <h4 className="stat-value">{progressPercent}%</h4>
                  </div>
                  <div className="stat-icon-circle blue">
                    <TrendingUp style={{ width: 20, height: 20 }} />
                  </div>
                </div>
                <div className="command-progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="stat-foot">Python & Data Science Engineering</span>
              </div>

              <div className="command-stat-card">
                <div className="command-stat-header">
                  <div>
                    <span className="stat-label">Projects Completed</span>
                    <h4 className="stat-value">{completedProjects} <span className="unit">/ 10</span></h4>
                  </div>
                  <div className="stat-icon-circle green">
                    <Layers style={{ width: 20, height: 20 }} />
                  </div>
                </div>
                <div className="stat-badge-row">
                  <span className="mini-badge">FinTech ML</span>
                  <span className="mini-badge">NLP Engine</span>
                  <span className="mini-badge">Quant Trading</span>
                </div>
              </div>

              <div className="command-stat-card">
                <div className="command-stat-header">
                  <div>
                    <span className="stat-label">Learning Streak</span>
                    <h4 className="stat-value">{streakDays} <span className="unit">Days</span></h4>
                  </div>
                  <div className="stat-icon-circle orange">
                    <Flame style={{ width: 20, height: 20 }} />
                  </div>
                </div>
                <span className="stat-foot">Top 5% Consistent Learner</span>
              </div>

              <div className="command-stat-card">
                <div className="command-stat-header">
                  <div>
                    <span className="stat-label">Certificates Issued</span>
                    <h4 className="stat-value">{certificateCount} <span className="unit">Verified</span></h4>
                  </div>
                  <div className="stat-icon-circle purple">
                    <Award style={{ width: 20, height: 20 }} />
                  </div>
                </div>
                <span className="stat-foot">ID Verified on Blockchain Ledger</span>
              </div>
            </div>

            {/* Right Side: AI Recommendations & Live Telemetry */}
            <div className="command-side-panel">
              <div className="panel-box">
                <div className="panel-title">
                  <Sparkles style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                  <span>AI Recommended Next Step</span>
                </div>
                <div className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-tag">PROJECT MATCH • 98%</span>
                    <h5>Build Real-Time Algorithmic Trading Bot</h5>
                  </div>
                  <p className="rec-desc">
                    Based on your completion of Python Data Structures, you are ready to implement WebSocket feeds and pandas backtesting.
                  </p>
                  <Link
                    to={isStudentAuth ? '/student/dashboard' : '/courses'}
                    className="btn btn-primary btn-sm style-full"
                  >
                    <span>{isStudentAuth ? 'Resume Project' : 'Explore Course'}</span>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>

              <div className="panel-box">
                <div className="panel-title">
                  <Video style={{ width: 16, height: 16, color: '#10B981' }} />
                  <span>Upcoming Live Cohort</span>
                </div>
                <div className="live-cohort-mini">
                  <div className="cohort-time">Sat, 11:00 AM EST</div>
                  <h6>Generative AI & LLM Fine-Tuning Workshop</h6>
                  <span className="cohort-mentor">Mentor: Dr. Alex Rivera (Lead AI Scientist)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
