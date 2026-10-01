import { useState } from 'react'
import { Terminal, Sparkles, Cpu, BarChart2, Globe, CloudLightning, Bot, TrendingUp, LayoutGrid, ArrowRight } from 'lucide-react'

const iconMap = {
  terminal: Terminal,
  sparkles: Sparkles,
  cpu: Cpu,
  'bar-chart-2': BarChart2,
  globe: Globe,
  'cloud-lightning': CloudLightning,
  bot: Bot,
  'trending-up': TrendingUp
}

export const initialCategories = [
  {
    id: 'cat-python',
    name: 'Python',
    icon: 'terminal',
    count: '3 Master Courses',
    desc: 'Foundational syntax, OOP, data structures, & automation scripts.',
    tag: 'Python'
  },
  {
    id: 'cat-ai',
    name: 'Artificial Intelligence',
    icon: 'sparkles',
    count: '4 LLM & GenAI Tracks',
    desc: 'Prompt engineering, RAG pipelines, & Transformer architectures.',
    tag: 'Artificial Intelligence'
  },
  {
    id: 'cat-ml',
    name: 'Machine Learning',
    icon: 'cpu',
    count: '5 Applied Courses',
    desc: 'Supervised algorithms, PyTorch neural nets, & MLOps deployment.',
    tag: 'Machine Learning'
  },
  {
    id: 'cat-ds',
    name: 'Data Science',
    icon: 'bar-chart-2',
    count: '4 In-Depth Courses',
    desc: 'Pandas, NumPy, EDA, statistics, & executive dashboards.',
    tag: 'Data Science'
  },
  {
    id: 'cat-web',
    name: 'Web Development',
    icon: 'globe',
    count: '3 Full-Stack Courses',
    desc: 'Modern frontend frameworks, REST APIs, & database backends.',
    tag: 'Web Development'
  },
  {
    id: 'cat-cloud',
    name: 'Cloud & DevOps',
    icon: 'cloud-lightning',
    count: '2 Infrastructure Tracks',
    desc: 'Docker containers, Kubernetes, CI/CD, & AWS cloud hosting.',
    tag: 'Cloud & DevOps'
  },
  {
    id: 'cat-auto',
    name: 'Automation',
    icon: 'bot',
    count: '2 Workflow Tracks',
    desc: 'Web scraping, bot development, and automated testing suites.',
    tag: 'Automation'
  },
  {
    id: 'cat-trading',
    name: 'Quant Trading',
    icon: 'trending-up',
    count: '2 Quant Tracks',
    desc: 'Algorithmic strategy backtesting, NumPy, and market data APIs.',
    tag: 'Trading'
  }
]

export default function CategorySection({ onSelectCategory }) {
  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <LayoutGrid style={{ width: 14, height: 14 }} />
            <span>CURATED DOMAINS</span>
          </div>
          <h2 className="section-title">
            EXPLORE <span className="highlight-blue">TECHNOLOGIES</span>
          </h2>
          <p className="section-subtitle">
            Choose a targeted specialization engineered to take you from foundational syntax to enterprise production architectures.
          </p>
        </div>

        <div className="category-grid">
          {initialCategories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Terminal
            return (
              <div
                key={cat.id}
                className="category-card"
                data-category={cat.tag}
                onClick={() => onSelectCategory && onSelectCategory(cat.tag)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-card-top">
                  <div className="category-icon-box">
                    <IconComponent style={{ width: 22, height: 22 }} />
                  </div>
                  <span className="category-count">{cat.count}</span>
                </div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.desc}</p>
                <div className="category-card-action">
                  <span>Explore Path</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
