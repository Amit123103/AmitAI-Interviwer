import { Share2, BookOpen, Brain, Briefcase, Code2, Globe, Laptop, Users, Building2, Stethoscope, Landmark, Calculator, Megaphone, Shield, CloudLightning, Settings, PenTool, Database, Monitor, Cpu, Network } from "lucide-react"

// Types
export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert"
export type QuestionType =
    | "Technical"
    | "Behavioral"
    | "System Design"
    | "HR"
    | "Situational"
    | "Case Study"
    | "Aptitude"
    | "Coding"
    | "Government"

export type Category =
    | "Technical & Programming"
    | "Coding & Data Structures"
    | "System Design"
    | "Cloud & DevOps"
    | "Cybersecurity"
    | "Data Science & AI"
    | "Aptitude & Logical"
    | "Government Exams"
    | "Engineering (Core)"
    | "Business & Management"
    | "Medical"
    | "HR & Behavioral"

export interface Question {
    id: string
    title: string
    difficulty: Difficulty
    type: QuestionType
    category: Category
    subcategory: string
    role: string[]
    company?: string[]
    examType?: string[] // e.g., UPSC, SSC, BANK PO
    tags: string[]
    answer: string
    codeSnippet?: string // New field for code
    keyPoints: string[]
    tips?: string[]
    practiced?: boolean
    mastered?: boolean
    bookmarked?: boolean
    views?: number
    createdAt?: Date
}

// --- Data Lists ---

export const COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix",
    "Uber", "Airbnb", "Tesla", "SpaceX", "IBM", "Oracle", "Cisco",
    "Adobe", "Salesforce", "Intel", "NVIDIA", "Samsung", "Sony",
    "TCS", "Infosys", "Wipro", "HCL", "Accenture", "Cognizant", "Capgemini",
    "Deloitte", "KPMG", "PwC", "EY", "McKinsey", "BCG", "Bain",
    "Goldman Sachs", "JPMorgan", "Morgan Stanley", "Citi", "Wells Fargo",
    "Walmart", "Target", "Flipkart", "Myntra", "Paytm", "Zerodha", "Razorpay",
    "Swiggy", "Zomato", "Uber Eats", "Doordash",
    "Startup", "MNC", "Product Based"
]

export const ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "DevOps Engineer",
    "Data Scientist", "Data Engineer", "ML Engineer", "AI Researcher",
    "Product Manager", "Project Manager", "Business Analyst",
    "UI/UX Designer", "QA Engineer", "SDET",
    "Cybersecurity Analyst", "Network Engineer",
    "Cloud Architect", "Solutions Architect",
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer",
    "Doctor", "Nurse", "Pharmacist",
    "Teacher", "Professor",
    "Investment Banker", "Financial Analyst", "Accountant",
    "Marketing Manager", "Sales Executive", "HR Manager", "Recruiter",
    "Government Aspirant"
]

// Icon mapping
export const CATEGORIES: { name: Category, icon: any, color: string }[] = [
    { name: "Technical & Programming", icon: Monitor, color: "text-blue-500" },
    { name: "Coding & Data Structures", icon: Code2, color: "text-purple-500" },
    { name: "System Design", icon: Laptop, color: "text-orange-500" },
    { name: "Cloud & DevOps", icon: CloudLightning, color: "text-cyan-500" },
    { name: "Cybersecurity", icon: Shield, color: "text-red-500" },
    { name: "Data Science & AI", icon: Share2, color: "text-indigo-500" },
    { name: "Aptitude & Logical", icon: Brain, color: "text-violet-500" },
    { name: "Government Exams", icon: Landmark, color: "text-amber-500" },
    { name: "Engineering (Core)", icon: Settings, color: "text-slate-500" },
    { name: "Business & Management", icon: Briefcase, color: "text-blue-600" },
    { name: "HR & Behavioral", icon: Users, color: "text-teal-500" },
    { name: "Medical", icon: Stethoscope, color: "text-pink-500" },
]

// --- Generator Logic ---

// Helper to pick random item
const sample = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

