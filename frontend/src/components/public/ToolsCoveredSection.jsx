import { useState } from 'react'

/**
 * Tool icon component that loads official SVG logos from /tools/ directory
 */
function ToolIcon({ id, name }) {
  return (
    <img
      src={`/tools/${id}.svg`}
      alt={`${name} logo`}
      width="26"
      height="26"
      style={{ flexShrink: 0, objectFit: 'contain' }}
      loading="lazy"
    />
  )
}

const TOOLS_ROW_1 = [
  { id: 'python', name: 'Python', category: 'Programming', color: '#387EB8' },
  { id: 'sql', name: 'SQL', category: 'Database', color: '#00758F' },
  { id: 'git', name: 'git', category: 'Version Control', color: '#F05032' },
  { id: 'github', name: 'GitHub', category: 'DevOps & CI/CD', color: '#24292F' },
  { id: 'powerbi', name: 'Power BI', category: 'Data Visualization', color: '#EAA300' },
  { id: 'chatgpt', name: 'ChatGPT', category: 'Generative AI', color: '#10A37F' },
  { id: 'excel', name: 'Excel', category: 'Analytics', color: '#107C41' },
  { id: 'copilot', name: 'GitHub Copilot', category: 'AI Pair Programmer', color: '#6E40C9' },
  { id: 'numpy', name: 'NumPy', category: 'Numerical Computing', color: '#013243' },
  { id: 'pandas', name: 'pandas', category: 'Data Manipulation', color: '#130654' },
  { id: 'plotly', name: 'plotly', category: 'Interactive Charts', color: '#3F4F75' },
  { id: 'scikit', name: 'scikit-learn', category: 'Machine Learning', color: '#F89939' },
  { id: 'xgboost', name: 'XGBoost', category: 'Gradient Boosting', color: '#185A9D' },
  { id: 'azure', name: 'Azure', category: 'Cloud Infrastructure', color: '#008AD7' },
  { id: 'pytorch', name: 'PyTorch', category: 'Deep Learning', color: '#EE4C2C' }
]

const TOOLS_ROW_2 = [
  { id: 'huggingface', name: 'Hugging Face', category: 'Open-Source AI & Models', color: '#FFD21E' },
  { id: 'langchain', name: 'LangChain', category: 'LLM Orchestration', color: '#26A69A' },
  { id: 'langgraph', name: 'LangGraph', category: 'Multi-Agent Workflows', color: '#3B82F6' },
  { id: 'openai', name: 'OpenAI', category: 'Foundation Models', color: '#10A37F' },
  { id: 'faiss', name: 'FAISS', category: 'Vector Similarity Search', color: '#EC1C24' },
  { id: 'docker', name: 'docker', category: 'Containerization', color: '#2496ED' },
  { id: 'chroma', name: 'Chroma', category: 'Vector Database', color: '#FF5722' },
  { id: 'mlflow', name: 'mlflow', category: 'MLOps & Tracking', color: '#0194E2' },
  { id: 'fastapi', name: 'FastAPI', category: 'High-Performance APIs', color: '#059669' },
  { id: 'langfuse', name: 'Langfuse', category: 'LLM Observability', color: '#E11D48' },
  { id: 'n8n', name: 'n8n', category: 'AI Workflow Automation', color: '#EA4B71' },
  { id: 'mcp', name: 'MCP', category: 'Model Context Protocol', color: '#2563EB' },
  { id: 'shap', name: 'Shap', category: 'Explainable AI', color: '#8B1874' },
  { id: 'crewai', name: 'crewai', category: 'Autonomous AI Agents', color: '#DC2626' }
]

export default function ToolsCoveredSection() {
  const [hoveredTool, setHoveredTool] = useState(null)

  return (
    <section className="tools-covered-section" id="tools-covered" aria-label="Tools Covered">
      <div className="container" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="tools-covered-header">
          <h2 className="tools-covered-title">
            20+ Tools Covered
          </h2>
          <p className="tools-covered-subtitle">
            Master the exact industry-standard frameworks, libraries, vector databases, and agentic workflows used by top engineering teams.
          </p>
        </div>
      </div>

      {/* Ticker / Marquee Container with edge fades and hover pause */}
      <div className="tools-marquee-wrapper" role="region" aria-label="Interactive Tool Carousel">
        {/* Row 1 - Leftward Motion */}
        <div className="tools-marquee-track-row track-left">
          <div className="tools-marquee-content">
            {TOOLS_ROW_1.map((tool, idx) => (
              <ToolCard key={`${tool.id}-r1-a-${idx}`} tool={tool} hoveredTool={hoveredTool} setHoveredTool={setHoveredTool} />
            ))}
          </div>
          <div className="tools-marquee-content" aria-hidden="true">
            {TOOLS_ROW_1.map((tool, idx) => (
              <ToolCard key={`${tool.id}-r1-b-${idx}`} tool={tool} hoveredTool={hoveredTool} setHoveredTool={setHoveredTool} />
            ))}
          </div>
        </div>

        {/* Row 2 - Rightward Motion */}
        <div className="tools-marquee-track-row track-right">
          <div className="tools-marquee-content">
            {TOOLS_ROW_2.map((tool, idx) => (
              <ToolCard key={`${tool.id}-r2-a-${idx}`} tool={tool} hoveredTool={hoveredTool} setHoveredTool={setHoveredTool} />
            ))}
          </div>
          <div className="tools-marquee-content" aria-hidden="true">
            {TOOLS_ROW_2.map((tool, idx) => (
              <ToolCard key={`${tool.id}-r2-b-${idx}`} tool={tool} hoveredTool={hoveredTool} setHoveredTool={setHoveredTool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ToolCard({ tool, hoveredTool, setHoveredTool }) {
  const isHovered = hoveredTool?.id === tool.id

  return (
    <div
      className={`tool-card-item ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHoveredTool(tool)}
      onMouseLeave={() => setHoveredTool(null)}
      title={tool.name}
    >
      <div className="tool-icon-wrapper">
        <ToolIcon id={tool.id} name={tool.name} />
      </div>
      <span className="tool-name-label">{tool.name}</span>
    </div>
  )
}
