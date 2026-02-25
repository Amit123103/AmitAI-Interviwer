import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Company from '../models/Company'

dotenv.config()

const baseCompanies = [
    {
        name: "Google",
        slug: "google",
        category: "FAANG",
        logo: "🔍",
        difficulty: "hard",
        overview: "Google is a multinational technology company specializing in Internet-related services and products. Known for rigorous technical interviews and high hiring bar.",
        culture: "Innovation-driven, data-focused, collaborative environment with emphasis on impact and technical excellence.",
        salaryRange: "$150K - $300K+ (L3-L5)",
        timeline: "4-6 weeks",
        successRate: 12,
        hiringProcess: [
            {
                title: "Phone Screen",
                duration: "45 minutes",
                format: "Technical Coding",
                topics: ["Data Structures", "Algorithms", "Problem Solving"],
                difficulty: "medium",
                description: "Initial technical screening with a Google engineer. Expect 1-2 coding problems."
            },
            {
                title: "Technical Phone Interview",
                duration: "45 minutes",
                format: "Coding",
                topics: ["Algorithms", "System Design Basics"],
                difficulty: "medium-hard",
                description: "Deeper technical assessment with focus on code quality and optimization."
            },
            {
                title: "Onsite Round 1-2",
                duration: "45 minutes each",
                format: "Coding",
                topics: ["Data Structures", "Algorithms"],
                difficulty: "hard",
                description: "Advanced coding problems. Must write production-quality code."
            },
            {
                title: "Onsite Round 3",
                duration: "45 minutes",
                format: "System Design",
                topics: ["Scalability", "Architecture", "Trade-offs"],
                difficulty: "hard",
                description: "Design a large-scale system. Focus on scalability and trade-offs."
            },
            {
                title: "Onsite Round 4",
                duration: "45 minutes",
                format: "Googleyness & Leadership",
                topics: ["Behavioral", "Culture Fit"],
                difficulty: "medium",
                description: "Assess alignment with Google's values and leadership potential."
            }
        ],
        commonQuestions: [
            "Implement LRU Cache",
            "Design YouTube",
            "Find median in data stream",
            "Design Google Maps",
            "Tell me about a time you showed leadership"
        ],
        evaluationCriteria: [
            "Problem-solving ability",
            "Code quality and clarity",
            "Communication skills",
            "System design thinking",
            "Googleyness (collaboration, innovation)"
        ],
        tips: [
            "Practice on LeetCode (Medium-Hard)",
            "Study system design fundamentals",
            "Prepare STAR method examples",
            "Ask clarifying questions",
            "Think out loud during coding"
        ],
        commonMistakes: [
            "Not asking clarifying questions",
            "Poor time management",
            "Jumping to code without planning",
            "Not testing code",
            "Weak communication"
        ]
    },
    {
        name: "Amazon",
        slug: "amazon",
        category: "FAANG",
        logo: "📦",
        difficulty: "medium",
        overview: "Amazon is a global e-commerce and cloud computing giant. Interviews focus heavily on leadership principles and behavioral questions.",
        culture: "Customer-obsessed, ownership-driven, high-performance culture with emphasis on delivering results.",
        salaryRange: "$120K - $250K (SDE I-II)",
        timeline: "3-5 weeks",
        successRate: 18,
        hiringProcess: [
            {
                title: "Online Assessment",
                duration: "90 minutes",
                format: "Coding + Behavioral",
                topics: ["Algorithms", "Data Structures", "Leadership Principles"],
                difficulty: "medium",
                description: "2 coding problems + work simulation questions"
            },
            {
                title: "Phone Screen",
                duration: "60 minutes",
                format: "Technical + Behavioral",
                topics: ["Coding", "Leadership Principles"],
                difficulty: "medium",
                description: "1-2 coding problems + behavioral questions based on LP"
            },
            {
                title: "Onsite Loop (4-5 rounds)",
                duration: "45-60 minutes each",
                format: "Mixed",
                topics: ["Coding", "System Design", "Leadership Principles"],
                difficulty: "medium-hard",
                description: "Each round includes coding + LP questions. One dedicated system design round."
            }
        ],
        commonQuestions: [
            "Two Sum variations",
            "Design Amazon's recommendation system",
            "Tell me about a time you disagreed with your manager",
            "Describe a time you failed",
            "How do you prioritize tasks?"
        ],
        evaluationCriteria: [
            "Alignment with Leadership Principles",
            "Technical competency",
            "Problem-solving approach",
            "Customer focus",
            "Ownership and bias for action"
        ],
        tips: [
            "Study all 16 Leadership Principles",
            "Prepare 2-3 STAR stories per principle",
            "Practice medium LeetCode problems",
            "Focus on customer-centric thinking",
            "Show ownership in examples"
        ],
        commonMistakes: [
            "Not knowing Leadership Principles",
            "Weak STAR examples",
            "Not showing customer focus",
            "Lack of ownership in stories"
        ]
    }
]

