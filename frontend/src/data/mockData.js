/**
 * SkillSync Prototype Mock Data
 * Centralized data store representing users, skill partners, and exchange requests.
 * 
 * Note: Authentication, database persistence, and AI matching algorithms
 * are placeholder/mock structures for this prototype phase.
 */

// CURRENT USER PROTOTYPE
export const initialCurrentUser = {
  id: 'user-001',
  name: 'Jane Doe',
  email: 'jane.doe@university.edu',
  role: 'Computer Science Student',
  bio: 'Passionate about building scalable web apps and eager to learn UI/UX design from an expert.',
  skillsOffered: ['React & React Router', 'Node.js Backend', 'Data Structures'],
  skillsWanted: ['Figma Prototyping', 'Graphic Design'],
  proficiency: {
    'React & React Router': 'Advanced',
    'Node.js Backend': 'Intermediate',
    'Data Structures': 'Advanced',
    'Figma Prototyping': 'Beginner',
    'Graphic Design': 'Beginner'
  },
  availability: 'Weekends, Tue/Thu Evenings',
  verification: true,
  trustScore: 4.9
};

// SKILL PARTNERS PROTOTYPE
export const initialSkillPartners = [
  {
    id: 1,
    name: 'Emily Watson',
    role: 'UX Designer',
    category: 'Design',
    bio: 'UX designer passionate about wireframing, design systems, and user research. Looking to learn React basics.',
    skillsOffered: ['Figma', 'UI Prototyping'],
    skillsWanted: ['React Basics'],
    proficiency: {
      'Figma': 'Advanced',
      'UI Prototyping': 'Advanced',
      'React Basics': 'Beginner'
    },
    availability: 'Mon/Wed/Fri afternoons',
    verification: true,
    trustScore: 4.8,
    matchScore: 92
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Graphic Arts Student',
    category: 'Arts & Music',
    bio: 'Visual artist and illustrator eager to build modern interactive portfolios and web experiences.',
    skillsOffered: ['Adobe Illustrator', 'Typography'],
    skillsWanted: ['Web Development'],
    proficiency: {
      'Adobe Illustrator': 'Advanced',
      'Typography': 'Advanced',
      'Web Development': 'Beginner'
    },
    availability: 'Weekends & Tue evenings',
    verification: true,
    trustScore: 4.5,
    matchScore: 85
  },
  {
    id: 3,
    name: 'Sarah Lee',
    role: 'Product Manager',
    category: 'Business',
    bio: 'Product manager aiming to sharpen technical foundational knowledge in data structures and system logic.',
    skillsOffered: ['Product Strategy', 'Agile'],
    skillsWanted: ['Data Structures'],
    proficiency: {
      'Product Strategy': 'Advanced',
      'Agile': 'Advanced',
      'Data Structures': 'Beginner'
    },
    availability: 'Thu & Sat mornings',
    verification: false,
    trustScore: 4.9,
    matchScore: 78
  },
  {
    id: 4,
    name: 'Alice Chen',
    role: 'Design Student',
    category: 'Design',
    bio: 'Digital design enthusiast seeking frontend development skills to bring app concepts alive.',
    skillsOffered: ['Figma', 'UI Design'],
    skillsWanted: ['React', 'Frontend'],
    proficiency: {
      'Figma': 'Advanced',
      'UI Design': 'Advanced',
      'React': 'Beginner',
      'Frontend': 'Beginner'
    },
    availability: 'Weekdays after 5 PM',
    verification: true,
    trustScore: 4.7,
    matchScore: 88
  },
  {
    id: 5,
    name: 'Bob Smith',
    role: 'Software Engineer',
    category: 'Programming',
    bio: 'Backend & data engineer looking for conversational Spanish exchange for engineering mentoring.',
    skillsOffered: ['Python', 'Data Science'],
    skillsWanted: ['Spanish Language'],
    proficiency: {
      'Python': 'Advanced',
      'Data Science': 'Advanced',
      'Spanish Language': 'Beginner'
    },
    availability: 'Weekends',
    verification: true,
    trustScore: 4.6,
    matchScore: 72
  },
  {
    id: 6,
    name: 'Charlie Davis',
    role: 'Musician',
    category: 'Arts & Music',
    bio: 'Acoustic guitarist and audio composer looking to learn video editing for YouTube tutorials.',
    skillsOffered: ['Guitar', 'Music Theory'],
    skillsWanted: ['Video Editing'],
    proficiency: {
      'Guitar': 'Advanced',
      'Music Theory': 'Advanced',
      'Video Editing': 'Beginner'
    },
    availability: 'Sunday afternoons',
    verification: false,
    trustScore: 4.4,
    matchScore: 65
  },
  {
    id: 7,
    name: 'Diana Prince',
    role: 'Marketing Lead',
    category: 'Business',
    bio: 'Performance marketing manager looking to learn hands-on data analytics and dashboard modeling.',
    skillsOffered: ['Digital Marketing', 'SEO'],
    skillsWanted: ['Data Analytics'],
    proficiency: {
      'Digital Marketing': 'Advanced',
      'SEO': 'Advanced',
      'Data Analytics': 'Beginner'
    },
    availability: 'Flexible evenings',
    verification: true,
    trustScore: 4.9,
    matchScore: 80
  }
];

// EXCHANGE REQUEST PROTOTYPE
export const initialExchangeRequests = [
  {
    id: 'req-001',
    senderId: 'user-001',
    receiverId: 1,
    offeredSkill: 'React Basics',
    requestedSkill: 'Figma, UI Prototyping',
    matchScore: 92,
    status: 'pending',
    message: "Hi Emily! I saw that you're offering Figma lessons and seeking React basics. I'm a CS student with advanced React skills and would love to do a skill exchange with you."
  }
];
