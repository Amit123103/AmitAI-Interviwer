import { Request, Response } from 'express';
import Portfolio from '../models/Portfolio';
import axios from 'axios';

// @desc    Get user portfolio
// @route   GET /api/portfolio
// @access  Private
export const getPortfolio = async (req: any, res: Response) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user._id });
        if (!portfolio) {
            // Return empty portfolio structure if none exists
            return res.status(200).json({
                personalDetails: {},
                experience: [],
                education: [],
                projects: [],
                skills: [],
                templateId: 'modern',
                isPublished: false
            });
        }
        res.status(200).json(portfolio);
    } catch (error: any) {
        console.error('Error fetching portfolio:', error.message);
        res.status(500).json({ message: 'Server error fetching portfolio' });
    }
};

// @desc    Save or update user portfolio
// @route   POST /api/portfolio/save
// @access  Private
export const savePortfolio = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;

        let portfolio = await Portfolio.findOne({ userId });

        if (portfolio) {
            portfolio = await Portfolio.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, runValidators: true }
            );
        } else {
            portfolio = new Portfolio({
                userId,
                ...updateData
            });
            await portfolio.save();
        }

        res.status(200).json({ message: 'Portfolio saved successfully', portfolio });
    } catch (error: any) {
        console.error('Error saving portfolio:', error.message);
        res.status(500).json({ message: 'Server error saving portfolio' });
    }
};

// @desc    Get portfolio by public ID or Slug
// @route   GET /api/portfolio/public/:identifier
// @access  Public
export const getPublicPortfolio = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        let query: any = { isPublished: true };

        // If the ID is a valid MongoDB ObjectId, search by userId, otherwise treat it as a slug
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query.$or = [{ userId: id }, { customSlug: id }];
        } else {
            query.customSlug = id;
        }

        const portfolio = await Portfolio.findOne(query)
            .populate('userId', 'username profilePhoto');

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found or not published' });
        }

        res.status(200).json(portfolio);
    } catch (error: any) {
        console.error('Error fetching public portfolio:', error.message);
        res.status(500).json({ message: 'Server error fetching public portfolio' });
    }
};

// @desc    Publish portfolio
// @route   POST /api/portfolio/publish
// @access  Private
export const publishPortfolio = async (req: any, res: Response) => {
    try {
        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.user._id },
            { isPublished: true },
            { new: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.status(200).json({ message: 'Portfolio published successfully', portfolio });
    } catch (error: any) {
        console.error('Error publishing portfolio:', error.message);
        res.status(500).json({ message: 'Server error publishing portfolio' });
    }
};

// @desc    Unpublish portfolio
// @route   POST /api/portfolio/unpublish
// @access  Private
export const unpublishPortfolio = async (req: any, res: Response) => {
    try {
        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.user._id },
            { isPublished: false },
            { new: true }
        );

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.status(200).json({ message: 'Portfolio unpublished successfully', portfolio });
    } catch (error: any) {
        console.error('Error unpublishing portfolio:', error.message);
        res.status(500).json({ message: 'Server error unpublishing portfolio' });
    }
};

