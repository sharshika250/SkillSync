import Assessment from '../models/Assessment.js';

export const seedAssessmentQuestions = async () => {
  try {
    const count = await Assessment.countDocuments();
    if (count > 0) {
      return; // Already seeded
    }

    const defaultAssessments = [
      // 1. PYTHON MCQS
      {
        skill: 'Python',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'Which of the following data types is mutable in Python?',
        options: ['tuple', 'string', 'list', 'int'],
        correctOptionIndex: 2,
        explanation: 'In Python, lists are mutable, meaning their contents can be changed in place without creating a new object.'
      },
      {
        skill: 'Python',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'How do you define a function in Python?',
        options: ['function myFunc()', 'def myFunc():', 'create myFunc():', 'func myFunc():'],
        correctOptionIndex: 1,
        explanation: 'The "def" keyword is used to declare a function in Python.'
      },
      {
        skill: 'Python',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'What is the purpose of the Python "with" statement when dealing with files?',
        options: [
          'To run the code concurrently on multiple threads',
          'To ensure automatic cleanup and closure of the file resource via Context Management',
          'To encrypt the contents of the file on disk',
          'To open the file in write-only mode'
        ],
        correctOptionIndex: 1,
        explanation: 'The "with" statement provides clean context management, ensuring that resources like file descriptors are properly closed even if exceptions occur.'
      },
      {
        skill: 'Python',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'What is the time complexity of searching for an element in a Python dictionary by key on average?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctOptionIndex: 2,
        explanation: 'Python dictionaries are implemented using hash tables, giving average O(1) constant time lookup.'
      },
      {
        skill: 'Python',
        difficulty: 'Advanced',
        type: 'mcq',
        question: 'What is the Global Interpreter Lock (GIL) in CPython?',
        options: [
          'A cryptographic lock securing source code from tampering',
          'A mutex that allows only one thread to execute Python bytecode at a time',
          'A database transaction lock used by SQLite',
          'A memory leak prevention tool in the garbage collector'
        ],
        correctOptionIndex: 1,
        explanation: 'The GIL is a mutex in CPython that prevents multiple native threads from executing Python bytecodes simultaneously.'
      },

      // 2. PYTHON PRACTICAL CHALLENGE
      {
        skill: 'Python',
        difficulty: 'Intermediate',
        type: 'practical',
        question: 'Two Sum Problem in Python',
        practicalDetails: {
          problemStatement: 'Write a function `solution(nums, target)` that returns the indices of the two numbers in the array `nums` that add up to `target`. Assume exactly one solution exists.',
          language: 'python',
          starterCode: `def solution(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
          testCases: [
            { input: '[[2, 7, 11, 15], 9]', expectedOutput: '[0, 1]', isHidden: false },
            { input: '[[3, 2, 4], 6]', expectedOutput: '[1, 2]', isHidden: false },
            { input: '[[3, 3], 6]', expectedOutput: '[0, 1]', isHidden: true }
          ]
        }
      },

      // 3. JAVA MCQS
      {
        skill: 'Java',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'Which of the following is the default value of an uninitialized boolean instance variable in Java?',
        options: ['true', 'false', 'null', '0'],
        correctOptionIndex: 1,
        explanation: 'In Java, boolean primitive fields default to false.'
      },
      {
        skill: 'Java',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'Which keyword is used to inherit a class in Java?',
        options: ['implements', 'extends', 'inherits', 'instanceof'],
        correctOptionIndex: 1,
        explanation: 'The "extends" keyword establishes class inheritance in Java.'
      },
      {
        skill: 'Java',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
        options: [
          'String is mutable; StringBuilder and StringBuffer are immutable',
          'String is immutable; StringBuffer is thread-safe; StringBuilder is not thread-safe',
          'StringBuilder is thread-safe; StringBuffer is asynchronous',
          'All three are completely identical in memory and thread synchronization'
        ],
        correctOptionIndex: 1,
        explanation: 'String is immutable. StringBuffer synchronizes methods for thread safety, whereas StringBuilder is unsynchronized and faster.'
      },
      {
        skill: 'Java',
        difficulty: 'Advanced',
        type: 'mcq',
        question: 'What happens when an object is eligible for Garbage Collection in Java?',
        options: [
          'Memory is immediately reclaimed synchronously',
          'The GC reclaims its memory during its execution cycle, and finalize() was historically invoked once',
          'The application crashes with an OutOfMemoryError',
          'The JVM moves it to the Metaspace permanently'
        ],
        correctOptionIndex: 1,
        explanation: 'Garbage collection in Java is non-deterministic and runs asynchronously as needed by JVM heuristics.'
      },

      // 4. JAVA PRACTICAL CHALLENGE
      {
        skill: 'Java',
        difficulty: 'Intermediate',
        type: 'practical',
        question: 'Palindrome String Check in Java',
        practicalDetails: {
          problemStatement: 'Write a Java method `solution(String str)` that returns "true" if the given string is a palindrome ignoring case and spaces, or "false" otherwise.',
          language: 'java',
          starterCode: `public class Solution {\n    public static String solution(String str) {\n        String clean = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n        String reversed = new StringBuilder(clean).reverse().toString();\n        return clean.equals(reversed) ? "true" : "false";\n    }\n}`,
          testCases: [
            { input: '"racecar"', expectedOutput: 'true', isHidden: false },
            { input: '"hello"', expectedOutput: 'false', isHidden: false },
            { input: '"A man a plan a canal Panama"', expectedOutput: 'true', isHidden: true }
          ]
        }
      },

      // 5. REACT MCQS & PRACTICAL
      {
        skill: 'React',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'What is the primary purpose of the `useState` hook in React?',
        options: [
          'To perform asynchronous network requests on mount',
          'To declare and preserve state variables between component renders',
          'To directly manipulate DOM tree nodes',
          'To manage CSS styles dynamically'
        ],
        correctOptionIndex: 1,
        explanation: 'The `useState` hook allows functional components to declare and retain state.'
      },
      {
        skill: 'React',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'When does the cleanup function returned by `useEffect` execute?',
        options: [
          'Only when the browser window closes',
          'Before the effect runs again, and when the component unmounts',
          'Immediately upon initial component mounting',
          'Every time any unrelated prop in the application changes'
        ],
        correctOptionIndex: 1,
        explanation: 'React executes the cleanup function before re-running the effect on dependency change and when unmounting.'
      },
      {
        skill: 'React',
        difficulty: 'Advanced',
        type: 'mcq',
        question: 'What does `useCallback` do in React?',
        options: [
          'It caches the result of an expensive calculation',
          'It returns a memoized version of the callback function that only changes when its dependencies change',
          'It creates a synchronous Redux action dispatcher',
          'It forces a component re-render'
        ],
        correctOptionIndex: 1,
        explanation: '`useCallback` caches a function definition between renders unless its dependencies change.'
      },
      {
        skill: 'React',
        difficulty: 'Intermediate',
        type: 'practical',
        question: 'Array Filter Component Helper',
        practicalDetails: {
          problemStatement: 'Write a JavaScript helper function `solution(items, query)` that returns a JSON array of items whose name contains the search query (case-insensitive).',
          language: 'javascript',
          starterCode: `function solution(items, query) {\n    if (!query) return items;\n    return items.filter(item => \n        item.name.toLowerCase().includes(query.toLowerCase())\n    );\n}`,
          testCases: [
            { input: '[ [{"name":"Alice"},{"name":"Bob"}], "ali" ]', expectedOutput: '[{"name":"Alice"}]', isHidden: false },
            { input: '[ [{"name":"React"},{"name":"Python"}], "on" ]', expectedOutput: '[{"name":"Python"}]', isHidden: false }
          ]
        }
      },

      // 6. JAVASCRIPT MCQS & PRACTICAL
      {
        skill: 'JavaScript',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'Which operator is used for strict equality (comparing both value and type) in JavaScript?',
        options: ['==', '===', '=', '!='],
        correctOptionIndex: 1,
        explanation: 'The `===` operator compares values without type coercion.'
      },
      {
        skill: 'JavaScript',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'What is a closure in JavaScript?',
        options: [
          'A method that closes a database connection',
          'A combination of a function bundled together with references to its surrounding lexical environment',
          'A JSON serialization method',
          'A syntax error thrown when brackets do not match'
        ],
        correctOptionIndex: 1,
        explanation: 'A closure gives a function access to its outer scope even after the outer function has finished executing.'
      },
      {
        skill: 'JavaScript',
        difficulty: 'Intermediate',
        type: 'practical',
        question: 'Flatten Nested Array',
        practicalDetails: {
          problemStatement: 'Write a JavaScript function `solution(arr)` that flattens a nested array of arbitrary depth into a single flat array.',
          language: 'javascript',
          starterCode: `function solution(arr) {\n    return arr.flat(Infinity);\n}`,
          testCases: [
            { input: '[[1, [2, [3, 4], 5]]]', expectedOutput: '[1,2,3,4,5]', isHidden: false },
            { input: '[[[1], [2], [3]]]', expectedOutput: '[1,2,3]', isHidden: false }
          ]
        }
      },

      // 7. DATA SCIENCE MCQS
      {
        skill: 'Data Science',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'Which Python library is the standard for tabular data manipulation and DataFrame analysis?',
        options: ['Pandas', 'Flask', 'Django', 'Requests'],
        correctOptionIndex: 0,
        explanation: 'Pandas is the premier open-source library providing high-performance data structures like DataFrames.'
      },
      {
        skill: 'Data Science',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'What is the primary risk of overfitting a machine learning model?',
        options: [
          'The model trains too slowly',
          'The model learns noise and specific details of training data, failing to generalize to unseen test data',
          'The model uses too little memory',
          'The model can only make linear predictions'
        ],
        correctOptionIndex: 1,
        explanation: 'Overfitting occurs when a model memorizes training noise rather than capturing the underlying generalizable pattern.'
      },

      // 8. UI/UX DESIGN MCQS
      {
        skill: 'UI/UX Design',
        difficulty: 'Basic',
        type: 'mcq',
        question: 'What does the term "affordance" refer to in user interface design?',
        options: [
          'The monetary cost to develop the UI',
          'Visual or physical clues that suggest how an element should be interacted with (e.g. a 3D button invites clicking)',
          'The rendering speed of CSS animations',
          'The accessibility font size contrast'
        ],
        correctOptionIndex: 1,
        explanation: 'Affordance is the property of an object that visually suggests its functionality to the user.'
      },
      {
        skill: 'UI/UX Design',
        difficulty: 'Intermediate',
        type: 'mcq',
        question: 'According to Hick\'s Law in UX design:',
        options: [
          'The time it takes to make a decision increases logarithmically with the number and complexity of choices',
          'Users spend most of their time on other websites',
          'Touch targets must be at least 48x48 pixels',
          'Contrast ratios must always exceed 4.5:1'
        ],
        correctOptionIndex: 0,
        explanation: 'Hick\'s Law states that decision time increases with the number of available options.'
      }
    ];

    await Assessment.insertMany(defaultAssessments);
    console.log(`[Seed] Successfully seeded ${defaultAssessments.length} assessment questions.`);
  } catch (error) {
    console.error('[Seed Error] Failed to seed assessment questions:', error.message);
  }
};
