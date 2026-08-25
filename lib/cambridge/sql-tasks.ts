// The queries a student is asked to write, and the model answer for each.
//
// Kept out of the component so scripts/check-sql.mts can run every solution
// against the real engine. A model answer with a typo in it would otherwise
// be invisible until a student pressed Run and was told they were wrong.

export interface SqlTask {
  ask: string;
  /** One correct answer. Marking compares results, so others count too. */
  solution: string;
}

/** In syllabus order: filter, then sort, then group, then join. */
export const SQL_TASKS: SqlTask[] = [
  {
    ask: "List the FirstName and LastName of every student in Ariun house.",
    solution:
      "SELECT FirstName, LastName FROM Student WHERE House = 'Ariun'",
  },
  {
    ask: "List all details of the students in class 9A.",
    solution: "SELECT * FROM Student WHERE ClassID = '9A'",
  },
  {
    ask: "List the FirstName and LastName of every student, in alphabetical order of LastName.",
    solution: "SELECT FirstName, LastName FROM Student ORDER BY LastName",
  },
  {
    ask: "From the Grade table, list the StudentID and Mark of every Computer Science mark above 80, highest mark first.",
    solution:
      "SELECT StudentID, Mark FROM Grade WHERE Subject = 'Computer Science' AND Mark > 80 ORDER BY Mark DESC",
  },
  {
    ask: "How many marks are recorded for each subject? Show the Subject and the count, with the count called Entries.",
    solution: "SELECT Subject, COUNT(*) AS Entries FROM Grade GROUP BY Subject",
  },
  {
    ask: "Show the Subject and the highest mark awarded in it, with that mark called BestMark.",
    solution: "SELECT Subject, MAX(Mark) AS BestMark FROM Grade GROUP BY Subject",
  },
  {
    ask: "List each student's FirstName together with the Teacher of their class.",
    solution:
      "SELECT Student.FirstName, Class.Teacher FROM Student INNER JOIN Class ON Student.ClassID = Class.ClassID",
  },
];