// @desc    Mock LinkedIn Import (Since true scraping requires premium API)
// @route   POST /api/portfolio/import/linkedin
// @access  Private
export const importFromLinkedIn = async (req: any, res: Response) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('linkedin.com/in/')) {
            return res.status(400).json({ message: 'Invalid LinkedIn URL' });
        }

        // More detailed mock data response
        const mockLinkedInData = {
            personalDetails: {
                fullName: 'Amit Kumar',
                headline: 'Full Stack Developer | AI Enthusiast',
                about: 'Passionate developer with experience in building modern web applications using React, Node.js, and AI technologies. Focused on creating intuitive user experiences and scalable backend architectures.',
                linkedin: url,
                location: 'Ahmedabad, India',
                email: 'amit.developer@example.com'
            },
            experience: [
                {
                    id: '1',
                    title: 'Senior Software Engineer',
                    company: 'InnoTech Solutions',
                    location: 'Bangalore, India',
                    startDate: 'Jan 2022',
                    endDate: 'Present',
                    description: 'Leading the frontend development team for a major e-commerce platform. Improved performance by 40% through code optimization and lazy loading.'
                },
                {
                    id: '2',
                    title: 'Full Stack Developer',
                    company: 'WebCraft Agency',
                    location: 'Remote',
                    startDate: 'Jun 2019',
                    endDate: 'Dec 2021',
                    description: 'Developed and maintained multiple client projects using the MERN stack. Integrated various third-party APIs and payment gateways.'
                }
            ],
            education: [
                {
                    id: 'e1',
                    degree: 'Bachelor of Technology in Computer Science',
                    institution: 'Gujarat Technological University',
                    location: 'Ahmedabad',
                    startDate: '2015',
                    endDate: '2019',
                    description: 'Focused on algorithms, data structures, and web technologies.'
                }
            ],
            skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Tailwind CSS', 'Framer Motion']
        };

        // Optionally, integrate a real API here (e.g., Proxycurl) if a key is provided in the future
        // const response = await axios.get(`https://nubela.co/proxycurl/api/v2/linkedin?url=${url}`, {
        //     headers: { 'Authorization': `Bearer ${process.env.PROXYCURL_API_KEY}` }
        // });

        // Artificial delay for mock realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.status(200).json({
            message: 'Imported from LinkedIn successfully',
            data: mockLinkedInData
        });

    } catch (error: any) {
        console.error('LinkedIn import error:', error.message);
        res.status(500).json({ message: 'Failed to import LinkedIn data' });
    }
};

// @desc    Check if a custom slug is available
// @route   GET /api/portfolio/check-slug/:slug
// @access  Private
export const checkSlug = async (req: any, res: Response) => {
    try {
        const { slug } = req.params;
        if (!slug || slug.trim() === '') {
            return res.status(400).json({ available: false, message: 'Invalid slug' });
        }

        // Must be alphanumeric with dashes
        if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
            return res.status(400).json({ available: false, message: 'Slug can only contain letters, numbers, and hyphens' });
        }

        const existing = await Portfolio.findOne({ customSlug: slug });

        // If it's the current user's slug, it's available
        if (existing && existing.userId.toString() === req.user._id.toString()) {
            return res.status(200).json({ available: true });
        }

        if (existing) {
            return res.status(200).json({ available: false, message: 'Slug is already taken' });
        }

        res.status(200).json({ available: true });
    } catch (error: any) {
        console.error('Error checking slug:', error.message);
        res.status(500).json({ available: false, message: 'Server error checking slug' });
    }
};

// @desc    Fetch GitHub repositories
// @route   GET /api/portfolio/github/:username
// @access  Private
export const getGithubRepos = async (req: any, res: Response) => {
    try {
        const { username } = req.params;

        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
            headers: {
                // 'Authorization': `token YOUR_GITHUB_TOKEN`, // Optional: add token if rate limited
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        // Map data to our Portfolio Project schema structure
        const repos = response.data
            .filter((repo: any) => !repo.fork)
            .map((repo: any) => ({
                id: repo.id.toString(),
                title: repo.name.replace(/-/g, ' '),
                description: repo.description || 'No description provided.',
                link: repo.html_url,
                technologies: repo.language ? [repo.language] : [],
                stars: repo.stargazers_count
            }))
            .sort((a: any, b: any) => b.stars - a.stars)
            .slice(0, 6); // Top 6 repos

        res.status(200).json(repos);
    } catch (error: any) {
        console.error('GitHub fetch error:', error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'GitHub user not found' });
        }
        res.status(500).json({ message: 'Failed to fetch GitHub repositories' });
    }
};

// @desc    Send a message via the portfolio contact form
// @route   POST /api/portfolio/message/:id
// @access  Public
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // For now, we simulate sending the message.
        // In a real app, we could save this to a `Messages` collection linked to the Portfolio,
        // or send an email to the user (portfolio.personalDetails.email) via nodemailer.

        // const portfolio = await Portfolio.findOne({ $or: [{ userId: id }, { customSlug: id }] });
        // if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
        // sendEmail(portfolio.personalDetails.email, `New Message from ${name}`, ...);

        // Artificial delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error: any) {
        console.error('SendMessage error:', error.message);
        res.status(500).json({ message: 'Failed to send message' });
    }
};
