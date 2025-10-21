// Mock data for the HackTrack application
// Import real current opportunities with actual registration links
import { allRealOpportunities, realHackathons2025, realInternships2025, realEvents2025 } from './currentOpportunities2025';
import realWorldOpportunities from './realWorldOpportunities';

export const featuredEvents = [
  {
    id: '1',
    title: 'Mumbai FinTech Hackathon 2025',
    description: 'Build innovative financial solutions for India\'s digital economy. Focus on UPI, digital banking, and fintech innovations.',
    type: 'hackathon',
    organizer: 'NASSCOM Mumbai',
    location: 'Bandra Kurla Complex, Mumbai',
    startDate: '2025-10-15',
    endDate: '2025-10-17',
    deadline: '2025-10-01',
    prize: '₹5,00,000',
    difficulty: 'Advanced',
    technologies: ['React Native', 'Node.js', 'Blockchain', 'AI/ML'],
    image: '/images/mumbai-fintech.jpg',
    url: 'https://mumbaifintech.com',
    featured: true,
    participants: 500,
    registrationFee: 0,
    venue: 'Trident BKC'
  },
  {
    id: '2',
    title: 'Tata Consultancy Services Internship',
    description: 'Software Engineering Internship at TCS Mumbai. Work on enterprise solutions and digital transformation projects.',
    type: 'internship',
    company: 'Tata Consultancy Services',
    location: 'Andheri East, Mumbai',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    deadline: '2025-03-15',
    salary: '₹25,000/month',
    difficulty: 'Intermediate',
    technologies: ['Java', 'Spring Boot', 'Angular', 'AWS'],
    image: '/images/tcs-intern.jpg',
    url: 'https://careers.tcs.com',
    duration: '12 weeks',
    benefits: ['Mentorship', 'Certificate', 'PPO opportunity']
  },
  {
    id: '3',
    title: 'TechFest IIT Bombay 2025',
    description: 'Asia\'s largest science and technology festival featuring competitions, workshops, and tech exhibitions in Mumbai.',
    type: 'event',
    organizer: 'IIT Bombay',
    location: 'IIT Bombay Campus, Powai',
    startDate: '2025-01-20',
    endDate: '2025-01-23',
    deadline: '2025-01-15',
    registrationFee: '₹500',
    difficulty: 'Beginner',
    technologies: ['AI/ML', 'Robotics', 'IoT', 'Blockchain'],
    image: '/images/techfest-iitb.jpg',
    url: 'https://techfest.org',
    expectedAttendees: 150000
  },
  {
    id: '4',
    title: 'Flipkart Grid Challenge 2025',
    description: 'E-commerce innovation challenge by Flipkart. Solve real-world problems in Indian e-commerce ecosystem.',
    type: 'hackathon',
    organizer: 'Flipkart',
    location: 'Flipkart Office, Bengaluru',
    startDate: '2025-09-14',
    endDate: '2025-09-15',
    deadline: '2025-09-10',
    prize: '₹10,00,000',
    difficulty: 'Advanced',
    technologies: ['Python', 'React', 'Machine Learning', 'Data Analytics'],
    image: '/images/flipkart-grid.jpg',
    url: 'https://flipkart.com/grid',
    participants: 25000
  },
  {
    id: '5',
    title: 'Reliance Jio Software Engineer Intern',
    description: 'Telecom technology internship at Jio. Work on 5G, IoT, and digital services for 400M+ users.',
    type: 'internship',
    company: 'Reliance Jio',
    location: 'Navi Mumbai',
    startDate: '2025-06-10',
    endDate: '2025-09-06',
    deadline: '2025-02-28',
    salary: '₹30,000/month',
    difficulty: 'Intermediate',
    technologies: ['5G', 'IoT', 'Cloud Computing', 'Mobile Apps'],
    image: '/images/jio-intern.jpg',
    url: 'https://jio.com/careers',
    duration: '12 weeks',
    benefits: ['Industry exposure', 'Certificate', 'Full-time offer']
  },
  {
    id: '6',
    title: 'Smart India Hackathon 2025',
    description: 'Government of India\'s flagship hackathon to solve real-world problems using technology and innovation.',
    type: 'hackathon',
    organizer: 'Government of India',
    location: 'Multiple Cities (Mumbai nodal)',
    startDate: '2025-02-16',
    endDate: '2025-02-18',
    deadline: '2025-02-01',
    prize: '₹1,00,000',
    difficulty: 'Intermediate',
    technologies: ['React', 'Python', 'AI/ML', 'Mobile Development'],
    image: '/images/sih-2025.jpg',
    url: 'https://sih.gov.in',
    participants: 10000,
    featured: true
  }
];

