import type { Question } from './types'

// Sample dataset demonstrating the quiz/MCQ engine. Extend freely — the
// Questions and Quiz UI are fully data-driven.
export const questions: Question[] = [
  {
    id: 'q1',
    question: 'Which organ in the human body is primarily responsible for filtration of blood?',
    options: ['Heart', 'Kidney', 'Liver', 'Lungs'],
    answer: 1,
    explanation: 'The kidneys filter blood to remove waste products and excess water, forming urine.',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'science',
    chapter: 'Life Processes',
    difficulty: 'Easy',
  },
  {
    id: 'q2',
    question: 'What is the HCF of 12 and 18?',
    options: ['3', '6', '9', '12'],
    answer: 1,
    explanation: 'The highest common factor of 12 and 18 is 6.',
    classSlug: 'class-10',
    board: 'CBSE',
    subject: 'mathematics',
    chapter: 'Real Numbers',
    difficulty: 'Easy',
  },
  {
    id: 'q3',
    question: 'Which of the following is a state of matter that has a definite volume but no definite shape?',
    options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
    answer: 1,
    explanation: 'Liquids have a definite volume but take the shape of their container.',
    classSlug: 'class-9',
    board: 'MP Board',
    subject: 'science',
    chapter: 'Matter in Our Surroundings',
    difficulty: 'Easy',
  },
  {
    id: 'q4',
    question: 'Identify the correct tense: "She ___ to school every day."',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1,
    explanation: 'Simple present tense with a third-person singular subject takes the verb + "s/es" form.',
    classSlug: 'class-8',
    board: 'CBSE',
    subject: 'english',
    chapter: 'Grammar — Tenses',
    difficulty: 'Easy',
  },
  {
    id: 'q5',
    question: 'In Mendelian genetics, the ratio of phenotypes in an F2 generation for a monohybrid cross is:',
    options: ['1:1', '1:2:1', '3:1', '9:3:3:1'],
    answer: 2,
    explanation: 'A monohybrid cross produces a 3:1 phenotypic ratio in the F2 generation.',
    classSlug: 'class-12',
    board: 'CBSE',
    subject: 'biology',
    chapter: 'Genetics and Evolution',
    difficulty: 'Medium',
  },
]

export function getQuestion(id: string) {
  return questions.find((q) => q.id === id)
}
