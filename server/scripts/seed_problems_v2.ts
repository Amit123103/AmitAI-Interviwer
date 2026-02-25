
import mongoose from 'mongoose';
import Problem from '../src/models/Problem';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interveiw_new';

const topInterviewProblems = [
    // --- EASY ---
    {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        category: "Arrays & Hashing",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        inputFormat: "First line contains an integer `n`. Second line contains `n` integers. Third line contains `target`.",
        outputFormat: "Print the indices of the two numbers.",
        constraints: "2 <= nums.length <= 10^4",
        testCases: [
            { input: "2 7 11 15\n9", expectedOutput: "[0, 1]", isHidden: false },
            { input: "3 2 4\n6", expectedOutput: "[1, 2]", isHidden: false },
            { input: "3 3\n6", expectedOutput: "[0, 1]", isHidden: true }
        ],
        tags: ["Array", "HashTable"],
        companies: ["Google", "Amazon", "Facebook", "Microsoft"],
        starterCode: {
            javascript: "function twoSum(nums, target) {\n    // Write your code here\n}",
            python: "def twoSum(nums, target):\n    # Write your code here"
        }
    },
    {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "Easy",
        category: "Stack",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        inputFormat: "A single string `s`.",
        outputFormat: "Return `true` if valid, otherwise `false`.",
        constraints: "1 <= s.length <= 10^4",
        testCases: [
            { input: "()", expectedOutput: "true", isHidden: false },
            { input: "()[]{}", expectedOutput: "true", isHidden: false },
            { input: "(]", expectedOutput: "false", isHidden: false }
        ],
        tags: ["String", "Stack"],
        companies: ["Google", "Facebook", "Amazon"],
        starterCode: {
            javascript: "function isValid(s) {\n    // Write your code here\n}",
            python: "def isValid(s):\n    # Write your code here"
        }
    },
    {
        title: "Best Time to Buy and Sell Stock",
        slug: "best-time-to-buy-and-sell-stock",
        difficulty: "Easy",
        category: "Arrays",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.",
        inputFormat: "An array of prices.",
        outputFormat: "Maximum profit.",
        constraints: "1 <= prices.length <= 10^5",
        testCases: [
            { input: "7 1 5 3 6 4", expectedOutput: "5", isHidden: false },
            { input: "7 6 4 3 1", expectedOutput: "0", isHidden: false }
        ],
        tags: ["Array", "Dynamic Programming"],
        companies: ["Amazon", "Microsoft", "Uber"],
        starterCode: {
            javascript: "function maxProfit(prices) {\n    // Write your code here\n}",
            python: "def maxProfit(prices):\n    # Write your code here"
        }
    },
    {
        title: "Palindrome Number",
        slug: "palindrome-number",
        difficulty: "Easy",
        category: "Math",
        description: "Given an integer `x`, return `true` if `x` is palindrome integer.",
        inputFormat: "An integer x.",
        outputFormat: "Boolean true/false.",
        constraints: "-2^31 <= x <= 2^31 - 1",
        testCases: [
            { input: "121", expectedOutput: "true", isHidden: false },
            { input: "-121", expectedOutput: "false", isHidden: false }
        ],
        tags: ["Math"],
        companies: ["Google", "Facebook"],
        starterCode: {
            javascript: "function isPalindrome(x) {\n    // Write your code here\n}",
            python: "def isPalindrome(x):\n    # Write your code here"
        }
    },
    {
        title: "Merge Two Sorted Lists",
        slug: "merge-two-sorted-lists",
        difficulty: "Easy",
        category: "Linked List",
        description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list.",
        inputFormat: "Two linked lists.",
        outputFormat: "Merged linked list.",
        constraints: "",
        testCases: [],
        tags: ["Linked List", "Recursion"],
        companies: ["Amazon", "Microsoft"],
        starterCode: {
            javascript: "function mergeTwoLists(list1, list2) {\n    // Write your code here\n}",
            python: "def mergeTwoLists(list1, list2):\n    # Write your code here"
        }
    },

    // --- MEDIUM ---
    {
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        category: "Sliding Window",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        inputFormat: "A string `s`.",
        outputFormat: "An integer representing the length.",
        constraints: "0 <= s.length <= 5 * 10^4",
        testCases: [
            { input: "abcabcbb", expectedOutput: "3", isHidden: false },
            { input: "bbbbb", expectedOutput: "1", isHidden: false },
            { input: "pwwkew", expectedOutput: "3", isHidden: false }
        ],
        tags: ["HashTable", "String", "Sliding Window"],
        companies: ["Google", "Amazon", "Facebook", "Microsoft", "Bloomberg"],
        starterCode: {
            javascript: "function lengthOfLongestSubstring(s) {\n    // Write your code here\n}",
            python: "def lengthOfLongestSubstring(s):\n    # Write your code here"
        }
    },
    {
        title: "3Sum",
        slug: "3sum",
        difficulty: "Medium",
        category: "Two Pointers",
        description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
        inputFormat: "Array of integers.",
        outputFormat: "Array of triplets.",
        constraints: "0 <= nums.length <= 3000",
        testCases: [
            { input: "-1 0 1 2 -1 -4", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false }
        ],
        tags: ["Array", "Two Pointers", "Sorting"],
        companies: ["Facebook", "Google", "Amazon"],
        starterCode: {
            javascript: "function threeSum(nums) {\n    // Write your code here\n}",
            python: "def threeSum(nums):\n    # Write your code here"
        }
    },
    {
        title: "Binary Tree Level Order Traversal",
        slug: "binary-tree-level-order-traversal",
        difficulty: "Medium",
        category: "Tree",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        inputFormat: "Root of binary tree.",
        outputFormat: "Array of arrays.",
        constraints: "",
        testCases: [],
        tags: ["Tree", "BFS"],
        companies: ["Amazon", "Microsoft", "LinkedIn"],
        starterCode: {
            javascript: "function levelOrder(root) {\n    // Write your code here\n}",
            python: "def levelOrder(root):\n    # Write your code here"
        }
    },
    {
        title: "Course Schedule",
        slug: "course-schedule",
        difficulty: "Medium",
        category: "Graph",
        description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`. Return `true` if you can finish all courses.",
        inputFormat: "Integer numCourses, Array of prerequisites.",
        outputFormat: "Boolean.",
        constraints: "",
        testCases: [
            { input: "2\n[[1,0]]", expectedOutput: "true", isHidden: false },
            { input: "2\n[[1,0],[0,1]]", expectedOutput: "false", isHidden: false }
        ],
        tags: ["Graph", "DFS", "BFS", "Topological Sort"],
        companies: ["Amazon", "Google", "Uber"],
        starterCode: {
            javascript: "function canFinish(numCourses, prerequisites) {\n    // Write your code here\n}",
            python: "def canFinish(numCourses, prerequisites):\n    # Write your code here"
        }
    },
    {
        title: "Coin Change",
        slug: "coin-change",
        difficulty: "Medium",
        category: "Dynamic Programming",
        description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
        inputFormat: "Array coins, Integer amount.",
        outputFormat: "Integer minimum coins.",
        constraints: "1 <= coins.length <= 12",
        testCases: [
            { input: "[1,2,5]\n11", expectedOutput: "3", isHidden: false },
            { input: "[2]\n3", expectedOutput: "-1", isHidden: false }
        ],
        tags: ["Array", "Dynamic Programming", "BFS"],
        companies: ["Amazon", "Google", "Microsoft"],
        starterCode: {
            javascript: "function coinChange(coins, amount) {\n    // Write your code here\n}",
            python: "def coinChange(coins, amount):\n    # Write your code here"
        }
    },

    // --- HARD ---
    {
        title: "Median of Two Sorted Arrays",
        slug: "median-of-two-sorted-arrays",
        difficulty: "Hard",
        category: "Binary Search",
        description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be `O(log (m+n))`.",
        inputFormat: "Two arrays.",
        outputFormat: "Float median.",
        constraints: "",
        testCases: [
            { input: "[1,3]\n[2]", expectedOutput: "2.00000", isHidden: false }
        ],
        tags: ["Array", "Binary Search", "Divide and Conquer"],
        companies: ["Google", "Amazon", "Microsoft", "Apple"],
        starterCode: {
            javascript: "function findMedianSortedArrays(nums1, nums2) {\n    // Write your code here\n}",
            python: "def findMedianSortedArrays(nums1, nums2):\n    # Write your code here"
        }
    },
    {
        title: "Merge k Sorted Lists",
        slug: "merge-k-sorted-lists",
        difficulty: "Hard",
        category: "Heap",
        description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        inputFormat: "Array of linked lists.",
        outputFormat: "Merged linked list.",
        constraints: "",
        testCases: [],
        tags: ["Linked List", "Divide and Conquer", "Heap"],
        companies: ["Facebook", "Amazon", "Google", "Microsoft"],
        starterCode: {
            javascript: "function mergeKLists(lists) {\n    // Write your code here\n}",
            python: "def mergeKLists(lists):\n    # Write your code here"
        }
    },
    {
        title: "Trapping Rain Water",
        slug: "trapping-rain-water",
        difficulty: "Hard",
        category: "Two Pointers",
        description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        inputFormat: "Array of heights.",
        outputFormat: "Integer water units.",
        constraints: "",
        testCases: [
            { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false }
        ],
        tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
        companies: ["Amazon", "Google", "Facebook"],
        starterCode: {
            javascript: "function trap(height) {\n    // Write your code here\n}",
            python: "def trap(height):\n    # Write your code here"
        }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB');

        console.log('Replacing existing similar problems...');

        for (const prob of topInterviewProblems) {
            await Problem.findOneAndUpdate(
                { slug: prob.slug },
                { ...prob, stats: { accepted: 0, submissions: 0 } }, // Reset stats for clean state or keep? Let's reset for now or upsert
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Seeded ${topInterviewProblems.length} Top Interview Problems!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
