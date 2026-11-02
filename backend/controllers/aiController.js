import User from '../models/User.js';

// Predefined curriculum matrices for intelligent zero-dependency fallback
const ROADMAP_CURRICULA = {
  python: [
    { stage: 1, title: 'Python Syntax & Core Primitives', topics: ['Variables, data types (int, float, str, bool)', 'Lists, Tuples, Sets, and Dictionaries', 'Control flow, loops & comprehensions'] },
    { stage: 2, title: 'Functional Programming & Modules', topics: ['Function definitions, *args & **kwargs', 'Lambda functions, map, and filter', 'Exception handling & File I/O with context managers'] },
    { stage: 3, title: 'Object-Oriented Programming (OOP)', topics: ['Classes, Objects, and __init__ constructors', 'Inheritance, Polymorphism & Encapsulation', 'Dunder methods (__str__, __repr__, __len__)'] },
    { stage: 4, title: 'Data Structures & Algorithms', topics: ['Binary Search, Two-Pointer technique', 'Stacks, Queues, and Hash Maps', 'Time and Space Complexity (Big-O analysis)'] },
    { stage: 5, title: 'Practical Applications & Capstone Project', topics: ['REST API development with FastAPI / Flask', 'Database integration with SQLite / SQLAlchemy', 'Automated Unit Testing with pytest'] }
  ],
  java: [
    { stage: 1, title: 'Java Syntax & OOP Foundations', topics: ['JVM, JRE, JDK architecture', 'Primitive vs Reference types', 'Classes, Constructors & Encapsulation'] },
    { stage: 2, title: 'Advanced OOP & Interfaces', topics: ['Abstract Classes & Interfaces', 'Inheritance & Method Overriding', 'Access Modifiers & Package management'] },
    { stage: 3, title: 'Java Collections Framework', topics: ['ArrayList, LinkedList, Vector', 'HashSet, TreeSet, HashMap, TreeMap', 'Comparable and Comparator interfaces'] },
    { stage: 4, title: 'Exception Handling & Concurrency', topics: ['Checked vs Unchecked Exceptions', 'Thread lifecycle, Runnable & Callable', 'Synchronization & ExecutorService'] },
    { stage: 5, title: 'Modern Java (8+) & Spring Boot', topics: ['Lambda Expressions & Stream API', 'Optionals & Method References', 'Building Microservices with Spring Boot & Hibernate'] }
  ],
  react: [
    { stage: 1, title: 'React Fundamentals & JSX', topics: ['JSX syntax rules & component composition', 'Props & conditional rendering', 'Rendering lists with unique keys'] },
    { stage: 2, title: 'Hooks & Local State Management', topics: ['useState for reactive state', 'useEffect lifecycle & cleanup functions', 'Controlled forms and user input validation'] },
    { stage: 3, title: 'Component Reusability & Context API', topics: ['Custom Hooks extraction', 'Context API & useContext for global state', 'useMemo and useCallback performance optimizations'] },
    { stage: 4, title: 'Routing & Asynchronous Data', topics: ['React Router v6/v7 navigation & Protected Routes', 'Fetching data with TanStack Query / fetch', 'Loading, Error, and Empty state boundaries'] },
    { stage: 5, title: 'Full Stack Integration & Testing', topics: ['State machines & Redux Toolkit', 'Unit testing with Vitest & React Testing Library', 'Production Vite build optimization and deployment'] }
  ],
  javascript: [
    { stage: 1, title: 'JavaScript Primitives & Scopes', topics: ['var, let, const lexical scoping', 'Type coercion, truthy/falsy values', 'Functions, arrow syntax & hoisting'] },
    { stage: 2, title: 'DOM & Event Driven Programming', topics: ['Event bubbling and capturing', 'DOM traversal and manipulation', 'Local storage & Session storage'] },
    { stage: 3, title: 'Asynchronous JavaScript', topics: ['Event Loop, Call Stack & Microtask queue', 'Promises (.then, .catch, .finally)', 'async/await and error boundaries'] },
    { stage: 4, title: 'Advanced JS & Prototypal Inheritance', topics: ['Prototypes, prototype chain & Object.create', 'Closures & Module Pattern', 'Destructuring, Spread/Rest & ESModules'] },
    { stage: 5, title: 'Full Stack Node.js Integration', topics: ['Node.js Event Emitter & Streams', 'Express.js REST API creation', 'NPM packaging & security best practices'] }
  ],
  'ui/ux design': [
    { stage: 1, title: 'Design Foundations & Heuristics', topics: ['Nielsen Norman 10 Usability Heuristics', 'Visual Hierarchy, Typography & Color Theory', 'Grid systems, 8pt spacing & Layout composition'] },
    { stage: 2, title: 'User Research & Journey Mapping', topics: ['User interviews, surveys & Persona building', 'Empathy mapping & User Journey maps', 'Information Architecture & Card Sorting'] },
    { stage: 3, title: 'Wireframing & Prototyping (Figma)', topics: ['Low-fidelity wireframing', 'Figma Auto-Layout & Component Variants', 'Interactive Clickable Prototyping'] },
    { stage: 4, title: 'Design Systems & Accessibility', topics: ['Design tokens, typography scales & color styles', 'WCAG 2.1 AA/AAA contrast guidelines', 'Screen reader affordances & accessible tap targets'] },
    { stage: 5, title: 'Usability Testing & Portfolio Capstone', topics: ['A/B testing & heatmaps', 'Unmoderated user testing sessions', 'Documenting case studies for industry portfolios'] }
  ],
  'data science': [
    { stage: 1, title: 'Mathematics & Statistical Foundations', topics: ['Descriptive statistics (Mean, Median, StdDev)', 'Probability distributions & Bayes Theorem', 'Linear algebra (Vectors, Matrices, Dot Products)'] },
    { stage: 2, title: 'Data Wrangling with Python', topics: ['NumPy array operations & broadcasting', 'Pandas Series, DataFrames & GroupBy aggregations', 'Handling missing data and outliers'] },
    { stage: 3, title: 'Exploratory Data Analysis (EDA)', topics: ['Data visualization with Matplotlib and Seaborn', 'Correlation matrices and feature relationships', 'Interactive dashboards with Streamlit'] },
    { stage: 4, title: 'Classical Machine Learning', topics: ['Linear & Logistic Regression', 'Decision Trees, Random Forests & XGBoost', 'Model evaluation metrics (ROC-AUC, F1-Score, RMSE)'] },
    { stage: 5, title: 'Deep Learning & Production ML', topics: ['Neural networks with PyTorch / TensorFlow', 'Natural Language Processing basics', 'Deploying models as REST endpoints with FastAPI'] }
  ]
};

