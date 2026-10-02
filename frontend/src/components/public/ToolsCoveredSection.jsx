import { useState } from 'react'

/**
 * High-fidelity SVG icons for all 29 tools shown in the specification
 */
function ToolIcon({ id, name }) {
  switch (id) {
    case 'python':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path fill="#387EB8" d="M11.9 2c-3.1 0-2.9 1.3-2.9 1.3l.01 1.4h2.9v.4H6.2S4 4.8 4 8c0 3.1 1.9 3 1.9 3h1.1v-1.5c0-1.8 1.5-1.7 1.5-1.7h2.9c1.4 0 1.4-1.3 1.4-1.3V3.3S13.4 2 11.9 2zm-1.6 1a.6.6 0 1 1 0 1.2.6.6 0 0 1 0-1.2z" />
          <path fill="#FFE052" d="M12.1 22c3.1 0 2.9-1.3 2.9-1.3l-.01-1.4h-2.9v-.4h5.7s2.2.3 2.2-2.9c0-3.1-1.9-3-1.9-3h-1.1v1.5c0 1.8-1.5 1.7-1.5 1.7h-2.9c-1.4 0-1.4 1.3-1.4 1.3v3.1s-.6 1.4.9 1.4zm1.6-1a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z" />
        </svg>
      )
    case 'sql':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <ellipse cx="12" cy="5" rx="8" ry="3" fill="#A5D8FF" stroke="#339AF0" strokeWidth="1.5" />
          <path d="M4 5v5c0 1.66 3.58 3 8 3s8-1.34 8-3V5" fill="none" stroke="#228BE6" strokeWidth="1.5" />
          <path d="M4 10v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" fill="none" stroke="#1C7ED6" strokeWidth="1.5" />
          <path d="M4 15v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" fill="none" stroke="#1864AB" strokeWidth="1.5" />
        </svg>
      )
    case 'git':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path fill="#F05032" d="M21.6 10.7l-8.3-8.3c-.6-.6-1.6-.6-2.2 0L8.9 4.6l3 3c.6-.2 1.4 0 1.9.4.5.5.6 1.3.4 1.9l2.8 2.8c.6-.2 1.4 0 1.9.4.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0-.6-.6-.7-1.4-.4-2.1L13 10.8v5.5c.2.1.4.3.5.5.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8.2-.2.5-.4.8-.5v-5.6c-.3-.1-.6-.3-.8-.5-.6-.6-.7-1.4-.4-2.1l-3-3L2.4 10.7c-.6.6-.6 1.6 0 2.2l8.3 8.3c.6.6 1.6.6 2.2 0l8.7-8.3c.6-.6.6-1.6 0-2.2z" />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }} fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    case 'powerbi':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect x="3" y="12" width="4" height="9" rx="1.5" fill="#EAA300" />
          <rect x="10" y="8" width="4" height="13" rx="1.5" fill="#F2C811" />
          <rect x="17" y="4" width="4" height="17" rx="1.5" fill="#F9DE68" />
        </svg>
      )
    case 'chatgpt':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }} fill="#10A37F">
          <path d="M22.28 9.58a5.55 5.55 0 0 0-.48-4.59 5.67 5.67 0 0 0-3.9-2.73 5.6 5.6 0 0 0-4.88 1.3 5.56 5.56 0 0 0-4.41-.33 5.65 5.65 0 0 0-3.4 3.34 5.6 5.6 0 0 0-.74 4.99 5.55 5.55 0 0 0 .48 4.59 5.67 5.67 0 0 0 3.9 2.73 5.59 5.59 0 0 0 4.88-1.3 5.56 5.56 0 0 0 4.41.33 5.65 5.65 0 0 0 3.4-3.34 5.6 5.6 0 0 0 .74-4.99zm-7.6 10.37a4.2 4.2 0 0 1-2.45-.78l.1-.06 4.1-2.37a.72.72 0 0 0 .36-.62v-5.8l1.74 1a.06.06 0 0 1 .03.05v4.74a4.24 4.24 0 0 1-3.88 3.84zm-8.4-3.5a4.2 4.2 0 0 1-.55-2.52c0-.44.07-.86.2-1.27l.11.07 4.1 2.37a.72.72 0 0 0 .72 0l5.02-2.9v2l-4.1 2.37a4.24 4.24 0 0 1-5.5-0.12zm-1.07-8.15a4.21 4.21 0 0 1 1.9-1.74l-.1.06-4.1 2.37a.72.72 0 0 0-.36.62v5.8l-1.74-1a.06.06 0 0 1-.03-.05V9.64a4.24 4.24 0 0 1 4.43-1.34zm13.1 3.22l-5.02 2.9-1.74-1 4.1-2.37a.72.72 0 0 0 .36-.62V4.46a.06.06 0 0 1 .03.05v4.74c0 1.25-.56 2.45-1.54 3.27zm2.46 2.5a4.24 4.24 0 0 1-4.43 1.34l.1-.06 4.1-2.37a.72.72 0 0 0 .36-.62V6.65l1.74 1a.06.06 0 0 1 .03.05v4.74c0 .87-.27 1.72-.77 2.42z" />
        </svg>
      )
    case 'excel':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect x="2" y="3" width="20" height="18" rx="2.5" fill="#107C41" />
          <path d="M7 7.5l4 4.5-4 4.5h2.5l2.7-3.2 2.7 3.2h2.5L13.4 12l4-4.5H15l-2.6 3.2L9.8 7.5H7z" fill="#FFFFFF" />
        </svg>
      )
    case 'copilot':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#6E40C9" />
          <path d="M7 14c0-2.8 2.2-5 5-5s5 2.2 5 5" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9.5" cy="13" r="1.3" fill="#FFFFFF" />
          <circle cx="14.5" cy="13" r="1.3" fill="#FFFFFF" />
          <path d="M12 7v2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'numpy':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#013243" stroke="#4DABCF" strokeWidth="1.5" />
          <path d="M12 2v10l9-5M12 12l-9-5M12 12v10" stroke="#4DABCF" strokeWidth="1.2" />
          <text x="12" y="15" fill="#4DABCF" fontSize="7" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">N</text>
        </svg>
      )
    case 'pandas':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect x="4" y="8" width="3.2" height="12" rx="1.5" fill="#130654" />
          <rect x="8.8" y="4" width="3.2" height="16" rx="1.5" fill="#FFD43B" />
          <rect x="13.6" y="7" width="3.2" height="13" rx="1.5" fill="#E70488" />
          <rect x="18.4" y="11" width="3.2" height="9" rx="1.5" fill="#00D2C4" />
        </svg>
      )
    case 'plotly':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect x="3" y="13" width="3" height="8" rx="1" fill="#3F4F75" />
          <rect x="7.5" y="7" width="3" height="14" rx="1" fill="#3F4F75" />
          <rect x="12" y="3" width="3" height="18" rx="1" fill="#00C4AA" />
          <rect x="16.5" y="9" width="3" height="12" rx="1" fill="#3F4F75" />
          <circle cx="4.5" cy="10" r="1.5" fill="#E11D48" />
          <circle cx="9" cy="4" r="1.5" fill="#E11D48" />
          <circle cx="18" cy="6" r="1.5" fill="#E11D48" />
        </svg>
      )
    case 'scikit':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="9" cy="12" r="6.5" fill="#3499CD" opacity="0.85" />
          <circle cx="15" cy="12" r="6.5" fill="#F89939" opacity="0.85" />
          <path d="M9 7c1.5 2 1.5 8 0 10M15 7c-1.5 2-1.5 8 0 10" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        </svg>
      )
    case 'xgboost':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#185A9D" />
          <path d="M6 7l5 5-5 5h2.8l3.6-3.8 3.6 3.8h2.8l-5-5 5-5H16l-3.6 3.7L8.8 7H6z" fill="#43C6AC" />
        </svg>
      )
    case 'azure':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path d="M12.8 2.5L5.5 16.2h5.1L12.8 2.5z" fill="#008AD7" />
          <path d="M13.6 3l-6 14.5 9.7 4 4.2-7L13.6 3z" fill="#0078D4" />
          <path d="M17.3 14.5H5.5l7.5 7h8.5l-4.2-7z" fill="#50E6FF" opacity="0.85" />
        </svg>
      )
    case 'pytorch':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path d="M13.5 3a7.5 7.5 0 0 0-4.8 13.2l1.6-1.6A5.2 5.2 0 1 1 17.2 12h2.3A7.5 7.5 0 0 0 13.5 3z" fill="#EE4C2C" />
          <circle cx="16.5" cy="5.5" r="1.5" fill="#EE4C2C" />
        </svg>
      )
    case 'huggingface':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#FFD21E" />
          <circle cx="8" cy="10" r="1.6" fill="#000" />
          <circle cx="16" cy="10" r="1.6" fill="#000" />
          <path d="M7.5 14.5c1.2 2 3 3 4.5 3s3.3-1 4.5-3" fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 14c1.5-1 3 0 3 2s-1.5 3-3 2" fill="#FFAA00" />
          <path d="M20 14c-1.5-1-3 0-3 2s1.5 3 3 2" fill="#FFAA00" />
        </svg>
      )
    case 'langchain':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#1C3C3C" />
          <ellipse cx="8.5" cy="12" rx="3.5" ry="5" fill="none" stroke="#26A69A" strokeWidth="2" transform="rotate(-30 8.5 12)" />
          <ellipse cx="15.5" cy="12" rx="3.5" ry="5" fill="none" stroke="#80CBC4" strokeWidth="2" transform="rotate(-30 15.5 12)" />
        </svg>
      )
    case 'langgraph':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="3" fill="#3B82F6" />
          <circle cx="18" cy="6" r="3" fill="#10B981" />
          <circle cx="12" cy="18" r="3" fill="#8B5CF6" />
          <path d="M8.5 7.5l7 8M15.5 7.5l-7 8M8 6h8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )
    case 'openai':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }} fill="currentColor">
          <path d="M22.28 9.58a5.55 5.55 0 0 0-.48-4.59 5.67 5.67 0 0 0-3.9-2.73 5.6 5.6 0 0 0-4.88 1.3 5.56 5.56 0 0 0-4.41-.33 5.65 5.65 0 0 0-3.4 3.34 5.6 5.6 0 0 0-.74 4.99 5.55 5.55 0 0 0 .48 4.59 5.67 5.67 0 0 0 3.9 2.73 5.59 5.59 0 0 0 4.88-1.3 5.56 5.56 0 0 0 4.41.33 5.65 5.65 0 0 0 3.4-3.34 5.6 5.6 0 0 0 .74-4.99z" />
        </svg>
      )
    case 'faiss':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="3" fill="#EC1C24" />
          <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" stroke="#EC1C24" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'docker':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <path fill="#2496ED" d="M13 8.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm6 6h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm-3 0h2v2H4zm17.5.3c-.3-.2-1.5-.4-2.3.2-.6.4-.9 1.1-.9 1.9 0 .4.1.8.4 1.1-1.3 1.8-3.4 3-5.7 3-5.5 0-9.2-3.8-9.9-4.7-.1-.1-.3-.2-.5-.2h-.4c-.4 0-.8.3-.9.7-.7 2.2.4 5.3 3.1 7.2 2.3 1.6 5.4 2.2 8.6 1.6 4.3-.8 7.6-3.8 8.6-8.2.1-.3 0-.6-.2-.7z" />
        </svg>
      )
    case 'chroma':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="9.5" fill="#FF5722" />
          <circle cx="9" cy="10" r="4.5" fill="#FFC107" />
          <circle cx="15" cy="14" r="4.5" fill="#03A9F4" />
        </svg>
      )
    case 'mlflow':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#0194E2" />
          <path d="M4 14l4-6 4 6 4-6 4 6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'fastapi':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" fill="#059669" />
          <path d="M13 4L6 14h5l-1 6 7-10h-5l1-6z" fill="#FFFFFF" />
        </svg>
      )
    case 'langfuse':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#E11D48" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#BE123C" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#FB7185" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#E11D48" />
        </svg>
      )
    case 'n8n':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <circle cx="5" cy="12" r="3" fill="#EA4B71" />
          <circle cx="19" cy="7" r="3" fill="#EA4B71" />
          <circle cx="19" cy="17" r="3" fill="#EA4B71" />
          <circle cx="12" cy="12" r="2.5" fill="#FF6D92" />
          <path d="M7.8 12h1.8m4.6-1.5l2.6-2m-2.6 5l2.6 2" stroke="#EA4B71" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'mcp':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#0F172A" />
          <path d="M6 16l4-8 4 8 4-8" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="1.5" fill="#38BDF8" />
        </svg>
      )
    case 'shap':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#8B1874" />
          <path d="M5 8h14M5 12h10M5 16h6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'crewai':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" style={{ flexShrink: 0 }}>
          <rect width="24" height="24" rx="5" fill="#DC2626" />
          <circle cx="12" cy="10" r="4.5" fill="#FFFFFF" />
          <path d="M6 19c0-3.3 2.7-5 6-5s6 1.7 6 5" fill="#FFFFFF" />
        </svg>
      )
    default:
      return null
  }
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
