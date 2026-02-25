import {
    Code2, Database, Shield, Wrench, Briefcase, TrendingUp, Users, Landmark,
    BookOpen, Stethoscope, Palette, Plane, Scale, MessageCircle,
    Cpu, Globe, Server, Smartphone, Layout, Terminal, Calculator, HardHat,
    Building2, GraduationCap, Microscope, HeartPulse, PenTool, Hotel, Gavel,
    Mic, Video, Brain, Cloud, Zap, Target, DollarSign, Store, Truck, Coffee,
    Utensils, Factory, Anchor, Radio, Signal, Music, Film, Search, FileText,
    Activity, Car, Bike, Gamepad2, BarChart3, Blocks, Command, Settings
} from "lucide-react"

export interface PracticeModule {
    id: string
    title: string
    category: string
    description: string
    topics: string[]
    difficultyLevels: string[]
    icon: any
    color: string
    type: "Company" | "Role"
}

// ==================================================================================
// COMPANY TRACKS (50+)
// ==================================================================================
export const COMPANY_TRACKS: PracticeModule[] = [
    // --- MAANG / Big Tech ---
    { id: "comp-google", title: "Google", category: "Big Tech", description: "DSA, System Design, and Googlyness leadership principles.", topics: ["Graph Algorithms", "Dynamic Programming", "System Design", "Googlyness"], difficultyLevels: ["Advanced", "Expert"], icon: Search, color: "text-blue-500", type: "Company" },
    { id: "comp-amazon", title: "Amazon", category: "Big Tech", description: "Focus on Leadership Principles (LPs) and Bar Raiser rounds.", topics: ["Leadership Principles", "OOD", "System Design", "Scalability"], difficultyLevels: ["Advanced", "Expert"], icon: Store, color: "text-orange-500", type: "Company" },
    { id: "comp-facebook", title: "Meta", category: "Big Tech", description: "Product Architecture, Coding, and Jedi behavioral rounds.", topics: ["Product Design", "Coding Speed", "Recursion", "Culture Fit"], difficultyLevels: ["Advanced", "Expert"], icon: Facebook, color: "text-blue-600", type: "Company" },
    { id: "comp-apple", title: "Apple", category: "Big Tech", description: "Domain expertise, hardware/software integration, and secrecy.", topics: ["Concurrency", "Hardware Interaction", "Swift/C++", "Optimization"], difficultyLevels: ["Advanced", "Expert"], icon: Command, color: "text-zinc-400", type: "Company" },
    { id: "comp-netflix", title: "Netflix", category: "Big Tech", description: "Culture deck, freedom & responsibility, and system design.", topics: ["Culture Memo", "High Availability", "Distributed Systems", "Context vs Control"], difficultyLevels: ["Expert"], icon: Tv, color: "text-red-600", type: "Company" },
    { id: "comp-microsoft", title: "Microsoft", category: "Big Tech", description: "Object Oriented Design, testing, and collaborative culture.", topics: ["OOD", "Testing", "C#/.NET/Azure", "Behavioral"], difficultyLevels: ["Intermediate", "Advanced"], icon: Layout, color: "text-blue-400", type: "Company" },

    // --- Service Giants (India/Global) ---
    { id: "comp-tcs", title: "TCS", category: "Service & Consulting", description: "NQT patterns, core coding, and managerial rounds.", topics: ["Arrays/Strings", "SQL", "Aptitude", "Managerial"], difficultyLevels: ["Beginner", "Intermediate"], icon: Building2, color: "text-blue-700", type: "Company" },
    { id: "comp-infosys", title: "Infosys", category: "Service & Consulting", description: "InfyTQ, pseudocode, and puzzle-based logic.", topics: ["Pseudocode", "Puzzles", "OOPs", "DB Management"], difficultyLevels: ["Beginner", "Intermediate"], icon: Code2, color: "text-blue-600", type: "Company" },
    { id: "comp-wipro", title: "Wipro", category: "Service & Consulting", description: "NLTH patterns, essay writing, and coding basics.", topics: ["Verbal Ability", "Basic Coding", "Logical Reasoning", "Essay"], difficultyLevels: ["Beginner"], icon: Cpu, color: "text-purple-600", type: "Company" },
    { id: "comp-accenture", title: "Accenture", category: "Service & Consulting", description: "Cognitive assessment, coding, and communication.", topics: ["Cognitive Ability", "Cloud Basics", "Agile", "Communication"], difficultyLevels: ["Intermediate"], icon: Briefcase, color: "text-indigo-600", type: "Company" },
    { id: "comp-cognizant", title: "Cognizant", category: "Service & Consulting", description: "GenC & GenC Next patterns, Java/Python basics.", topics: ["Automata Fix", "SQL", "Java Basics", "Aptitude"], difficultyLevels: ["Intermediate"], icon: Settings, color: "text-blue-500", type: "Company" },
    { id: "comp-capgemini", title: "Capgemini", category: "Service & Consulting", description: "Game-based aptitude, pseudocode, and English test.", topics: ["Game Aptitude", "Pseudocode", "Behavioral", "English"], difficultyLevels: ["Intermediate"], icon: Hexagon, color: "text-blue-400", type: "Company" },
    { id: "comp-ibm", title: "IBM", category: "Service & Consulting", description: "Cognitive games, coding, and English proficiency.", topics: ["Cognitive Games", "Cloud/AI", "English", "Problem Solving"], difficultyLevels: ["Intermediate", "Advanced"], icon: Server, color: "text-blue-800", type: "Company" },

    // --- Product & Startups (India) ---
    { id: "comp-flipkart", title: "Flipkart", category: "Product & Startup", description: "Machine coding rounds and system design for e-commerce.", topics: ["Machine Coding", "LLD/HLD", "DP/Graphs", "Customer First"], difficultyLevels: ["Advanced"], icon: ShoppingCart, color: "text-yellow-500", type: "Company" },
    { id: "comp-zomato", title: "Zomato", category: "Product & Startup", description: "Product thinking, scalability, and hustle culture.", topics: ["Scalability", "Product Sense", "Database Design", "Culture"], difficultyLevels: ["Advanced"], icon: Utensils, color: "text-red-500", type: "Company" },
    { id: "comp-swiggy", title: "Swiggy", category: "Product & Startup", description: "Logistics optimization, LLD, and problem solving.", topics: ["DSA", "Low Level Design", "Optimization", "Concurrency"], difficultyLevels: ["Advanced"], icon: Truck, color: "text-orange-500", type: "Company" },
    { id: "comp-paytm", title: "Paytm", category: "Product & Startup", description: "Fintech domain, transaction handling, and stability.", topics: ["Transactions", "ACID Properties", "DSA", "System Design"], difficultyLevels: ["Advanced"], icon: Wallet, color: "text-blue-900", type: "Company" },
    { id: "comp-razorpay", title: "Razorpay", category: "Product & Startup", description: "Code quality, API design, and fintech infrastructure.", topics: ["API Design", "Refactoring", "Clean Code", "Payment Gateways"], difficultyLevels: ["Advanced"], icon: DollarSign, color: "text-blue-600", type: "Company" },
    { id: "comp-freshworks", title: "Freshworks", category: "Product & Startup", description: "SaaS metrics, clean code, and craftsmanship.", topics: ["SaaS Architecture", "Ruby/Java", "DSA", "Problem Solving"], difficultyLevels: ["Intermediate", "Advanced"], icon: Smile, color: "text-orange-400", type: "Company" },
    { id: "comp-zoho", title: "Zoho", category: "Product & Startup", description: "Logic-heavy, puzzles, and long-term thinking.", topics: ["C Programming", "Logic Puzzles", "Algorithms", "Optimization"], difficultyLevels: ["Advanced"], icon: Box, color: "text-yellow-600", type: "Company" },

    // --- Global Tech ---
    { id: "comp-oracle", title: "Oracle", category: "Product Giant", description: "Database internals, cloud infrastructure, and Java.", topics: ["DBMS Internals", "SQL/PLSQL", "Cloud Infra", "Java"], difficultyLevels: ["Advanced"], icon: Database, color: "text-red-700", type: "Company" },
    { id: "comp-cisco", title: "Cisco", category: "Product Giant", description: "Networking protocols, embedded coding, and security.", topics: ["Networking (OSI)", "Embedded C", "Security", "Python"], difficultyLevels: ["Intermediate", "Advanced"], icon: Router, color: "text-cyan-600", type: "Company" },
    { id: "comp-salesforce", title: "Salesforce", category: "Product Giant", description: "Apex/Java, cloud patterns, and Ohana culture.", topics: ["Apex/Java", "Cloud Patterns", "System Design", "Culture"], difficultyLevels: ["Advanced"], icon: Cloud, color: "text-blue-400", type: "Company" },
    { id: "comp-adobe", title: "Adobe", category: "Product Giant", description: "Geometry algorithms, image processing, and puzzles.", topics: ["Geometry Algos", "OS Concepts", "C++", "Puzzles"], difficultyLevels: ["Advanced"], icon: Image, color: "text-red-600", type: "Company" },
    { id: "comp-nvidia", title: "NVIDIA", category: "Product Giant", description: "Hardware arch, CUDA, C++, and deep learning.", topics: ["Computer Arch", "CUDA", "C++", "Deep Learning"], difficultyLevels: ["Expert"], icon: Cpu, color: "text-green-500", type: "Company" },
    { id: "comp-tesla", title: "Tesla", category: "Product Giant", description: "First principles thinking, engineering hardness, and C++.", topics: ["First Principles", "Embedded Systems", "Hardware/Software", "C++"], difficultyLevels: ["Expert"], icon: Activity, color: "text-red-600", type: "Company" },

    // --- Consulting & Finance ---
    { id: "comp-deloitte", title: "Deloitte", category: "Consulting", description: "Case studies, tech consulting, and situational aptitude.", topics: ["Case Interview", "Tech Trends", "Situational", "ERP"], difficultyLevels: ["Intermediate"], icon: Briefcase, color: "text-green-800", type: "Company" },
    { id: "comp-mckinsey", title: "McKinsey", category: "Consulting", description: "Problem solving game, case interviews, and PEI.", topics: ["Problem Solving", "Case Frameworks", "Leadership", "Analytics"], difficultyLevels: ["Expert"], icon: TrendingUp, color: "text-blue-900", type: "Company" },
    { id: "comp-goldman", title: "Goldman Sachs", category: "Finance Tech", description: "Math heavy, DP/Probability, and financial aptitude.", topics: ["Probability", "DP", "Math", "Finance Basics"], difficultyLevels: ["Advanced"], icon: Landmark, color: "text-blue-500", type: "Company" },
    { id: "comp-jpmc", title: "J.P. Morgan", category: "Finance Tech", description: "Modern tech stack, Java/Python, and behavioral.", topics: ["Java/Spring", "System Design", "Behavioral", "Fintech"], difficultyLevels: ["Advanced"], icon: DollarSign, color: "text-slate-800", type: "Company" },

    // More placeholders to reach 50+
    { id: "comp-uber", title: "Uber", category: "Big Tech", description: "Concurrency, dispatch algorithms, and system design.", topics: ["Concurrency", "Geo-hashing", "System Design", "Marketplace"], difficultyLevels: ["Advanced"], icon: Car, color: "text-black", type: "Company" },
    { id: "comp-airbnb", title: "Airbnb", category: "Big Tech", description: "Core values, design system, and Ruby/Java.", topics: ["Core Values", "Frontend Arch", "System Design", "Booking Logic"], difficultyLevels: ["Advanced"], icon: Home, color: "text-rose-500", type: "Company" },
    { id: "comp-twitter", title: "X (Twitter)", category: "Big Tech", description: "Scale, real-time systems, and recommendation engines.", topics: ["Real-time Systems", "Scala/Java", "Graph Processing", "System Design"], difficultyLevels: ["Advanced"], icon: Send, color: "text-black", type: "Company" },
    { id: "comp-linkedin", title: "LinkedIn", category: "Big Tech", description: "Concurreny, data stores, and craftmanship.", topics: ["Concurrency", "Key-Value Stores", "Java", "System Design"], difficultyLevels: ["Advanced"], icon: Linkedin, color: "text-blue-700", type: "Company" },
    { id: "comp-spotify", title: "Spotify", category: "Big Tech", description: "Autonomous squads, system design, and audio streaming.", topics: ["System Design", "Culture", "Agile", "Streaming Arch"], difficultyLevels: ["Advanced"], icon: Music, color: "text-green-500", type: "Company" },
    { id: "comp-intuit", title: "Intuit", category: "Product", description: "Craft skills, customer empathy, and financial domain.", topics: ["Craft Demo", "Customer Empathy", "Java/AWS", "System Design"], difficultyLevels: ["Advanced"], icon: Calculator, color: "text-blue-600", type: "Company" },
    { id: "comp-paypal", title: "PayPal", category: "Fintech", description: "Security, payments architecture, and Node/Java.", topics: ["Payment Flow", "Security", "Node.js", "Distributed Systems"], difficultyLevels: ["Advanced"], icon: DollarSign, color: "text-blue-800", type: "Company" },
    { id: "comp-grab", title: "Grab", category: "Product", description: "Superapp architecture, geo-services, and golang.", topics: ["Golang", "Microservices", "Geo-spatial", "System Design"], difficultyLevels: ["Advanced"], icon: Car, color: "text-green-600", type: "Company" },
    { id: "comp-gojek", title: "Gojek", category: "Product", description: "Clojure/Java, functional programming, and scale.", topics: ["Functional Prog", "Clojure/Java", "Concurrency", "Scale"], difficultyLevels: ["Advanced"], icon: Bike, color: "text-green-700", type: "Company" },
    { id: "comp-atlassian", title: "Atlassian", category: "Product", description: "Values interview, system design, and coding.", topics: ["Values", "System Design", "Coding", "React/Java"], difficultyLevels: ["Advanced"], icon: Wrench, color: "text-blue-600", type: "Company" },

    // ... Additional companies can be added here
];


