export interface SubjectNode {
    id: string;
    name: string;
    subCategories: string[];
}

export const PRESET_TAXONOMY: SubjectNode[] = [
    {
        id: 'economics',
        name: 'Economics',
        subCategories: [
            'Microeconomics',
            'Macroeconomics',
            'Price Elasticity & Market Equilibrium',
            'Market Structures & Monopoly',
            'Fiscal & Monetary Policy',
            'International Trade & Exchange Rates',
            'Development Economics & Public Finance'
        ]
    },
    {
        id: 'ai_cs',
        name: 'AI & Computer Science',
        subCategories: [
            'Machine Learning & Deep Learning',
            'Computer Vision & Image Processing',
            'Natural Language Processing (NLP)',
            'Neural Networks & LLMs',
            'Data Structures & Algorithms',
            'Python Programming',
            'AI Ethics, Fairness & Safety'
        ]
    },
    {
        id: 'science',
        name: 'Science',
        subCategories: [
            'Biology - Cell & Genetics',
            'Biology - Human Physiology & Ecology',
            'Physics - Mechanics & Motion',
            'Physics - Electromagnetism & Waves',
            'Physics - Thermodynamics & Modern Physics',
            'Chemistry - Organic Chemistry',
            'Chemistry - Physical & Inorganic Chemistry',
            'Environmental Science'
        ]
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        subCategories: [
            'Algebra & Linear Equations',
            'Calculus (Differentiation & Integration)',
            'Statistics, Regression & Probability',
            'Linear Algebra & Matrix Operations',
            'Geometry & Trigonometry'
        ]
    },
    {
        id: 'business',
        name: 'Business & Management',
        subCategories: [
            'Marketing & Consumer Research',
            'Financial Accounting & Corporate Finance',
            'Operations & Supply Chain Management',
            'Strategic Management & Entrepreneurship'
        ]
    },
    {
        id: 'humanities',
        name: 'Languages & Humanities',
        subCategories: [
            'English Literature & Literary Analysis',
            'Essay Writing & Analytical Composition',
            'World History & International Relations',
            'Physical & Human Geography',
            'Social Sciences & Global Civics'
        ]
    }
];

export function getAllSubjects(customList: string[] = []): string[] {
    const presetNames = PRESET_TAXONOMY.map(t => t.name);
    return Array.from(new Set([...presetNames, ...customList])).filter(Boolean);
}

export function getSubCategoriesForSubject(subjectName: string, customList: string[] = []): string[] {
    const found = PRESET_TAXONOMY.find(t => t.name.toLowerCase() === subjectName.toLowerCase());
    const presets = found ? found.subCategories : [];
    return Array.from(new Set([...presets, ...customList])).filter(Boolean);
}
