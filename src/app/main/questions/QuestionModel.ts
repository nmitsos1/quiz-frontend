import axios from "axios";
import { Page } from "../Pagination";

export interface Question {
    questionId: number,
    type: string,
    title: string,
    text: string,
    topic: string,
    category: string,
    level: string,
    difficulty: string,
    isPristine: boolean,
    answers: Array<Answer>
}

export interface Answer {
    answerId: number,
    answerText: string
}

export interface QuestionInput {
    questionId?: number,
    type: string,
    topic: string,
    text: string,
    answers: Array<Answer>,
    correctAnswer: string,
    isShuffled: boolean
}

export const getQuestions = async (query: String, topic: String, groupId: number | undefined, page: number, count: number) => {
    return await axios.get<Page<Question>>(`/api/admin/questions?query=${query}&topic=${topic}&page=${page}&count=${count}${groupId ? `&groupId=${groupId}` : ''}`)
    .then(response => response.data);
}

export const getQuestionById = async (id: number) => {
    return await axios.get<Question>(`/api/admin/questions/${id}`)
    .then(response => response.data);
}

export const getCorrectAnswerByQuestionId = async (id: number) => {
    return await axios.get<Answer>(`/api/admin/answer/question/${id}`)
    .then(response => response.data);
}

export const addQuestion = async (questionInput: QuestionInput) => {
    return await axios.post<Question>(`/api/admin/questions`, questionInput)
    .then(response => response.data);
}

export const updateQuestionById = async (questionInput: QuestionInput) => {
    return await axios.put<Question>(`/api/admin/questions/${questionInput.questionId}`, questionInput)
    .then(response => response.data);
}

export const deleteQuestionById = async (id: number) => {
    return await axios.delete(`/api/admin/questions/${id}`)
    .then(response => response.data);
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'v',
    SHORT_ANSWER = 's',
    PYRAMID = 'p'
}