// ==================================================================================
// ROLE TRACKS (100+)
// ==================================================================================
export const ROLE_TRACKS: PracticeModule[] = [
    // --- Software & Tech (30+) ---
    { id: "role-frontend", title: "Frontend Developer", category: "Software & IT", description: "React, Vue, Angular, HTML/CSS mastery.", topics: ["React", "CSS", "Performance", "A11y"], difficultyLevels: ["Intermediate", "Advanced"], icon: Layout, color: "text-blue-500", type: "Role" },
    { id: "role-backend", title: "Backend Developer", category: "Software & IT", description: "API design, DBs, and server logic.", topics: ["Node", "SQL", "System Design", "Rest"], difficultyLevels: ["Intermediate", "Expert"], icon: Server, color: "text-green-500", type: "Role" },
    { id: "role-fullstack", title: "Full Stack Developer", category: "Software & IT", description: "End-to-end web development.", topics: ["MERN", "DevOps", "Auth", "Deploy"], difficultyLevels: ["Intermediate", "Expert"], icon: Code2, color: "text-purple-500", type: "Role" },
    { id: "role-mobile-ios", title: "iOS Developer", category: "Software & IT", description: "Swift, UIKit, SwiftUI.", topics: ["Swift", "UIKit", "CoreData", "Memory"], difficultyLevels: ["Advanced"], icon: Smartphone, color: "text-gray-400", type: "Role" },
    { id: "role-mobile-android", title: "Android Developer", category: "Software & IT", description: "Kotlin, Jetpack, Android SDK.", topics: ["Kotlin", "Jetpack", "Coroutines", "MVVM"], difficultyLevels: ["Advanced"], icon: Smartphone, color: "text-green-500", type: "Role" },
    { id: "role-devops", title: "DevOps Engineer", category: "Software & IT", description: "CI/CD, Cloud, Docker.", topics: ["Docker", "K8s", "AWS", "Jenkins"], difficultyLevels: ["Intermediate", "Expert"], icon: Cloud, color: "text-orange-500", type: "Role" },
    { id: "role-qa", title: "QA Engineer", category: "Software & IT", description: "Automation, Selenium, Testing.", topics: ["Selenium", "Java", "TestNG", "Manual"], difficultyLevels: ["Beginner", "Intermediate"], icon: Wrench, color: "text-yellow-500", type: "Role" },
    { id: "role-cyber", title: "Cybersecurity Analyst", category: "Software & IT", description: "Network security, Pen-testing.", topics: ["Network", "Ethical Hacking", "Forensics", "Compliance"], difficultyLevels: ["Advanced"], icon: Shield, color: "text-red-600", type: "Role" },
    { id: "role-game-dev", title: "Game Developer", category: "Software & IT", description: "Unity, Unreal, C#.", topics: ["Unity", "C#", "3D Math", "Physics"], difficultyLevels: ["Intermediate"], icon: Gamepad2, color: "text-purple-600", type: "Role" },
    { id: "role-data-scientist", title: "Data Scientist", category: "Data & AI", description: "ML Models, Statistics, Python.", topics: ["ML", "Stats", "Python", "Pandas"], difficultyLevels: ["Advanced", "Expert"], icon: Database, color: "text-indigo-500", type: "Role" },
    { id: "role-data-analyst", title: "Data Analyst", category: "Data & AI", description: "SQL, Tableau, Excel.", topics: ["SQL", "Viz", "Cleaning", "Reporting"], difficultyLevels: ["Beginner", "Intermediate"], icon: BarChart3, color: "text-blue-400", type: "Role" },
    { id: "role-ml-eng", title: "ML Engineer", category: "Data & AI", description: "Deploying models, MLOps.", topics: ["Tensorflow", "Deployment", "Pipelines", "Cloud AI"], difficultyLevels: ["Expert"], icon: Brain, color: "text-purple-500", type: "Role" },
    { id: "role-blockchain", title: "Blockchain Developer", category: "Software & IT", description: "Smart contracts, Solidity.", topics: ["Solidity", "Web3", "Consensus", "Cryptography"], difficultyLevels: ["Advanced"], icon: Blocks, color: "text-black", type: "Role" },
    { id: "role-sre", title: "Site Reliability Eng.", category: "Software & IT", description: "Reliability, monitoring, SLAs.", topics: ["Linux", "Scripting", "Monitoring", "Incidents"], difficultyLevels: ["Expert"], icon: Activity, color: "text-green-600", type: "Role" },
    { id: "role-embedded", title: "Embedded Engineer", category: "Software & IT", description: "C, RTOS, Hardware.", topics: ["C", "RTOS", "Microcontrollers", "Drivers"], difficultyLevels: ["Advanced"], icon: Cpu, color: "text-red-500", type: "Role" },

    // --- Government & Civil Services (20+) ---
    { id: "role-upsc", title: "Civil Services (IAS)", category: "Government", description: "Policy, Ethics, Personality.", topics: ["Polity", "Ethics", "Current Affairs", "Situational"], difficultyLevels: ["Expert"], icon: Landmark, color: "text-amber-600", type: "Role" },
    { id: "role-bank-po", title: "Bank Probationary Officer", category: "Government", description: "Banking, Finance, Logic.", topics: ["Banking", "Finance", "Reasoning", "English"], difficultyLevels: ["Intermediate"], icon: Building2, color: "text-green-700", type: "Role" },
    { id: "role-ssc", title: "SSC Officer", category: "Government", description: "Govt Admin roles.", topics: ["Aptitude", "GK", "English", "Reasoning"], difficultyLevels: ["Intermediate"], icon: Briefcase, color: "text-blue-600", type: "Role" },
    { id: "role-defense", title: "Defense Officer (NDA)", category: "Government", description: "SSB Interview, Leadership.", topics: ["Leadership", "Psych", "Physical", "GK"], difficultyLevels: ["Advanced"], icon: Shield, color: "text-olive-600", type: "Role" },
    { id: "role-rbi", title: "RBI Grade B", category: "Government", description: "Central Bank policies.", topics: ["Economics", "Finance", "Management", "Policy"], difficultyLevels: ["Expert"], icon: Bookmark, color: "text-blue-800", type: "Role" },
    { id: "role-railway", title: "Railway Engineer", category: "Government", description: "Technical + Admin.", topics: ["Core Eng", "Admin", "Safety", "GK"], difficultyLevels: ["Intermediate"], icon: Train, color: "text-zinc-600", type: "Role" },
    { id: "role-psu-eng", title: "PSU Engineer (GATE)", category: "Government", description: "Technical Core.", topics: ["Core Subject", "Projects", "HR", "Industry"], difficultyLevels: ["Advanced"], icon: Factory, color: "text-orange-600", type: "Role" },
    { id: "role-teacher-govt", title: "Govt Teacher", category: "Government", description: "Pedagogy & Subject.", topics: ["Child Psych", "Subject", "Teaching", "Lang"], difficultyLevels: ["Intermediate"], icon: BookOpen, color: "text-pink-600", type: "Role" },
    { id: "role-police", title: "Police Officer", category: "Government", description: "Law & Order.", topics: ["Law", "Situational", "Ethics", "Physical"], difficultyLevels: ["Intermediate"], icon: Shield, color: "text-blue-900", type: "Role" },
    { id: "role-forester", title: "Forest Officer", category: "Government", description: "Environment & Ecology.", topics: ["Ecology", "Botany", "Conservation", "Admin"], difficultyLevels: ["Advanced"], icon: Trees, color: "text-green-800", type: "Role" },

    // --- Medical & Healthcare (15+) ---
    { id: "role-doctor", title: "Medical Officer", category: "Healthcare", description: "Clinical diagnosis.", topics: ["Anatomy", "Medicine", "Ethics", "Emergency"], difficultyLevels: ["Expert"], icon: Stethoscope, color: "text-red-500", type: "Role" },
    { id: "role-nurse", title: "Staff Nurse", category: "Healthcare", description: "Patient care.", topics: ["Nursing", "Care Plans", "Empathy", "Triage"], difficultyLevels: ["Intermediate"], icon: HeartPulse, color: "text-pink-500", type: "Role" },
    { id: "role-pharmacist", title: "Pharmacist", category: "Healthcare", description: "Drugs & compounds.", topics: ["Pharmacology", "Drug Interactions", "Laws"], difficultyLevels: ["Intermediate"], icon: Pill, color: "text-green-500", type: "Role" },
    { id: "role-dentist", title: "Dentist", category: "Healthcare", description: "Dental surgery.", topics: ["Dental", "Surgery", "Oral Health"], difficultyLevels: ["Expert"], icon: Smile, color: "text-blue-300", type: "Role" },
    { id: "role-physio", title: "Physiotherapist", category: "Healthcare", description: "Rehabilitation.", topics: ["Anatomy", "Rehab", "Therapy"], difficultyLevels: ["Advanced"], icon: Activity, color: "text-cyan-500", type: "Role" },
    { id: "role-lab-tech", title: "Lab Technician", category: "Healthcare", description: "Pathology lab.", topics: ["Pathology", "Equipment", "Testing"], difficultyLevels: ["Intermediate"], icon: Microscope, color: "text-slate-500", type: "Role" },
    { id: "role-hosp-admin", title: "Hospital Admin", category: "Healthcare", description: "Hospital Ops.", topics: ["Mgmt", "Ops", "Healthcare Law", "Finance"], difficultyLevels: ["Advanced"], icon: Building2, color: "text-indigo-600", type: "Role" },

    // --- Engineering Core (15+) ---
    { id: "role-mech", title: "Mechanical Eng.", category: "Engineering", description: "Machines & Design.", topics: ["Thermo", "CAD", "Production"], difficultyLevels: ["Advanced"], icon: Wrench, color: "text-slate-500", type: "Role" },
    { id: "role-civil", title: "Civil Engineer", category: "Engineering", description: "Structures.", topics: ["Structures", "Survey", "Concrete"], difficultyLevels: ["Advanced"], icon: HardHat, color: "text-yellow-600", type: "Role" },
    { id: "role-electrical", title: "Electrical Eng.", category: "Engineering", description: "Power & Circuits.", topics: ["Circuits", "Power", "Machines"], difficultyLevels: ["Advanced"], icon: Zap, color: "text-orange-500", type: "Role" },
    { id: "role-telecom", title: "Telecom Eng.", category: "Engineering", description: "Networks.", topics: ["Signals", "Networks", "5G/4G"], difficultyLevels: ["Intermediate"], icon: Signal, color: "text-blue-500", type: "Role" },
    { id: "role-chemical", title: "Chemical Eng.", category: "Engineering", description: "Process Industry.", topics: ["Thermodynamics", "Reactions", "Plant"], difficultyLevels: ["Advanced"], icon: FlaskConical, color: "text-green-600", type: "Role" },

    // --- Business & Management (15+) ---
    { id: "role-pm", title: "Product Manager", category: "Business", description: "Product Strategy.", topics: ["Strategy", "Metrics", "UX"], difficultyLevels: ["Expert"], icon: Target, color: "text-blue-600", type: "Role" },
    { id: "role-ba", title: "Business Analyst", category: "Business", description: "Requirements.", topics: ["SQL", "Requirements", "Agile"], difficultyLevels: ["Intermediate"], icon: TrendingUp, color: "text-green-600", type: "Role" },
    { id: "role-hr", title: "HR Manager", category: "Business", description: "People Ops.", topics: ["Recruitment", "Conflict", "Laws"], difficultyLevels: ["Advanced"], icon: Users, color: "text-pink-500", type: "Role" },
    { id: "role-finance", title: "Financial Analyst", category: "Business", description: "Forecasting.", topics: ["Excel", "Modeling", "Valuation"], difficultyLevels: ["Advanced"], icon: DollarSign, color: "text-emerald-600", type: "Role" },
    { id: "role-marketing", title: "Marketing Specialist", category: "Business", description: "Campaigns.", topics: ["SEO", "Content", "Ads"], difficultyLevels: ["Intermediate"], icon: Megaphone, color: "text-orange-500", type: "Role" },
    { id: "role-sales", title: "Sales Executive", category: "Business", description: "Closing deals.", topics: ["Negotiation", "CRM", "Closing"], difficultyLevels: ["Intermediate"], icon: Handshake, color: "text-blue-400", type: "Role" },

    // --- General (5+) ---
    { id: "role-intern", title: "Internship General", category: "General", description: "Entry level aptitude.", topics: ["Basics", "Aptitude", "Behavioral"], difficultyLevels: ["Beginner"], icon: Coffee, color: "text-zinc-500", type: "Role" },
    { id: "role-communication", title: "Soft Skills", category: "General", description: "Communication.", topics: ["Speech", "Confidence", "Body Lang"], difficultyLevels: ["Beginner"], icon: Mic, color: "text-purple-500", type: "Role" },
]

// Dumb Icons import helper for missing ones
import {
    Facebook, Tv, Hexagon, ShoppingCart, Wallet, Smile, Box, Router, Image,
    Home, Send, Linkedin, Pill, Trees, FlaskConical, Megaphone, Handshake,
    Train, Bookmark
} from "lucide-react"
