import axios from 'axios';
import { GEMINI_API_KEY } from '../config/env';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.5-flash';

const callGemini = async (prompt) => {
  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty response received from Gemini API');

  const clean = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
  return JSON.parse(clean);
};

/**
 * Analyses syllabus text and extracts structured list of topics.
 * @param {string} syllabusText - Plain text of the syllabus.
 * @returns {Promise<Array<{ title: string, estimated_hours: number, complexity: number }>>}
 */
export const analyseSyllabus = async (syllabusText) => {
  try {
    const prompt = `You are an academic assistant. Analyse this syllabus and extract a structured list of topics. For each topic return: title, estimated_hours (integer 1-4 based on complexity), complexity (1-5). Return ONLY a JSON array, no other text:\n[{"title": "...", "estimated_hours": 2, "complexity": 3}]\n\nSyllabus:\n${syllabusText}`;
    const result = await callGemini(prompt);
    if (!Array.isArray(result)) throw new Error('Expected array response');
    return result;
  } catch (err) {
    throw new Error(`Syllabus analysis failed: ${err.message}`);
  }
};

/**
 * Analyses past exam questions to identify hot topics sorted by frequency.
 * @param {string} pyqText - Plain text of past questions.
 * @returns {Promise<Array<{ topic: string, frequency_count: number, importance: 'high'|'medium'|'low' }>>}
 */
export const analysePYQ = async (pyqText) => {
  try {
    const prompt = `You are an academic assistant. Analyse these past exam questions and identify topics that appear most frequently. Return ONLY a JSON array sorted by frequency descending, no other text:\n[{"topic": "...", "frequency_count": 5, "importance": "high"}]\n\nPast Questions:\n${pyqText}`;
    const result = await callGemini(prompt);
    if (!Array.isArray(result)) throw new Error('Expected array response');
    return result;
  } catch (err) {
    throw new Error(`PYQ analysis failed: ${err.message}`);
  }
};

export default {
  analyseSyllabus,
  analysePYQ,
};
