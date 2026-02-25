import { Building2, Code2, Brain, Users, Terminal, Sparkles, Server, Laptop, Rocket, Globe } from "lucide-react";

export interface RoundConfig {
    id: string;
    name: string;
    type: "coding" | "system-design" | "behavioral" | "aptitude" | "technical";
    description: string;
    duration: number; // in minutes
    competencies: string[]; // e.g., "Data Structures", "Communication"
}

export interface CompanyConfig {
    id: string;
    name: string;
    description: string;
    logo: any; // Lucide icon or specific asset
    color: string;
    rounds: RoundConfig[];
}

export const COMPANIES: CompanyConfig[] = [
    {
        id: "google",
        name: "Google",
        description: "Focuses on scalable algorithms, system design, and 'Googleyness' (cultural fit).",
        logo: Globe,
        color: "text-blue-500",
        rounds: [
            {
                id: "google-r1",
                name: "Technical Screen (Coding)",
                type: "coding",
                description: "Focus on Data Structures & Algorithms. Efficiency and edge cases matter.",
                duration: 45,
                competencies: ["Problem Solving", "Code Quality", "Optimization"]
            },
            {
                id: "google-r2",
                name: "Advanced Coding & Logic",
                type: "coding",
                description: "Complex problem solving involving Graphs, DP, or Recursion.",
                duration: 45,
                competencies: ["Algorithms", "Logic", "Debugging"]
            },
            {
                id: "google-r3",
                name: "System Design",
                type: "system-design",
                description: "Design a scalable system (e.g., Google Maps, Search) handling massive traffic.",
                duration: 60,
                competencies: ["Scalability", "Architecture", "Trade-offs"]
            },
            {
                id: "google-r4",
                name: "Behavioral (Googleyness)",
                type: "behavioral",
                description: "Assess navigation of ambiguity, feedback, and collaboration.",
                duration: 45,
                competencies: ["Leadership", "Collaboration", "Ambiguity"]
            }
        ]
    },
    {
        id: "amazon",
        name: "Amazon",
        description: "Heavily grounded in 16 Leadership Principles. Expect 'Bar Raiser' rounds.",
        logo: Building2,
        color: "text-orange-500",
        rounds: [
            {
                id: "amazon-r1",
                name: "Online Assessment (Coding)",
                type: "coding",
                description: "Two coding questions focusing on efficiency and logical correctness.",
                duration: 90,
                competencies: ["Coding", "Verification"]
            },
            {
                id: "amazon-r2",
                name: "System Design (Scalability)",
                type: "system-design",
                description: "Design highly available and reliable systems.",
                duration: 60,
                competencies: ["Availability", "Reliability", "Operational Excellence"]
            },
            {
                id: "amazon-r3",
                name: "Behavioral (Leadership Principles)",
                type: "behavioral",
                description: "Deep dive into your past experiences using the STAR method.",
                duration: 60,
                competencies: ["Customer Obsession", "Ownership", "Bias for Action"]
            },
            {
                id: "amazon-r4",
                name: "Bar Raiser",
                type: "technical",
                description: "A rigorous round to determine if you raise the average hiring bar.",
                duration: 60,
                competencies: ["holistic_view", "long_term_thinking"]
            }
        ]
    },
    {
        id: "microsoft",
        name: "Microsoft",
        description: "Balanced focus on coding, design, and collaborative culture ('Growth Mindset').",
        logo: Laptop,
        color: "text-blue-600",
        rounds: [
            {
                id: "ms-r1",
                name: "Problem Solving",
                type: "coding",
                description: "Standard algorithmic problem solving.",
                duration: 45,
                competencies: ["Algorithms", "Testing"]
            },
            {
                id: "ms-r2",
                name: "System Design",
                type: "system-design",
                description: "Architectural discussion for specific features or services.",
                duration: 45,
                competencies: ["Design Patterns", "Integration"]
            },
            {
                id: "ms-r3",
                name: "Behavioral (Growth Mindset)",
                type: "behavioral",
                description: "Scenarios focusing on learning from failure and teamwork.",
                duration: 45,
                competencies: ["Growth Mindset", "Collaboration"]
            }
        ]
    },
    {
        id: "product",
        name: "Product Companies (Meta, Netflix, etc.)",
        description: "High bar for engineering excellence, product sense, and culture.",
        logo: Rocket,
        color: "text-purple-500",
        rounds: [
            {
                id: "prod-r1",
                name: "Product Architecture",
                type: "system-design",
                description: "Designing features with a focus on user experience and scale.",
                duration: 60,
                competencies: ["Product Sense", "Engineering"]
            },
            {
                id: "prod-r2",
                name: "Coding (Optimization)",
                type: "coding",
                description: "Solving hard problems with optimal space/time complexity.",
                duration: 45,
                competencies: ["Optimization", "Speed"]
            },
            {
                id: "prod-r3",
                name: "Culture Fit",
                type: "behavioral",
                description: "Alignment with core company values.",
                duration: 45,
                competencies: ["Values", "Impact"]
            }
        ]
    },
    {
        id: "service",
        name: "Service Companies (TCS, Infosys, etc.)",
        description: "Focus on aptitude, fundamentals, and communication skills.",
        logo: Users,
        color: "text-indigo-500",
        rounds: [
            {
                id: "svc-r1",
                name: "Aptitude & Logic",
                type: "aptitude",
                description: "Quantitative, Logical, and Verbal ability tests.",
                duration: 60,
                competencies: ["Aptitude", "Logic"]
            },
            {
                id: "svc-r2",
                name: "Technical Interview",
                type: "technical",
                description: "Basics of OOP, DBMS, OS, and one programming language.",
                duration: 30,
                competencies: ["Fundamentals", "Concepts"]
            },
            {
                id: "svc-r3",
                name: "HR Round",
                type: "behavioral",
                description: "Communication, willingness to relocate, and background check.",
                duration: 20,
                competencies: ["Communication", "Flexibility"]
            }
        ]
    },
    {
        id: "startup",
        name: "Startups",
        description: "Fast-paced, testing adaptability, ownership, and full-stack skills.",
        logo: Sparkles,
        color: "text-green-500",
        rounds: [
            {
                id: "startup-r1",
                name: "Machine Coding / Practical",
                type: "coding",
                description: "Build a small feature or app in 60-90 mins.",
                duration: 90,
                competencies: ["Practical Skills", "Speed", "Delivery"]
            },
            {
                id: "startup-r2",
                name: "Founder/CTO Discussion",
                type: "behavioral",
                description: "Discussion on vision, passion, and rapid decision making.",
                duration: 45,
                competencies: ["Passion", "Vision", "Adaptability"]
            }
        ]
    }
];