export const hackathons = [
  ...featuredEvents.filter(event => event.type === 'hackathon'),
  {
    id: '7',
    title: 'Mumbai Smart City Hackathon',
    description: 'Develop solutions for Mumbai\'s urban challenges: traffic management, waste disposal, and citizen services.',
    type: 'hackathon',
    organizer: 'BMC & TiE Mumbai',
    location: 'World Trade Center, Cuffe Parade',
    startDate: '2025-09-21',
    endDate: '2025-09-22',
    deadline: '2025-09-15',
    prize: '₹2,50,000',
    difficulty: 'Intermediate',
    technologies: ['IoT', 'Data Analytics', 'Mobile Apps', 'Cloud'],
    image: '/images/mumbai-smart-city.jpg',
    url: 'https://mumbaiSmartcity.org',
    participants: 300
  },
  {
    id: '8',
    title: 'Paytm Innovation Challenge',
    description: 'Build digital payment solutions for India\'s growing fintech ecosystem and financial inclusion.',
    type: 'hackathon',
    organizer: 'Paytm',
    location: 'Noida (Open for Mumbai teams)',
    startDate: '2025-10-18',
    endDate: '2025-10-20',
    deadline: '2025-10-10',
    prize: '₹3,00,000',
    difficulty: 'Beginner',
    technologies: ['UPI', 'Mobile Development', 'API Integration', 'Security'],
    image: '/images/paytm-challenge.jpg',
    url: 'https://paytm.com/hackathon',
    participants: 1000
  }
];

export const internships = [
  ...featuredEvents.filter(event => event.type === 'internship'),
  {
    id: '9',
    title: 'Infosys Software Engineer Intern',
    description: 'Join Infosys Mysore campus for comprehensive training and real project experience in enterprise software.',
    type: 'internship',
    company: 'Infosys',
    location: 'Mumbai/Pune (with Mysore training)',
    startDate: '2025-06-24',
    endDate: '2025-09-13',
    deadline: '2025-03-01',
    salary: '₹23,000/month',
    difficulty: 'Beginner',
    technologies: ['Java', 'Spring', 'Angular', 'Database'],
    image: '/images/infosys-intern.jpg',
    url: 'https://infosys.com/careers/students',
    duration: '12 weeks',
    benefits: ['Training certification', 'Networking', 'Job offer potential']
  },
  {
    id: '10',
    title: 'Zomato Product Development Intern',
    description: 'Work on India\'s leading food delivery platform. Build features used by millions of Indian users daily.',
    type: 'internship',
    company: 'Zomato',
    location: 'Gurugram (Mumbai applications welcome)',
    startDate: '2025-06-03',
    endDate: '2025-08-23',
    deadline: '2025-02-15',
    salary: '₹40,000/month',
    difficulty: 'Advanced',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Microservices'],
    image: '/images/zomato-intern.jpg',
    url: 'https://zomato.com/careers',
    duration: '12 weeks',
    benefits: ['Free food', 'Stock options', 'Flexible work']
  }
];

export const events = [
  ...featuredEvents.filter(event => event.type === 'event'),
  {
    id: '11',
    title: 'VJTI Mumbai Tech Summit 2025',
    description: 'Premier technical festival of VJTI Mumbai featuring workshops, competitions, and industry talks.',
    type: 'event',
    organizer: 'VJTI Mumbai',
    location: 'Veermata Jijabai Technological Institute, Matunga',
    startDate: '2025-09-26',
    endDate: '2025-09-29',
    deadline: '2025-09-01',
    registrationFee: '₹200',
    difficulty: 'Beginner',
    technologies: ['Web Development', 'Mobile Apps', 'AI/ML', 'Robotics'],
    image: '/images/vjti-summit.jpg',
    url: 'https://vjti.ac.in/techsummit',
    expectedAttendees: 5000
  },
  {
    id: '12',
    title: 'Mumbai Startup Conclave 2025',
    description: 'Connect with Mumbai\'s startup ecosystem. Networking event featuring investors, founders, and tech leaders.',
    type: 'event',
    organizer: 'Mumbai Angels & TiE Mumbai',
    location: 'Taj Lands End, Bandra West',
    startDate: '2025-11-06',
    endDate: '2025-11-07',
    deadline: '2025-10-15',
    registrationFee: '₹1,500',
    difficulty: 'Advanced',
    technologies: ['Startup Ecosystem', 'Funding', 'Business Development', 'Innovation'],
    image: '/images/mumbai-startup.jpg',
    url: 'https://mumbaistartups.com',
    expectedAttendees: 800
  }
];

// Combine mock data with real current opportunities
export const allEvents = [
  ...allRealOpportunities, // REAL opportunities with actual registration links (Oct 14 - Dec 2025)
  ...hackathons,
  ...internships,
  ...events
];