function generateCompanies() {
    const companyData = [
        // FAANG / Big Tech
        { name: "Microsoft", category: "FAANG", difficulty: "medium" },
        { name: "Apple", category: "FAANG", difficulty: "hard" },
        { name: "Meta", category: "FAANG", difficulty: "hard" },
        { name: "Netflix", category: "FAANG", difficulty: "hard" },
        { name: "Adobe", category: "Product", difficulty: "hard" },
        { name: "Tesla", category: "Product", difficulty: "hard" },
        { name: "IBM", category: "Product", difficulty: "medium" },
        { name: "Oracle", category: "Product", difficulty: "medium" },
        { name: "Intel", category: "Product", difficulty: "hard" },
        { name: "Cisco", category: "Product", difficulty: "medium" },
        { name: "SAP", category: "Product", difficulty: "medium" },
        { name: "Salesforce", category: "Product", difficulty: "medium" },
        { name: "NVIDIA", category: "Product", difficulty: "hard" },
        { name: "Uber", category: "Startups", difficulty: "hard" },
        { name: "Airbnb", category: "Startups", difficulty: "hard" },
        { name: "Spotify", category: "Product", difficulty: "medium" },
        { name: "Samsung", category: "Product", difficulty: "hard" },
        { name: "Sony", category: "Product", difficulty: "medium" },
        { name: "PayPal", category: "Product", difficulty: "medium" },
        { name: "LinkedIn", category: "FAANG", difficulty: "medium" },
        { name: "Twitter", category: "Startups", difficulty: "hard" },
        { name: "Atlassian", category: "Product", difficulty: "hard" },
        { name: "Shopify", category: "Product", difficulty: "hard" },
        { name: "Stripe", category: "Startups", difficulty: "hard" },
        { name: "Dropbox", category: "Product", difficulty: "medium" },
        { name: "Zoom", category: "Product", difficulty: "medium" },

        // Indian IT / Service-Based
        { name: "TCS", category: "Indian IT", difficulty: "easy" },
        { name: "Infosys", category: "Indian IT", difficulty: "easy" },
        { name: "Wipro", category: "Indian IT", difficulty: "easy" },
        { name: "HCL", category: "Indian IT", difficulty: "easy" },
        { name: "Tech Mahindra", category: "Indian IT", difficulty: "easy" },
        { name: "Accenture", category: "Consulting", difficulty: "medium" },
        { name: "Deloitte", category: "Consulting", difficulty: "medium" },
        { name: "Capgemini", category: "Indian IT", difficulty: "medium" },
        { name: "Cognizant", category: "Indian IT", difficulty: "medium" },
        { name: "L&T", category: "Indian IT", difficulty: "medium" },
        { name: "Mindtree", category: "Indian IT", difficulty: "medium" },

        // Product (India & Global)
        { name: "Zoho", category: "Product", difficulty: "medium" },
        { name: "Freshworks", category: "Product", difficulty: "medium" },
        { name: "Flipkart", category: "Startups", difficulty: "hard" },
        { name: "Paytm", category: "Startups", difficulty: "medium" },
        { name: "PhonePe", category: "Startups", difficulty: "hard" },
        { name: "Razorpay", category: "Startups", difficulty: "hard" },
        { name: "Byju's", category: "Startups", difficulty: "medium" },
        { name: "Swiggy", category: "Startups", difficulty: "hard" },
        { name: "Zomato", category: "Startups", difficulty: "hard" },
        { name: "Ola", category: "Startups", difficulty: "medium" },

        // More Companies
        { name: "Snap", category: "Startups", difficulty: "hard" },
        { name: "Pinterest", category: "Product", difficulty: "hard" },
        { name: "Slack", category: "Product", difficulty: "hard" },
        { name: "Twilio", category: "Product", difficulty: "hard" },
        { name: "Square", category: "Product", difficulty: "hard" },
        { name: "GitHub", category: "Product", difficulty: "hard" },
        { name: "GitLab", category: "Product", difficulty: "medium" },
        { name: "Indeed", category: "Product", difficulty: "medium" },
        { name: "Glassdoor", category: "Product", difficulty: "medium" }
    ]

    const generatedCompanies = companyData.map((company, index) => ({
        name: company.name,
        slug: company.name.toLowerCase().replace(/['\s]+/g, '-'),
        category: company.category as any,
        logo: "🏢",
        difficulty: company.difficulty as any,
        overview: `${company.name} is a leading technology company in the ${company.category} space. Known for innovative products and competitive interview process.`,
        culture: "Collaborative, innovative, and fast-paced environment focused on excellence and growth. They value ownership and customer obsession.",
        salaryRange: company.difficulty === "hard" ? "$150K - $280K" : company.difficulty === "medium" ? "$100K - $200K" : "$60K - $120K",
        timeline: company.difficulty === "hard" ? "4-6 weeks" : company.difficulty === "medium" ? "3-4 weeks" : "2-3 weeks",
        successRate: company.difficulty === "hard" ? 5 + (index % 10) : company.difficulty === "medium" ? 15 + (index % 15) : 35 + (index % 20),
        hiringProcess: [
            {
                title: "Online Assessment",
                duration: "90 minutes",
                format: "Coding + Aptitude",
                topics: ["Data Structures", "Algorithms", "Logical Reasoning"],
                difficulty: company.difficulty,
                description: "Initial automated screening with coding problems and technical MCQ."
            },
            {
                title: "Technical Interview 1",
                duration: "60 minutes",
                format: "Coding + Problem Solving",
                topics: ["Algorithms", "Data Structures", "Recursion", "DP"],
                difficulty: company.difficulty,
                description: "Focus on problem-solving approach and code optimization."
            },
            {
                title: "Technical Interview 2",
                duration: "60 minutes",
                format: "System Design / Core CS",
                topics: ["OS", "DBMS", "Networking", "System Design"],
                difficulty: company.difficulty,
                description: "Deep dive into technical fundamentals and architectural thinking."
            },
            {
                title: "Managerial / Culture Fit",
                duration: "45 minutes",
                format: "Behavioral",
                topics: ["STAR Method", "Company Values", "Conflict Resolution"],
                difficulty: "medium",
                description: "Assessment of cultural alignment and behavioral traits using the STAR framework."
            }
        ],
        commonQuestions: [
            "Explain your most challenging project",
            "How do you handle technical debt?",
            "Implement a scalable solution for [domain-specific problem]",
            "Standard DSA problems (Graph, Tree, DP)",
            "Tell me about a time you disagreed with a peer"
        ],
        evaluationCriteria: [
            "Technical Depth and Breadth",
            "Communication and Articulation",
            "Problem-solving speed and accuracy",
            "Culture addition and core values match"
        ],
        tips: [
            "Be very clear about your technical choices",
            "Use the STAR method for behavioral questions",
            "Ask insightful questions about the company's roadmap",
            "Optimize for both time and space complexity",
            "Show enthusiasm for the company's mission"
        ],
        commonMistakes: [
            "Lack of clarity in communication",
            "Not asking clarifying questions",
            "Inability to explain past project details",
            "Neglecting core CS fundamentals",
            "Poor time management during coding"
        ]
    }))

    // Generate more generic companies to reach 100+
    const remainingCount = 100 - (generatedCompanies.length + baseCompanies.length)
    for (let i = 0; i < remainingCount + 5; i++) {
        const categories = ["FAANG", "Indian IT", "Consulting", "Startups", "Product"] as const
        const difficulties = ["easy", "medium", "hard"] as const
        const category = categories[i % categories.length]
        const difficulty = difficulties[i % difficulties.length]

        generatedCompanies.push({
            name: `Global Tech Industry Leader ${i + 1}`,
            slug: `global-tech-industry-leader-${i + 1}`,
            category,
            logo: "💼",
            difficulty,
            overview: `A major player in the global technology landscape, driving digital transformation.`,
            culture: "Energetic, inclusive, and innovation-focused environment.",
            salaryRange: "$90K - $190K",
            timeline: "3-4 weeks",
            successRate: 15 + (i % 25),
            hiringProcess: [
                {
                    title: "Technical Screen",
                    duration: "45 minutes",
                    format: "Technical",
                    topics: ["Coding"],
                    difficulty,
                    description: "Initial technical evaluation"
                }
            ],
            commonQuestions: ["Explain your background", "Technical problem solving"],
            evaluationCriteria: ["Technical aptitude", "Cultural fit"],
            tips: ["Practice role-specific skills", "Company research"],
            commonMistakes: ["Under-preparation"]
        })
    }

    return generatedCompanies
}

async function seedCompanies() {
    try {
        console.log('🔌 Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer')
        console.log('✅ Connected to MongoDB')

        console.log('🗑️  Clearing existing companies...')
        await Company.deleteMany({})
        console.log('✅ Cleared existing companies')

        console.log('📝 Inserting base companies...')
        await Company.insertMany(baseCompanies)
        console.log(`✅ Inserted ${baseCompanies.length} base companies`)

        console.log('🔄 Generating additional companies...')
        const generatedCompanies = generateCompanies()
        console.log(`📝 Inserting ${generatedCompanies.length} generated companies...`)
        await Company.insertMany(generatedCompanies)
        console.log(`✅ Inserted ${generatedCompanies.length} generated companies`)

        const total = await Company.countDocuments()
        console.log(`\n🎉 SUCCESS! Total companies in database: ${total}`)
        console.log(`\n📊 Breakdown:`)
        console.log(`   - FAANG: ${await Company.countDocuments({ category: 'FAANG' })}`)
        console.log(`   - Indian IT: ${await Company.countDocuments({ category: 'Indian IT' })}`)
        console.log(`   - Consulting: ${await Company.countDocuments({ category: 'Consulting' })}`)
        console.log(`   - Startups: ${await Company.countDocuments({ category: 'Startups' })}`)
        console.log(`   - Product: ${await Company.countDocuments({ category: 'Product' })}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding companies:', error)
        process.exit(1)
    }
}

seedCompanies()
