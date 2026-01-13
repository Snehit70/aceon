
export type Grade = "S" | "A" | "B" | "C" | "D" | "E" | "U";

export const GRADING_SYSTEM: Record<Grade, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 4,
  U: 0,
};

export interface CourseMetadata {
  code: string;
  title: string;
  credits: number;
}

export const IITM_COURSES: CourseMetadata[] = [
  // Foundation
  { code: "BSMA1001", title: "Mathematics for Data Science I", credits: 4 },
  { code: "BSMA1002", title: "Statistics for Data Science I", credits: 4 },
  { code: "BSCS1001", title: "Computational Thinking", credits: 4 },
  { code: "BSHS1001", title: "English I", credits: 4 },
  { code: "BSMA1003", title: "Mathematics for Data Science II", credits: 4 },
  { code: "BSMA1004", title: "Statistics for Data Science II", credits: 4 },
  { code: "BSCS1002", title: "Programming in Python", credits: 4 },
  { code: "BSHS1002", title: "English II", credits: 4 },

  // Diploma
  { code: "BSCS2001", title: "Database Management Systems", credits: 4 },
  { code: "BSCS2002", title: "Programming, Data Structures and Algorithms", credits: 4 },
  { code: "BSCS2003", title: "Modern Application Development I", credits: 4 },
  { code: "BSCS2004", title: "Machine Learning Foundations", credits: 4 },
  { code: "BSCS2005", title: "Programming in JAVA", credits: 4 },
  { code: "BSCS2006", title: "Modern Application Development II", credits: 4 },
  { code: "BSMS2001", title: "Business Data Management", credits: 4 },
  { code: "BSCS2007", title: "Machine Learning Techniques", credits: 4 },
  { code: "BSCS2008", title: "Machine Learning Practice", credits: 4 },
  { code: "BSMS2002", title: "Business Analytics", credits: 4 },
  { code: "BSMS2003", title: "Tools in Data Science", credits: 4 },
  { code: "BSCS2009", title: "System Commands", credits: 4 },

  // Projects
  { code: "BSCP2001", title: "MAD I Project", credits: 2 },
  { code: "BSCP2002", title: "MAD II Project", credits: 2 },
  { code: "BSCP2003", title: "MLP Project", credits: 2 },
  { code: "BSCP2004", title: "Business Analytics Project", credits: 2 },

  // Degree Level
  { code: "BSCS3001", title: "Software Engineering", credits: 4 },
  { code: "BSCS3002", title: "Software Testing", credits: 4 },
  { code: "BSCS3003", title: "AI: Search Methods for Problem Solving", credits: 4 },
  { code: "BSCS3004", title: "Deep Learning", credits: 4 },
  { code: "BSCS3005", title: "Programming in C", credits: 4 },
  { code: "BSMA3001", title: "Linear Algebra", credits: 4 },
  { code: "BSMS3001", title: "Strategies for Professional Growth", credits: 4 },
];