/**
 * @desc    Generate personalized learning roadmap
 * @route   POST /api/ai/roadmap
 * @access  Private / Public
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { skill, currentLevel = 'Beginner', targetLevel = 'Advanced' } = req.body;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required'
      });
    }

    const cleanSkill = skill.toLowerCase().trim();
    let roadmap = ROADMAP_CURRICULA[cleanSkill];

    if (!roadmap) {
      // Dynamic fallback for any arbitrary skill
      roadmap = [
        { stage: 1, title: `${skill} Core Fundamentals`, topics: ['Basic terminology and concepts', 'Environment setup and tooling', 'Initial syntax and syntax rules'] },
        { stage: 2, title: `Intermediate ${skill} Patterns`, topics: ['Core architectural patterns', 'Standard library / toolkit usage', 'Error handling and debugging'] },
        { stage: 3, title: `Practical Projects & Collaboration`, topics: ['Building a complete hands-on project', 'Peer skill exchange and code review', 'Optimization and best practices'] },
        { stage: 4, title: `Advanced Mastery & Verification`, topics: ['Deep-dive topics and edge cases', 'Industry performance standards', 'Passing the SkillSync verification assessment'] }
      ];
    }

    return res.status(200).json({
      success: true,
      skill,
      currentLevel,
      targetLevel,
      stagesCount: roadmap.length,
      roadmap,
      generatedBy: 'SkillSync Adaptive Engine (Deterministic AI)'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Skill Gap Analysis: Compares claimed proficiency with demonstrated assessment scores
 * @route   POST /api/ai/gap-analysis
 * @access  Private
 */