// Helper to pick n random unique items
const sampleUnique = (arr: any[], n: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

const TECHNICAL_TOPICS = [
    { sub: "OOP", tags: ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction", "Classes", "Objects"] },
    { sub: "Operating Systems", tags: ["Process Mgmt", "Threads", "Deadlock", "Virtual Memory", "Paging", "Scheduling Algorithms"] },
    { sub: "DBMS", tags: ["SQL vs NoSQL", "Normalization", "ACID Properties", "Indexing", "Transactions", "Sharding"] },
    { sub: "Computer Networks", tags: ["TCP/IP", "HTTP/HTTPS", "DNS", "OSI Model", "WebSockets", "Load Balancers"] },
    { sub: "Web Development", tags: ["React Hooks", "Node.js Event Loop", "DOM Manipulation", "REST APIs", "GraphQL", "Web Performance"] }
]

const CLOUD_DEVOPS_TOPICS = [
    { sub: "AWS", tags: ["EC2", "S3", "Lambda", "DynamoDB", "VPC", "IAM"] },
    { sub: "Azure", tags: ["Virtual Machines", "Azure Functions", "Cosmos DB", "Active Directory"] },
    { sub: "Docker", tags: ["Containers", "Images", "Docker Compose", "Volumes", "Networking"] },
    { sub: "Kubernetes", tags: ["Pods", "Deployments", "Services", "Ingress", "Helm Charts"] },
    { sub: "CI/CD", tags: ["Jenkins", "GitHub Actions", "GitLab CI", "Pipelines", "Automated Testing"] }
]

const SYSTEM_DESIGN_TOPICS = [
    { sub: "Scalability", tags: ["Horizontal vs Vertical", "Caching Strategies", "Load Balancing", "Database Sharding"] },
    { sub: "Distributed Systems", tags: ["CAP Theorem", "Consistent Hashing", "Microservices", "Event-Driven Arch"] },
    { sub: "High Level Design", tags: ["Design Uber", "Design Instagram", "Design WhatsApp", "Design Netflix"] },
    { sub: "Low Level Design", tags: ["Design Parking Lot", "Design Elevator", "Design Rate Limiter", "Design LRU Cache"] }
]

const AI_DS_TOPICS = [
    { sub: "Machine Learning", tags: ["Supervised Learning", "Unsupervised Learning", "Regression", "Classification", "Overfitting"] },
    { sub: "Deep Learning", tags: ["Neural Networks", "CNN", "RNN", "Transformers", "Activation Functions"] },
    { sub: "NLP", tags: ["Tokenization", "Embeddings", "BERT", "GPT", "Sentiment Analysis"] },
    { sub: "Data Engineering", tags: ["ETL Pipelines", "Data Warehousing", "Big Data", "Spark", "Hadoop"] }
]

const SECURITY_TOPICS = [
    { sub: "Web Security", tags: ["XSS", "CSRF", "SQL Injection", "CORS", "CSP"] },
    { sub: "Network Security", tags: ["Firewalls", "VPN", "DDoS Mitigation", "TLS/SSL"] },
    { sub: "Cryptography", tags: ["Symmetric vs Asymmetric", "Hashing", "Encryption", "Digital Signatures"] },
    { sub: "Auth", tags: ["OAuth 2.0", "JWT", "SAML", "MFA", "RBAC"] }
]

const CODING_TOPICS = [
    { sub: "Arrays & Strings", tags: ["Two Pointer", "Sliding Window", "Prefix Sum"] },
    { sub: "Linked List", tags: ["Fast & Slow Pointers", "Reversal", "Cycle Detection"] },
    { sub: "Trees & Graphs", tags: ["DFS", "BFS", "BST", "Topological Sort", "Dijkstra"] },
    { sub: "Dynamic Programming", tags: ["Memoization", "Tabulation", "Knapsack", "LCS"] },
    { sub: "System Design Coding", tags: ["LRU Cache", "Rate Limiter", "Consistent Hashing Implementation"] },
    { sub: "Recursion & Backtracking", tags: ["Permutations", "Subsets", "N-Queens", "Sudoku Solver"] }
]

const APTITUDE_TOPICS = [
    { sub: "Quantitative Aptitude", tags: ["Percentages", "Profit & Loss", "Time & Work", "Speed & Distance", "Simple Interest"] },
    { sub: "Logical Reasoning", tags: ["Puzzles", "Blood Relations", "Coding-Decoding", "Seating Arrangement", "Syllogism"] },
    { sub: "Verbal Ability", tags: ["Reading Comprehension", "Grammar", "Vocabulary", "Sentence Correction", "Para Jumbles"] },
    { sub: "Data Interpretation", tags: ["Bar Graphs", "Pie Charts", "Line Charts", "Tabular Data"] }
]

const GOVT_EXAMS = [
    { sub: "UPSC", tags: ["Indian Polity", "Modern History", "Geography", "Economics", "Current Affairs"] },
    { sub: "SSC CGL", tags: ["General Intelligence", "Quantitative Aptitude", "General Awareness", "English Comprehension"] },
    { sub: "Banking PO", tags: ["Reasoning Ability", "Quantitative Aptitude", "Computer Knowledge", "Banking Awareness"] },
    { sub: "Railways NTPC", tags: ["General Science", "Mathematics", "General Awareness"] },
    { sub: "State PSC", tags: ["State History", "State Geography", "Local Governance"] }
]

const CODE_TEMPLATES: Record<string, string> = {
    "Arrays & Strings": `function solve(nums, target) {
  // Initialize pointers or map
  let map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    // Check condition
    if (map.has(target - nums[i])) {
      return [map.get(target - nums[i]), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    "Linked List": `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let curr = head;
  
  while (curr !== null) {
    let nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
    "Trees & Graphs": `function dfs(node, visited) {
  if (!node || visited.has(node.val)) return;
  
  visited.add(node.val);
  console.log(node.val);
  
  for (let neighbor of node.neighbors) {
    dfs(neighbor, visited);
  }
}`,
    "Dynamic Programming": `function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}`
}

// Template Generators
const GENERATORS = [
    // 1. Technical & Programming (General)
    (i: number) => {
        const topic = sample(TECHNICAL_TOPICS)
        const templates = [
            `Explain the concept of ${sample(topic.tags)} in the context of ${topic.sub}.`,
            `What are the key differences between various approaches to ${sample(topic.tags)}?`,
            `How would you implement or utilize ${sample(topic.tags)} in a real-world application?`,
            `Discuss the pros and cons of using ${sample(topic.tags)} in ${topic.sub}.`
        ]
        return {
            title: sample(templates),
            category: "Technical & Programming" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Beginner", "Intermediate", "Advanced"]) as Difficulty,
            type: "Technical" as QuestionType,
            role: ["SDE", "Full Stack Developer", "Backend Developer"],
            company: sampleUnique(COMPANIES, 2),
            tags: [topic.sub, ...topic.tags.slice(0, 3)],
            answer: `A detailed explanation covering the core aspects of ${topic.sub}, specifically focusing on ${sample(topic.tags)}. It addresses performance implications and best practices.`,
            keyPoints: ["Core Concept", "Performance", "Scalability", "Common Pitfalls"],
        }
    },
    // 2. Coding & DSA
    (i: number) => {
        const topic = sample(CODING_TOPICS)
        const templates = [
            `Write an optimized algorithm to solve the ${sample(topic.tags)} problem.`,
            `Implement a function that handles ${sample(topic.tags)} efficiently.`,
            `Given a scenario involving ${topic.sub}, how would you apply ${sample(topic.tags)}?`,
            `Optimize the standard approach for ${sample(topic.tags)} to achieve better time complexity.`
        ]
        return {
            title: sample(templates),
            category: "Coding & Data Structures" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Intermediate", "Advanced", "Expert"]) as Difficulty,
            type: "Coding" as QuestionType,
            role: ["SDE", "Software Engineer", "Backend Developer"],
            company: [...sampleUnique(COMPANIES, 2), "Google"],
            tags: ["DSA", topic.sub, "Problem Solving"],
            codeSnippet: CODE_TEMPLATES[topic.sub] || `function solve(input) {\n  // Optimized solution here\n}`,
            answer: "Use an optimized approach involving data structures like Hash Map or Two Pointers to reduce time complexity to O(n) or O(log n).",
            keyPoints: ["Time Complexity: O(n)", "Space Complexity: O(1)", "Edge Cases Handling"],
        }
    },
    // 3. System Design
    (i: number) => {
        const topic = sample(SYSTEM_DESIGN_TOPICS)
        return {
            title: `System Design: ${sample(topic.tags)}`,
            category: "System Design" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Advanced", "Expert"]) as Difficulty,
            type: "System Design" as QuestionType,
            role: ["Senior Engineer", "Architect", "Lead"],
            company: [sample(COMPANIES), "Netflix", "Uber"],
            tags: ["Scalability", "Architecture", topic.sub],
            answer: "Discussing the high-level architecture, database schema, API design, and trade-offs involving Consistency vs Availability.",
            keyPoints: ["Scalability", "Fault Tolerance", "Data Consistency", "Bottlenecks"],
        }
    },
    // 4. Cloud & DevOps
    (i: number) => {
        const topic = sample(CLOUD_DEVOPS_TOPICS)
        return {
            title: `Explain how ${sample(topic.tags)} is used in Modern DevOps pipelines.`,
            category: "Cloud & DevOps" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Intermediate", "Advanced"]) as Difficulty,
            type: "Technical" as QuestionType,
            role: ["DevOps Engineer", "Cloud Architect"],
            company: [sample(COMPANIES), "Amazon", "Microsoft"],
            tags: ["Cloud", "Infrastructure", topic.sub],
            answer: "Focus on automation, reliability, and creating reproducible infrastructure using code.",
            keyPoints: ["Automation", "Scalability", "Security", "Cost Optimization"],
        }
    },
    // 5. Security & AI
    (i: number) => {
        const isAI = Math.random() > 0.5
        const topic = isAI ? sample(AI_DS_TOPICS) : sample(SECURITY_TOPICS)
        return {
            title: isAI ? `Explain the '${sample(topic.tags)}' concept in AI/ML.` : `How do you mitigate '${sample(topic.tags)}' attacks?`,
            category: (isAI ? "Data Science & AI" : "Cybersecurity") as Category,
            subcategory: topic.sub,
            difficulty: sample(["Intermediate", "Advanced"]) as Difficulty,
            type: "Technical" as QuestionType,
            role: isAI ? ["Data Scientist", "ML Engineer"] : ["Cybersecurity Analyst"],
            company: [sample(COMPANIES)],
            tags: [topic.sub, ...topic.tags.slice(0, 2)],
            answer: "Detailed technical breakdown including implementation details and best practices.",
            keyPoints: ["Core Principle", "Implementation", "Risk Factors", "Tools"],
        }
    },
    // 6. Aptitude
    (i: number) => {
        const topic = sample(APTITUDE_TOPICS)
        return {
            title: `Find the solution for this ${sample(topic.tags)} problem...`,
            category: "Aptitude & Logical" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Beginner", "Intermediate"]) as Difficulty,
            type: "Aptitude" as QuestionType,
            role: ["All Roles", "Banking", "SSC"],
            company: [],
            examType: ["CAT", "GATE", "SSC", "Banking"],
            tags: ["Aptitude", topic.sub],
            answer: "Detailed step-by-step mathematical or logical derivation of the answer.",
            keyPoints: ["Formula", "Shortcut method", "Verification"],
        }
    },
    // 7. Government
    (i: number) => {
        const topic = sample(GOVT_EXAMS)
        return {
            title: `Critical question on ${sample(topic.tags)} for ${topic.sub}`,
            category: "Government Exams" as Category,
            subcategory: topic.sub,
            difficulty: sample(["Intermediate", "Advanced"]) as Difficulty,
            type: "Government" as QuestionType,
            role: ["Government Aspirant", "Civil Servant"],
            company: [],
            examType: [topic.sub],
            tags: ["General Studies", topic.sub, "Current Affairs"],
            answer: "Comprehensive answer citing relevant historical facts, constitutional articles, or scientific principles.",
            keyPoints: ["Facts", "Dates", "Key Figures", "Policy Details"],
        }
    }
]

function generateQuestions(): Question[] {
    const questions: Question[] = []
    let idCounter = 1

    // Generate 15,000 questions with weighted distribution
    for (let i = 0; i < 15000; i++) {
        let generatorIndex;
        const rand = Math.random();

        // 30% Tech, 25% Coding, 10% System Design, 10% Cloud/DevOps, 10% AI/Sec, 10% Aptitude, 5% Govt
        if (rand < 0.30) generatorIndex = 0; // Technical
        else if (rand < 0.55) generatorIndex = 1; // Coding
        else if (rand < 0.65) generatorIndex = 2; // System Design
        else if (rand < 0.75) generatorIndex = 3; // Cloud/DevOps
        else if (rand < 0.85) generatorIndex = 4; // AI/Security
        else if (rand < 0.95) generatorIndex = 5; // Aptitude
        else generatorIndex = 6; // Government

        const template = GENERATORS[generatorIndex](i)

        questions.push({
            id: `q-${idCounter++}`,
            // @ts-ignore
            ...template,
            views: Math.floor(Math.random() * 50000),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 31536000000)), // Random date within last year
            tips: ["Read clearly", "Manage time", "Think about edge cases", "Structure your answer"],
            bookmarked: Math.random() < 0.05,
            practiced: Math.random() < 0.1,
            mastered: Math.random() < 0.02
        } as Question)
    }

    return questions
}

export const QUESTIONS: Question[] = generateQuestions()

