export const initialCourses = [
  {
    id: 'course-pyds',
    title: 'Python for Data Science',
    category: 'Data Science',
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 1420,
    studentsEnrolled: 8650,
    level: 'Beginner to Intermediate',
    duration: '38 Hours',
    lessonsCount: 42,
    price: 2999,
    originalPrice: 5999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Master modern Python, NumPy, Pandas, Matplotlib, exploratory data analysis, and real-world datasets from scratch.',
    fullDescription: 'Become an industry-ready Data Scientist with our flagship Python for Data Science program. Learn to clean dirty data, run advanced analytics, build automated pipelines, and present executive data visualizations with Seaborn and Plotly. Includes 5 hands-on portfolio projects and weekend live debugging sessions.',
    requirements: [
      'Basic computer literacy (Windows, Mac, or Linux)',
      'No prior programming experience required',
      'Curiosity to solve real-world problems with data'
    ],
    whatYouWillLearn: [
      'Write clean, modular Python 3 code using best practices',
      'High-performance numerical computing with NumPy',
      'Complex data manipulation, merging, and grouping with Pandas',
      'Statistical data visualization using Matplotlib & Seaborn',
      'Web scraping and API data ingestion pipelines',
      'End-to-end exploratory data analysis on real e-commerce datasets'
    ],
    modules: [
      {
        id: 'm1',
        title: 'Module 01: Python Fundamentals & Data Structures',
        lessons: [
          { id: 'l1', title: '01 Introduction to Python 3 & Jupyter Lab', duration: '18:40', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'l2', title: '02 Variables, Data Types & Dynamic Typing', duration: '24:15', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 'l3', title: '03 Lists, Tuples, Dictionaries & Sets', duration: '31:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'l4', title: '04 Control Flow, List Comprehensions & Functions', duration: '28:50', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      },
      {
        id: 'm2',
        title: 'Module 02: High-Performance Computing with NumPy',
        lessons: [
          { id: 'l5', title: '01 N-Dimensional Arrays, Shape & Reshaping', duration: '22:15', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 'l6', title: '02 Vectorized Math, Broadcasting & Boolean Indexing', duration: '27:40', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4' },
          { id: 'l7', title: '03 Linear Algebra & Random Sampling', duration: '19:30', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' }
        ]
      },
      {
        id: 'm3',
        title: 'Module 03: Data Wrangling & Analysis with Pandas',
        lessons: [
          { id: 'l8', title: '01 Series & DataFrames: Reading CSV, JSON & SQL', duration: '33:20', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 'l9', title: '02 Handling Missing Values, Duplicates & Outliers', duration: '29:45', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4' },
          { id: 'l10', title: '03 GroupBy, Aggregations, Pivot Tables & Merging', duration: '35:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
        ]
      },
      {
        id: 'm4',
        title: 'Module 04: Visual Storytelling & Capstone EDA',
        lessons: [
          { id: 'l11', title: '01 Matplotlib Architecture & Custom Plot Design', duration: '25:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
          { id: 'l12', title: '02 Interactive Visualizations with Plotly & Seaborn', duration: '30:40', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' },
          { id: 'l13', title: '03 Capstone Project: Indian E-Commerce Transaction Analysis', duration: '45:00', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-pyml',
    title: 'Python for Machine Learning',
    category: 'Machine Learning',
    badge: 'POPULAR',
    rating: 4.88,
    reviewsCount: 980,
    studentsEnrolled: 6420,
    level: 'Intermediate',
    duration: '45 Hours',
    lessonsCount: 50,
    price: 3499,
    originalPrice: 6999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Master Scikit-Learn, regression, classification, cross-validation, feature engineering, and model evaluation techniques.',
    fullDescription: 'Deep dive into practical Machine Learning engineering with Python. Understand the math and implementation behind Linear & Logistic Regression, Decision Trees, Random Forests, XGBoost, and Clustering. Build deployable predictive models.',
    requirements: [
      'Basic knowledge of Python syntax and NumPy/Pandas',
      'High school level algebra and statistics'
    ],
    whatYouWillLearn: [
      'Feature engineering, one-hot encoding, and scaling pipelines',
      'Supervised learning: Linear Regression, Ridge, Lasso, and ElasticNet',
      'Classification: Logistic Regression, SVM, Decision Trees, Random Forests',
      'Ensemble methods: Gradient Boosting, XGBoost, and LightGBM',
      'Unsupervised learning: K-Means, DBSCAN, and PCA dimensionality reduction',
      'Cross-validation, ROC-AUC, Precision-Recall tradeoffs, and hyperparameter tuning'
    ],
    modules: [
      {
        id: 'pyml-m1',
        title: 'Module 01: Scikit-Learn Architecture & Feature Pipelines',
        lessons: [
          { id: 'pyml-l1', title: '01 Machine Learning Workflow & Scikit-Learn Design', duration: '21:30', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'pyml-l2', title: '02 Data Imputation, Scaling & ColumnTransformer', duration: '28:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
        ]
      },
      {
        id: 'pyml-m2',
        title: 'Module 02: Regression & Continuous Prediction',
        lessons: [
          { id: 'pyml-l3', title: '01 Ordinary Least Squares Regression & Assumptions', duration: '32:15', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'pyml-l4', title: '02 Regularization: Ridge, Lasso & Bias-Variance Tradeoff', duration: '29:50', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      },
      {
        id: 'pyml-m3',
        title: 'Module 03: Classification & Tree Ensembles',
        lessons: [
          { id: 'pyml-l5', title: '01 Binary & Multi-class Logistic Regression', duration: '26:40', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 'pyml-l6', title: '02 Random Forests, Gradient Boosted Trees & XGBoost', duration: '38:20', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-mlai',
    title: 'Machine Learning & AI',
    category: 'Artificial Intelligence',
    badge: 'BESTSELLER',
    rating: 4.95,
    reviewsCount: 2150,
    studentsEnrolled: 11200,
    level: 'Advanced',
    duration: '54 Hours',
    lessonsCount: 62,
    price: 3999,
    originalPrice: 7999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Deep Learning, Neural Networks, PyTorch, Computer Vision, Convolutional Nets, and Transformer architectures.',
    fullDescription: 'The comprehensive deep learning masterclass. Train deep artificial neural networks, convolutional networks for computer vision, recurrent architectures, and modern attention mechanisms using PyTorch and GPU acceleration.',
    requirements: [
      'Intermediate Python and Machine Learning foundations',
      'Familiarity with matrix math and differential calculus basics'
    ],
    whatYouWillLearn: [
      'PyTorch tensor operations, autograd, and GPU training acceleration',
      'Artificial Neural Networks, backpropagation, optimizers (Adam, SGD)',
      'Convolutional Neural Networks (CNNs) for image classification & object detection',
      'Transfer learning with ResNet, EfficientNet, and Vision Transformers',
      'Sequence modeling: LSTMs, GRUs, and Self-Attention mechanisms',
      'Deploying PyTorch models to production REST APIs with FastAPI'
    ],
    modules: [
      {
        id: 'mlai-m1',
        title: 'Module 01: Deep Learning Foundations & PyTorch',
        lessons: [
          { id: 'mlai-l1', title: '01 Neural Network Mathematics & PyTorch Autograd', duration: '26:50', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'mlai-l2', title: '02 Building & Training Multi-Layer Perceptrons', duration: '34:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
        ]
      },
      {
        id: 'mlai-m2',
        title: 'Module 02: Computer Vision with CNNs',
        lessons: [
          { id: 'mlai-l3', title: '01 Convolutions, Pooling & Modern CNN Architectures', duration: '38:40', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'mlai-l4', title: '02 Object Detection & Medical Image Segmentation', duration: '42:15', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-aids',
    title: 'AI for Data Science',
    category: 'Artificial Intelligence',
    badge: 'POPULAR',
    rating: 4.92,
    reviewsCount: 840,
    studentsEnrolled: 5100,
    level: 'Intermediate to Advanced',
    duration: '40 Hours',
    lessonsCount: 44,
    price: 3499,
    originalPrice: 6999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Generative AI, Large Language Models (LLMs), RAG systems, Prompt Engineering, and LangChain for Data Scientists.',
    fullDescription: 'Bridge the gap between classical Data Science and modern Generative AI. Learn how to build enterprise Retrieval Augmented Generation (RAG) pipelines, automate data analytics with AI agents, and fine-tune open-source models like Llama 3 with Hugging Face.',
    requirements: [
      'Basic Python and SQL knowledge',
      'Understanding of data analysis concepts'
    ],
    whatYouWillLearn: [
      'Vector databases: ChromaDB, FAISS, and Pinecone',
      'Building production RAG pipelines with LangChain & LlamaIndex',
      'Automated SQL generation and CSV data querying using LLM agents',
      'Prompt engineering patterns, zero-shot/few-shot reasoning (CoT)',
      'Evaluating LLM outputs with RAGAS framework',
      'Local model hosting with Ollama and vLLM'
    ],
    modules: [
      {
        id: 'aids-m1',
        title: 'Module 01: Generative AI & Vector Embeddings',
        lessons: [
          { id: 'aids-l1', title: '01 Transformer Architecture & Embedding Spaces', duration: '28:10', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'aids-l2', title: '02 Vector Databases & Chunking Strategies', duration: '31:45', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
        ]
      },
      {
        id: 'aids-m2',
        title: 'Module 02: Enterprise RAG Pipelines & AI Agents',
        lessons: [
          { id: 'aids-l3', title: '01 LangChain Chains & RAG System Architecture', duration: '35:20', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'aids-l4', title: '02 Autonomous Data Analysis Agents with Tools', duration: '41:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-trading',
    title: 'Quantitative & Algorithmic Trading with Python',
    category: 'Trading',
    badge: 'POPULAR',
    rating: 4.89,
    reviewsCount: 760,
    studentsEnrolled: 4300,
    level: 'Intermediate to Advanced',
    duration: '42 Hours',
    lessonsCount: 46,
    price: 3999,
    originalPrice: 7999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Build backtested quantitative trading strategies, alpha factors, risk management models, and automated execution with Python.',
    fullDescription: 'Designed for aspiring quantitative analysts and systematic traders. Learn to fetch live market data from NSE/BSE and global exchanges, calculate momentum/mean-reversion indicators, optimize Sharpe ratios, and simulate execution slippage and transaction costs.',
    requirements: [
      'Intermediate Python knowledge (NumPy, Pandas)',
      'Basic familiarity with financial markets and technical indicators'
    ],
    whatYouWillLearn: [
      'Fetching historical tick & OHLCV data using yfinance and Broker APIs',
      'Calculating Moving Averages, RSI, Bollinger Bands, and MACD in Pandas',
      'Event-driven backtesting frameworks (Backtrader & VectorBT)',
      'Portfolio optimization: Markowitz Efficient Frontier & Sharpe Maximization',
      'Risk modeling: Value at Risk (VaR), Conditional VaR, and Maximum Drawdown',
      'Paper trading integration with automated order placement'
    ],
    modules: [
      {
        id: 'trade-m1',
        title: 'Module 01: Financial Data Analysis & Factor Engineering',
        lessons: [
          { id: 'trade-l1', title: '01 Market Data Structures, Returns & Volatility', duration: '25:40', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'trade-l2', title: '02 Technical & Quantitative Factor Engineering', duration: '32:10', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
        ]
      },
      {
        id: 'trade-m2',
        title: 'Module 02: Backtesting & Strategy Execution',
        lessons: [
          { id: 'trade-l3', title: '01 Vectorized Backtesting with VectorBT', duration: '36:15', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 'trade-l4', title: '02 Risk Budgeting & Automated Paper Trading Broker API', duration: '40:20', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      }
    ]
  },
  {
    id: 'course-mlops',
    title: 'Domain-Based Projects & MLOps Engineering',
    category: 'Projects',
    badge: 'BESTSELLER',
    rating: 4.94,
    reviewsCount: 1100,
    studentsEnrolled: 5900,
    level: 'Advanced',
    duration: '48 Hours',
    lessonsCount: 52,
    price: 3499,
    originalPrice: 6999,
    discountPercent: 50,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    shortDescription: '10+ production-grade domain projects: Docker, FastAPI, CI/CD, MLflow experiment tracking, and AWS deployment.',
    fullDescription: 'Bridge the gap between Jupyter notebooks and enterprise production. Containerize your machine learning applications with Docker, create low-latency REST endpoints with FastAPI, track metrics using MLflow, and set up continuous integration pipelines.',
    requirements: [
      'Proficiency in Python and basic Machine Learning algorithms',
      'Comfort with command-line interface'
    ],
    whatYouWillLearn: [
      'Packaging ML models into Docker containers',
      'Building asynchronous REST APIs with FastAPI and Pydantic validation',
      'Tracking experiments, parameters, and model artifacts with MLflow',
      'Automated testing with PyTest and GitHub Actions CI/CD',
      'Monitoring model drift and data quality in production',
      'Complete deployment to cloud services'
    ],
    modules: [
      {
        id: 'mlops-m1',
        title: 'Module 01: API Development & Containerization',
        lessons: [
          { id: 'mlops-l1', title: '01 High-Speed REST APIs with FastAPI & Pydantic', duration: '29:30', isPreview: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 'mlops-l2', title: '02 Dockerizing Machine Learning Microservices', duration: '35:40', isPreview: false, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
        ]
      }
    ]
  }
];

export const initialProjects = [
  {
    id: 'proj-1',
    title: 'Financial Fraud Detection Engine',
    domain: 'FinTech & Banking',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    technology: ['Python', 'Scikit-Learn', 'XGBoost', 'SMOTE'],
    shortDesc: 'Identify fraudulent credit card transactions among millions of records with extreme class imbalance and sub-second latency.',
    fullDesc: 'Analyze 280,000+ European card transactions using PCA features. Handle severe 0.17% class imbalance using SMOTE and Cost-Sensitive learning, optimize Precision-Recall curves, and deploy a real-time scoring microservice.',
    objectives: [
      'Perform exploratory data analysis on anonymized financial transactions',
      'Apply SMOTE and Tomek Links for class balance re-sampling',
      'Train XGBoost and LightGBM models with hyperparameter tuning',
      'Achieve 92%+ PR-AUC and export the pipeline via ONNX'
    ],
    datasetUrl: '#',
    status: 'completed'
  },
  {
    id: 'proj-2',
    title: 'Quantitative Stock Price & Alpha Strategy',
    domain: 'Quantitative Finance',
    category: 'Trading',
    difficulty: 'Advanced',
    technology: ['Python', 'Pandas', 'VectorBT', 'Statsmodels'],
    shortDesc: 'Backtest a multi-factor momentum and mean-reversion algorithmic trading strategy on NIFTY 50 equities.',
    fullDesc: 'Develop a statistical arbitrage algorithm using cointegration tests on paired equities. Calculate rolling Z-scores, model execution slippage, compute max drawdown, and visualize P&L metrics with interactive equity curves.',
    objectives: [
      'Download 10-year OHLCV data using market APIs',
      'Compute Bollinger Band & Kalman Filter mean-reversion signals',
      'Optimize Sharpe and Sortino ratios with Monte Carlo simulations',
      'Generate institutional-grade tearsheets using PyFolio'
    ],
    datasetUrl: '#',
    status: 'in_progress'
  },
  {
    id: 'proj-3',
    title: 'Medical Chest X-Ray Diagnosis with Deep CNNs',
    domain: 'Healthcare & AI',
    category: 'AI',
    difficulty: 'Advanced',
    technology: ['PyTorch', 'Torchvision', 'ResNet50', 'Grad-CAM'],
    shortDesc: 'Automated multi-label classification of 14 thoracic diseases from NIH chest radiograph images using transfer learning.',
    fullDesc: 'Trained on 100,000+ frontal-view X-ray images. Implemented Grad-CAM heatmaps to provide explainable AI visual highlights for radiologists, highlighting lung opacities and pleural effusions.',
    objectives: [
      'Preprocess DICOM and 16-bit radiograph images',
      'Fine-tune ResNet-50 and DenseNet-121 with focal loss',
      'Generate Grad-CAM activation heatmaps for diagnostic transparency',
      'Validate against clinical radiologist benchmark ROC-AUC scores'
    ],
    datasetUrl: '#',
    status: 'not_started'
  },
  {
    id: 'proj-4',
    title: 'E-Commerce Customer Churn Prediction Engine',
    domain: 'Retail & E-Commerce',
    category: 'Data Science',
    difficulty: 'Beginner',
    technology: ['Python', 'Pandas', 'Seaborn', 'Random Forest'],
    shortDesc: 'Predict subscriber churn probability and identify top risk factors for an online subscription retailer.',
    fullDesc: 'Analyze customer behavioral data including purchase frequency, average order value, support ticket logs, and session durations. Build an early-warning churn dashboard with SHAP value explanations.',
    objectives: [
      'Clean multi-table relational customer database',
      'Engineer RFM (Recency, Frequency, Monetary) metrics',
      'Train Random Forest classifier with 89% sensitivity',
      'Generate actionable retention offers based on feature importance'
    ],
    datasetUrl: '#',
    status: 'completed'
  },
  {
    id: 'proj-5',
    title: 'Enterprise RAG Document Q&A Assistant',
    domain: 'Enterprise AI & Legal',
    category: 'AI',
    difficulty: 'Advanced',
    technology: ['LangChain', 'OpenAI / Llama 3', 'ChromaDB', 'FastAPI'],
    shortDesc: 'Build a private knowledge assistant that retrieves, cites, and answers questions from 500-page enterprise PDF policies.',
    fullDesc: 'End-to-end Retrieval Augmented Generation pipeline. Implements recursive character text chunking, BGE vector embeddings, hybrid dense/sparse search, reranking with Cohere, and source citation extraction.',
    objectives: [
      'Ingest unstructured corporate documents (PDF, DOCX, Markdown)',
      'Vectorize chunks into ChromaDB with metadata filtering',
      'Build conversation memory buffer with token management',
      'Evaluate hallucination rates with RAGAS metrics'
    ],
    datasetUrl: '#',
    status: 'in_progress'
  },
  {
    id: 'proj-6',
    title: 'Autonomous Vehicle 2D Object Detection',
    domain: 'Automotive & Robotics',
    category: 'AI',
    difficulty: 'Advanced',
    technology: ['YOLOv8', 'OpenCV', 'PyTorch', 'CUDA'],
    shortDesc: 'Real-time detection and tracking of pedestrians, vehicles, and traffic signals at 60 FPS on dashcam video streams.',
    fullDesc: 'Trained on the KITTI and BDD100K driving datasets. Implemented ByteTrack multi-object tracking, bounding-box speed estimation, and collision warning distance calculation.',
    objectives: [
      'Annotate and augment automotive video footage',
      'Train YOLOv8 custom weights with mosaic augmentation',
      'Optimize model inference with TensorRT quantization',
      'Calculate time-to-impact metrics on camera video feeds'
    ],
    datasetUrl: '#',
    status: 'not_started'
  },
  {
    id: 'proj-7',
    title: 'Real Estate Valuation & Automated Appraisal',
    domain: 'Real Estate & PropTech',
    category: 'Data Science',
    difficulty: 'Intermediate',
    technology: ['Python', 'GeoPandas', 'XGBoost', 'Folium'],
    shortDesc: 'Model spatial housing price dynamics across metro cities using geospatial features, proximity to transit, and square footage.',
    fullDesc: 'Combines census data, OpenStreetMap road networks, and historical sales transactions. Features interactive geospatial heatmaps showing price per square foot across urban zones.',
    objectives: [
      'Geocode property addresses to latitude/longitude coordinates',
      'Calculate proximity buffers to schools, metro stations, and tech parks',
      'Train geospatial regression with 4.8% MAPE error',
      'Build an interactive valuation calculator web interface'
    ],
    datasetUrl: '#',
    status: 'not_started'
  },
  {
    id: 'proj-8',
    title: 'Supply Chain Demand & Inventory Forecaster',
    domain: 'Logistics & Supply Chain',
    category: 'Analytics',
    difficulty: 'Intermediate',
    technology: ['Prophet', 'Statsmodels', 'Pandas', 'Plotly'],
    shortDesc: 'Multi-store demand forecasting for 5,000 SKUs accounting for seasonal surges, promotional discounts, and lead times.',
    fullDesc: 'Time-series forecasting with Facebook Prophet and ARIMA. Generates optimal inventory reorder points and safety stock levels to minimize stockouts while reducing warehouse holding costs.',
    objectives: [
      'Decompose multi-year retail sales into trend, seasonality, and holidays',
      'Tune additive and multiplicative seasonality parameters',
      'Calculate safety stock buffers and Economic Order Quantity (EOQ)',
      'Export automated weekly procurement alerts'
    ],
    datasetUrl: '#',
    status: 'not_started'
  },
  {
    id: 'proj-9',
    title: 'Financial News Sentiment & Market Signals',
    domain: 'FinTech & NLP',
    category: 'Python',
    difficulty: 'Intermediate',
    technology: ['BeautifulSoup', 'FinBERT', 'Hugging Face', 'Matplotlib'],
    shortDesc: 'Scrape real-time financial news headlines and calculate intraday sentiment scores that correlate with stock momentum.',
    fullDesc: 'Build an automated pipeline that scrapes financial portals (Moneycontrol, Reuters), cleans text headlines, classifies bullish/bearish tone using FinBERT, and correlates scores with equity intraday moves.',
    objectives: [
      'Build robust web scrapers with rate limiting and retry logic',
      'Tokenize financial jargon with specialized FinBERT tokenizer',
      'Compute rolling sentiment index per equity ticker',
      'Plot sentiment vs next-day price correlation charts'
    ],
    datasetUrl: '#',
    status: 'completed'
  },
  {
    id: 'proj-10',
    title: 'Credit Risk Scoring & Default Probability Classifier',
    domain: 'Banking & Risk',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    technology: ['Scikit-Learn', 'CatBoost', 'SHAP', 'Optuna'],
    shortDesc: 'Predict probability of default (PD) for retail personal loan applicants according to Basel regulatory standards.',
    fullDesc: 'Utilizes loan applicant bureau history, debt-to-income ratio, employment tenure, and payment delinquent records. Includes Scorecard generation with Weight of Evidence (WoE) and Information Value (IV).',
    objectives: [
      'Perform WoE binning on continuous risk variables',
      'Train monotonic CatBoost classifier to enforce logical risk constraints',
      'Generate SHAP waterfall plots explaining individual loan rejection reasons',
      'Build a credit officer appraisal simulator'
    ],
    datasetUrl: '#',
    status: 'not_started'
  }
];

export const initialLiveSessions = [
  {
    id: 'live-sat',
    day: 'Saturday Live Session',
    date: 'Every Saturday',
    time: '10:00 AM – 12:30 PM IST',
    title: 'End-to-End Data Engineering Pipelines & Real Datasets',
    courseName: 'Python for Data Science',
    instructor: 'Dr. Vikram Sen',
    instructorRole: 'Lead AI Scientist & Ex-FAANG Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    description: 'Join Dr. Vikram live as we build a real-time data ingestion pipeline, clean messy production logs, and debug participant code live. Interactive Q&A throughout the session.',
    meetUrl: 'https://meet.google.com/demo-sat-apexlearn',
    isLiveNow: true,
    status: 'Live Now'
  },
  {
    id: 'live-sun',
    day: 'Sunday Live Session',
    date: 'Every Sunday',
    time: '11:00 AM – 01:30 PM IST',
    title: 'PyTorch Neural Architectures & Live Model Debugging',
    courseName: 'Machine Learning & AI',
    instructor: 'Ananya Deshmukh',
    instructorRole: 'Principal ML Engineer & Kaggle Grandmaster',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    description: 'Live implementation of modern attention mechanisms, custom loss functions, and hands-on debugging of convergence issues with tensor visualizations.',
    meetUrl: 'https://meet.google.com/demo-sun-apexlearn',
    isLiveNow: false,
    status: 'Scheduled Tomorrow'
  }
];

export const initialVideoPreviews = [
  {
    id: 'prev-1',
    course: 'Python for Data Science',
    title: '01 Python Fundamentals & Modern Jupyter Lab Workflow',
    duration: '18:40',
    thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'prev-2',
    course: 'Python for Data Science',
    title: '02 High-Performance Vectorized Math with NumPy Arrays',
    duration: '24:15',
    thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'prev-3',
    course: 'Python for Machine Learning',
    title: '01 Scikit-Learn Pipeline Architecture & Preprocessing',
    duration: '21:30',
    thumb: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'prev-4',
    course: 'Machine Learning & AI',
    title: '01 PyTorch Tensors, Autograd & Building Your First MLP',
    duration: '26:50',
    thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'prev-5',
    course: 'AI for Data Science',
    title: '01 Understanding Transformer Embeddings & Vector Stores',
    duration: '28:10',
    thumb: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
  {
    id: 'prev-6',
    course: 'Quantitative & Algorithmic Trading',
    title: '01 Calculating Volatility, Moving Averages & Momentum Factors',
    duration: '25:40',
    thumb: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
  }
];

export const initialTestimonials = [
  {
    id: 'test-1',
    name: 'Pooja Nair',
    role: 'Data Scientist at PhonePe',
    course: 'Python for Data Science',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    text: 'The domain projects and weekend live sessions set ApexLearn miles apart from ordinary video courses. Learning how to clean real, messy datasets and build end-to-end pipelines helped me crack my role at PhonePe within 4 months.'
  },
  {
    id: 'test-2',
    name: 'Karthik Ramanathan',
    role: 'Machine Learning Engineer at Razorpay',
    course: 'Python for Machine Learning',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    text: 'What made the difference was the depth in feature engineering and model evaluation. The instructors don’t just import libraries—they explain the mathematical intuition and deploy models as real APIs.'
  },
  {
    id: 'test-3',
    name: 'Shreya Kulkarni',
    role: 'AI Researcher at Bengaluru Labs',
    course: 'Machine Learning & AI',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    text: 'The PyTorch and computer vision modules are phenomenal. Building the medical X-ray diagnostic model with Grad-CAM heatmaps gave me a standout project on my resume that impressed my interviewers immediately.'
  }
];

export const initialStudents = [
  {
    id: 'std-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    enrolledCourses: ['course-pyds', 'course-pyml'],
    progress: {
      'course-pyds': { completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'], percent: 100 },
      'course-pyml': { completedLessonIds: ['pyml-l1', 'pyml-l2', 'pyml-l3', 'pyml-l4'], percent: 66 }
    },
    status: 'Active',
    joinDate: '12 Jan 2026'
  },
  {
    id: 'std-102',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    enrolledCourses: ['course-mlai'],
    progress: {
      'course-mlai': { completedLessonIds: ['mlai-l1', 'mlai-l2'], percent: 50 }
    },
    status: 'Active',
    joinDate: '24 Feb 2026'
  },
  {
    id: 'std-103',
    name: 'Aditya Varma',
    email: 'aditya.v@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    enrolledCourses: ['course-trading'],
    progress: {
      'course-trading': { completedLessonIds: ['trade-l1'], percent: 25 }
    },
    status: 'Active',
    joinDate: '02 Mar 2026'
  }
];

export const initialTransactions = [
  {
    id: 'tx-8901',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.sharma@example.com',
    courseId: 'course-pyds',
    courseTitle: 'Python for Data Science',
    amount: 2999,
    paymentId: 'pay_Nz9K284Lsp8901',
    orderId: 'order_Ord99102X',
    method: 'UPI (rahul@okaxis)',
    date: '12 Jan 2026, 02:45 PM',
    status: 'Successful'
  },
  {
    id: 'tx-8902',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.sharma@example.com',
    courseId: 'course-pyml',
    courseTitle: 'Python for Machine Learning',
    amount: 3499,
    paymentId: 'pay_Nx482La9098902',
    orderId: 'order_Ord99103Y',
    method: 'Credit Card (Visa •••• 4242)',
    date: '18 Feb 2026, 11:20 AM',
    status: 'Successful'
  },
  {
    id: 'tx-8903',
    studentName: 'Sneha Patel',
    studentEmail: 'sneha.patel@example.com',
    courseId: 'course-mlai',
    courseTitle: 'Machine Learning & AI',
    amount: 3999,
    paymentId: 'pay_Ny771Pq9908903',
    orderId: 'order_Ord99104Z',
    method: 'Net Banking (HDFC)',
    date: '24 Feb 2026, 04:15 PM',
    status: 'Successful'
  }
];

export const initialCertificates = [
  {
    id: 'CERT-PYDS-2026-9042',
    studentId: 'std-101',
    studentName: 'Rahul Sharma',
    courseId: 'course-pyds',
    courseTitle: 'Python for Data Science',
    instructor: 'Dr. Vikram Sen',
    issueDate: 'March 10, 2026',
    verified: true,
    credentialUrl: 'https://apexlearn.edu/verify/CERT-PYDS-2026-9042'
  }
];