export const analyzeSkillGap = async (req, res, next) => {
  try {
    const user = req.user;
    const { skill } = req.body;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required for gap analysis'
      });
    }

    const claimed = (user.proficiency && user.proficiency[skill]) || 'Intermediate';
    const verif = (user.skillVerifications || []).find(v => v.skill.toLowerCase() === skill.toLowerCase());

    const demonstrated = verif?.demonstratedProficiency || 'Not Demonstrated';
    const score = verif?.score || 0;
    const isVerified = verif?.status === 'SKILL_VERIFIED';

    const gaps = [];
    const recommendations = [];

    if (demonstrated === 'Not Demonstrated') {
      gaps.push(`You have claimed "${claimed}" proficiency in ${skill}, but have not yet demonstrated this knowledge through assessment.`);
      recommendations.push(`Take the ${skill} Skill Assessment to validate your claimed ${claimed} level.`);
      recommendations.push(`Complete at least one practical coding/design challenge in ${skill}.`);
    } else if (claimed === 'Advanced' && demonstrated !== 'Advanced') {
      gaps.push(`Proficiency Gap: Claimed "Advanced", but demonstrated "${demonstrated}" (Score: ${score}%).`);
      recommendations.push(`Focus on advanced concepts: concurrency, architectural patterns, and performance optimization.`);
      recommendations.push(`Retake the assessment after reviewing topics with score under 80%.`);
    } else {
      gaps.push(`Your claimed proficiency matches your demonstrated knowledge (${demonstrated}, ${score}%).`);
      recommendations.push(`Continue to maintain your skill by teaching others on SkillSync.`);
      recommendations.push(`Unlock the "Verified Teacher" badge by completing 3 peer mentoring sessions.`);
    }

    return res.status(200).json({
      success: true,
      skill,
      claimedProficiency: claimed,
      demonstratedProficiency: demonstrated,
      assessmentScore: score,
      isVerified,
      gaps,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Skill Recommendations based on user profile and target goals
 * @route   GET /api/ai/recommendations
 * @access  Private
 */
export const getAISkillRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const offered = (user.skillsOffered || []).map(s => s.toLowerCase());
    const wanted = (user.skillsWanted || []).map(s => s.toLowerCase());

    const recommendations = [];

    // Graph of complementary skill pairings
    if (offered.includes('python') || wanted.includes('python')) {
      if (!offered.includes('data science') && !wanted.includes('data science')) {
        recommendations.push({
          skill: 'Data Science',
          reason: 'Combines naturally with Python for machine learning and data analytics.'
        });
      }
      if (!offered.includes('sql') && !wanted.includes('sql')) {
        recommendations.push({
          skill: 'SQL',
          reason: 'Essential backend companion for querying datasets with Python.'
        });
      }
    }

    if (offered.includes('react') || wanted.includes('react')) {
      if (!offered.includes('node.js') && !wanted.includes('node.js')) {
        recommendations.push({
          skill: 'Node.js',
          reason: 'Completes your full-stack JavaScript repertoire alongside React.'
        });
      }
      if (!offered.includes('ui/ux design') && !wanted.includes('ui/ux design')) {
        recommendations.push({
          skill: 'UI/UX Design',
          reason: 'Empowers frontend developers to craft accessible, intuitive user interfaces.'
        });
      }
    }

    if (offered.includes('java') || wanted.includes('java')) {
      if (!offered.includes('spring boot') && !wanted.includes('spring boot')) {
        recommendations.push({
          skill: 'Spring Boot',
          reason: 'Industry-standard enterprise framework for building scalable Java microservices.'
        });
      }
    }

    // Default suggestions if user has few skills
    if (recommendations.length === 0) {
      recommendations.push(
        { skill: 'Python', reason: 'High-demand, versatile programming language ideal for beginners and AI.' },
        { skill: 'React', reason: 'Most popular modern UI library for building rich web apps.' },
        { skill: 'UI/UX Design', reason: 'Critical creative skill highly sought by software teams.' }
      );
    }

    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Learning Assistant Q&A
 * @route   POST /api/ai/ask-assistant
 * @access  Private
 */
export const askLearningAssistant = async (req, res, next) => {
  try {
    const { skill, query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question query is required'
      });
    }

    // Intelligent pedagogical guidance engine
    const cleanQuery = query.toLowerCase();
    let answer = '';

    if (cleanQuery.includes('roadmap') || cleanQuery.includes('start') || cleanQuery.includes('begin')) {
      answer = `To master ${skill || 'this skill'}, follow a 3-step cadence: 1) Grasp the core primitives and mental model, 2) Build miniature practical apps while consulting official documentation, and 3) Schedule a peer exchange session on SkillSync to teach and reinforce what you learned.`;
    } else if (cleanQuery.includes('difference') || cleanQuery.includes('vs')) {
      answer = `When comparing these concepts in ${skill || 'software engineering'}, the key difference usually lies in mutability, execution lifecycle, and memory allocation. Always consider trade-offs between execution speed and developer readability.`;
    } else if (cleanQuery.includes('verify') || cleanQuery.includes('assessment')) {
      answer = `To earn a verified badge in ${skill || 'your skill'}, visit the SkillSync Assessments hub. Pass the multiple-choice evaluation with 60%+ for "Assessment Passed", or submit a passing coding challenge with 80%+ for the "Skill Verified" badge!`;
    } else {
      answer = `Great question regarding ${skill || 'learning'}! In peer learning, the best approach to "${query}" is to write a small executable proof-of-concept, test its boundaries, and document your learnings in your SkillSync Learning Journal.`;
    }

    return res.status(200).json({
      success: true,
      skill: skill || 'General',
      query,
      answer,
      poweredBy: 'SkillSync Learning Intelligence'
    });
  } catch (error) {
    next(error);
  }
};