// Categories for filtering
export const categories = {
  hackathon: 'Hackathons',
  internship: 'Internships', 
  event: 'Events'
};

export const difficulties = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

export const locations = [
  // Maharashtra
  'Mumbai',
  'Pune',
  'Nashik',
  'Nagpur',
  'Aurangabad',
  
  // Karnataka
  'Bengaluru',
  'Mysore',
  'Hubli',
  'Mangalore',
  
  // Delhi NCR
  'Delhi NCR',
  'New Delhi',
  'Gurgaon',
  'Noida',
  'Faridabad',
  
  // Tamil Nadu
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  
  // Telangana & Andhra Pradesh
  'Hyderabad',
  'Secunderabad',
  'Vijayawada',
  'Visakhapatnam',
  
  // West Bengal
  'Kolkata',
  'Durgapur',
  'Siliguri',
  
  // Gujarat
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  
  // Rajasthan
  'Jaipur',
  'Jodhpur',
  'Udaipur',
  'Kota',
  
  // Punjab
  'Chandigarh',
  'Ludhiana',
  'Amritsar',
  
  // Kerala
  'Kochi',
  'Thiruvananthapuram',
  'Kozhikode',
  
  // Uttar Pradesh
  'Lucknow',
  'Kanpur',
  'Agra',
  'Varanasi',
  
  // Madhya Pradesh
  'Bhopal',
  'Indore',
  'Gwalior',
  
  // Bihar & Jharkhand
  'Patna',
  'Ranchi',
  'Dhanbad',
  
  // Odisha
  'Bhubaneswar',
  'Cuttack',
  
  // Assam
  'Guwahati',
  'Dibrugarh',
  
  // Online & Special
  'Online',
  'Pan India',
  'Multiple Cities'
];

export const states = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Kerala',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Bihar',
  'Jharkhand',
  'Odisha',
  'Assam',
  'Goa',
  'Himachal Pradesh',
  'Uttarakhand',
  'Jammu & Kashmir'
];

export const technologies = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'React',
  'Node.js',
  'Machine Learning',
  'AI',
  'Data Science',
  'Mobile Development',
  'Web Development',
  'Blockchain',
  'Cloud Computing',
  'Cybersecurity'
];

// User statistics for dashboard
export const userStats = {
  eventsApplied: 8,
  eventsSaved: 15,
  applicationsPending: 3,
  applicationsAccepted: 2,
  applicationsRejected: 3,
  profileViews: 89,
  connectionsMade: 12
};

// Mumbai Tech Ecosystem Data
export const mumbaiColleges = [
  'IIT Bombay',
  'VJTI Mumbai', 
  'ICT Mumbai',
  'SPIT Mumbai',
  'K.J. Somaiya College',
  'Mumbai University',
  'Thadomal Shahani Engineering College',
  'Fr. Conceicao Rodrigues College',
  'Sardar Patel Institute of Technology',
  'Dwarkadas J. Sanghvi College'
];

export const mumbaiCompanies = [
  'Tata Consultancy Services',
  'Reliance Jio',
  'Bajaj Finserv',
  'Mahindra Group',
  'L&T Infotech',
  'Godrej',
  'Asian Paints',
  'HDFC Bank',
  'Axis Bank',
  'Wipro',
  'Capgemini Mumbai',
  'Accenture Mumbai',
  'IBM India',
  'Morgan Stanley Mumbai',
  'JP Morgan Mumbai'
];

export const mumbaiStartups = [
  'UrbanClap (Urban Company)',
  'Housing.com',
  'Trell',
  'Jio Haptik',
  'BookMyShow',
  'MindTickle',
  'Droom',
  'ClearTax',
  'Kotak Mahindra Bank',
  'Pine Labs'
];

// Enhanced opportunities combining mock data with real-world data
export const getAllOpportunities = () => {
  const allOpportunities = [
    ...allRealOpportunities,
    ...realWorldOpportunities.internships,
    ...realWorldOpportunities.hackathons,
    ...realWorldOpportunities.events,
    ...realWorldOpportunities.fintech
  ];
  
  return allOpportunities;
};

export const getOpportunitiesByType = (type) => {
  const allOpps = getAllOpportunities();
  return allOpps.filter(opp => opp.type === type);
};

export const getFintechOpportunities = () => {
  const allOpps = getAllOpportunities();
  const fintechKeywords = ['fintech', 'payment', 'bank', 'financial', 'razorpay', 'paytm', 'phonepe', 'cred', 'zerodha'];
  
  return allOpps.filter(opp => 
    fintechKeywords.some(keyword => 
      opp.company?.toLowerCase().includes(keyword) ||
      opp.title?.toLowerCase().includes(keyword) ||
      opp.description?.toLowerCase().includes(keyword) ||
      opp.category?.toLowerCase().includes(keyword)
    )
  );
};