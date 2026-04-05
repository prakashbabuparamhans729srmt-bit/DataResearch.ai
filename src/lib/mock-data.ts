
export type Student = {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  tags: string[];
  attendancePercentage: number;
  completionPercentage: number;
  averageScorePercentage: number;
  rank: number;
  status: 'Active' | 'Idle';
  lastActivity: string;
  trends: number[];
};

const firstNames = ['Aarav', 'Priya', 'Raj', 'Anjali', 'Vikram', 'Neha', 'Sohan', 'Meera', 'Aditya', 'Ishita', 'Rahul', 'Sneha', 'Arjun', 'Tanvi', 'Karan', 'Pooja', 'Siddharth', 'Riya', 'Manish', 'Kritika'];
const lastNames = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Verma', 'Kumar', 'Iyer', 'Reddy', 'Deshmukh', 'Chopra', 'Malhotra', 'Mehta', 'Jain', 'Shah', 'Aggarwal'];
const tagsPool = ['Science', 'Arts', 'Commerce', 'Mathematics', 'History', 'Physics', 'Literature', 'Economy'];

export const generateMockStudents = (count: number): Student[] => {
  return Array.from({ length: count }).map((_, i) => {
    const gender = Math.random() > 0.52 ? 'Male' : 'Female';
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const tags = Array.from(new Set([
      tagsPool[Math.floor(Math.random() * 3)],
      tagsPool[Math.floor(Math.random() * tagsPool.length)]
    ]));
    
    return {
      id: `std-${1000 + i}`,
      name,
      gender,
      tags,
      attendancePercentage: Math.floor(Math.random() * (100 - 70) + 70),
      completionPercentage: Math.floor(Math.random() * (100 - 60) + 60),
      averageScorePercentage: Math.floor(Math.random() * (100 - 50) + 50),
      rank: 0,
      status: Math.random() > 0.15 ? 'Active' : 'Idle',
      lastActivity: ['Just now', '2 mins ago', '1 hour ago', 'Yesterday'][Math.floor(Math.random() * 4)],
      trends: Array.from({ length: 6 }).map(() => Math.floor(Math.random() * 100))
    };
  }).sort((a, b) => b.averageScorePercentage - a.averageScorePercentage)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));
};
