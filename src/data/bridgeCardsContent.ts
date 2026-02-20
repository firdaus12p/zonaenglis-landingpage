import type { WarmupCard, PartnerCard } from '../types/bridgeCards';

export const warmupCards: WarmupCard[] = [
  { id: 1, front: 'Translate to English: "Bangun tidur"', back: 'Wake up', audio: '🔊' },
  { id: 2, front: 'Fill in the blank: "I ___ breakfast at 7:00 AM."', back: 'eat / have', audio: '🔊' },
  { id: 3, front: 'Name 3 colors in English!', back: 'Red, Blue, Green (any 3 colors)', audio: '🔊' },
  { id: 4, front: 'Reorder: "Apple - like - I"', back: 'I like apples.', audio: '🔊' },
  { id: 5, front: 'What is the opposite of "Big"?', back: 'Small', audio: '🔊' }
];

export const partnerCards: PartnerCard[] = [
  { id: 1, question: 'What is your name?', expected: 'My name is...', keywords: ['name', 'is'] },
  { id: 2, question: 'Where do you live?', expected: 'I live in...', keywords: ['live', 'in'] },
  { id: 3, question: 'What is your favorite color?', expected: 'My favorite color is...', keywords: ['favorite', 'color'] },
  { id: 4, question: 'Do you like coffee or tea?', expected: 'I like...', keywords: ['like'] },
  { id: 5, question: 'What time do you go to sleep?', expected: 'I go to sleep at...', keywords: ['sleep', 'at'] },
  { id: 6, question: 'What is your favorite food?', expected: 'I love... / My favorite food is...', keywords: ['favorite', 'food'] },
  { id: 7, question: 'Is your house big or small?', expected: 'My house is...', keywords: ['house', 'is'] },
  { id: 8, question: 'How many siblings do you have?', expected: 'I have... brothers/sisters.', keywords: ['have'] },
  { id: 9, question: 'What is your hobby?', expected: 'My hobby is...', keywords: ['hobby'] },
  { id: 10, question: 'Are you happy today?', expected: 'Yes, I am happy! / I am...', keywords: ['am', 'happy'] }
];
