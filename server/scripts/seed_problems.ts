
import mongoose from 'mongoose';
import Problem from '../src/models/Problem';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-platform';

const PROBLEMS: any[] = [
    {
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        category: "Arrays",
        tags: ["Array", "Hash Table"],
        companies: ["Google", "Amazon", "Facebook", "Microsoft"],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`
`,
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
            python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        `
        },
        testCases: [
            { input: `[2,7,11,15], 9`, output: `[0,1]`, isHidden: false },
            { input: `[3,2,4], 6`, output: `[1,2]`, isHidden: true },
            { input: `[3,3], 6`, output: `[0,1]`, isHidden: true }
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."]
    },
    {
        title: "Reverse String",
        slug: "reverse-string",
        difficulty: "Easy",
        category: "Strings",
        tags: ["String", "Two Pointers"],
        companies: ["Amazon", "Adobe"],
        description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with \`O(1)\` extra memory.

### Example 1:
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`
`,
        starterCode: {
            javascript: `/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nvar reverseString = function(s) {\n    \n};`,
            python: `class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        """\n        Do not return anything, modify s in-place instead.\n        """\n        `
        },
        testCases: [
            { input: `["h","e","l","l","o"]`, output: `["o","l","l","e","h"]`, isHidden: false },
            { input: `["H","a","n","n","a","h"]`, output: `["h","a","n","n","a","H"]`, isHidden: true }
        ],
        constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."]
    },
    {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        difficulty: "Easy",
        category: "Stack",
        tags: ["String", "Stack"],
        companies: ["Google", "Facebook", "Amazon"],
        description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
\`\`\`
Input: s = "()"
Output: true
\`\`\`
`,
        starterCode: {
            javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};`,
            python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        `
        },
        testCases: [
            { input: `"()"`, output: `true`, isHidden: false },
            { input: `"()[]{}"`, output: `true`, isHidden: true },
            { input: `"(]"`, output: `false`, isHidden: true }
        ],
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."]
    },
    {
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        companies: ["Google", "Amazon", "Evaluate"],
        description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Example 1:
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`
`,
        starterCode: {
            javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};`,
            python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        `
        },
        testCases: [
            { input: `"abcabcbb"`, output: `3`, isHidden: false },
            { input: `"bbbbb"`, output: `1`, isHidden: true },
            { input: `"pwwkew"`, output: `3`, isHidden: true }
        ],
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."]
    },
    {
        title: "Median of Two Sorted Arrays",
        slug: "median-of-two-sorted-arrays",
        difficulty: "Hard",
        category: "Arrays",
        tags: ["Array", "Binary Search", "Divide and Conquer"],
        companies: ["Amazon", "Google", "Apple"],
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.

### Example 1:
\`\`\`
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
\`\`\`
`,
        starterCode: {
            javascript: `/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};`,
            python: `class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        `
        },
        testCases: [
            { input: `[1,3], [2]`, output: `2.0`, isHidden: false },
            { input: `[1,2], [3,4]`, output: `2.5`, isHidden: true }
        ],
        constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"]
    }
];

// Add more placeholder problems to reach a higher count for UI testing
for (let i = 6; i <= 20; i++) {
    PROBLEMS.push({
        title: `Mock Problem ${i}`,
        slug: `mock-problem-${i}`,
        difficulty: i % 3 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
        category: "Dynamic Programming",
        tags: ["DP", "Math"],
        companies: ["Startup", "Unicorn"],
        description: `This is a placeholder description for Mock Problem ${i}. Valid solution requires dynamic programming.`,
        starterCode: {
            javascript: `var solve = function(n) { return 0; };`
        },
        testCases: [],
        constraints: []
    });
}

const problemsWithStats = PROBLEMS.map(p => ({
    ...p,
    stats: {
        accepted: 0,
        submissions: 0,
        acceptanceRate: 0
    }
}));

const seedProblems = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connnected to DB');

        // Clear existing problems to avoid duplicates during dev
        await Problem.deleteMany({});
        console.log('Cleared existing problems');

        await Problem.insertMany(problemsWithStats);
        console.log(`Seeded ${problemsWithStats.length} problems`);

        await mongoose.disconnect();
        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedProblems();
