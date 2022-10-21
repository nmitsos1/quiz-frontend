import axios from "axios";
import { Page } from "../Pagination";

export interface Question {
    questionId: number,
    originalIdentifier: number,
    questionCategory: string,
    questionText: string,
    answers: Array<Answer>
}

export interface Answer {
    answerId: number,
    answerText: string
}

export interface QuestionRequest {
    questionId?: number,
    questionCategory: string,
    questionText: string,
    answers: Array<Answer>,
    correctAnswer: string,
    isShuffled: boolean
}

export const getQuestions = async (query: String, page: number, count: number) => {
    return await axios.get<Page<Question>>(`/api/admin/questions?query=${query}&page=${page}&count=${count}`)
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

export const addQuestion = async (questionRequest: QuestionRequest) => {
    return await axios.post<Question>(`/api/admin/questions`, questionRequest)
    .then(response => response.data);
}

export const updateQuestionById = async (questionRequest: QuestionRequest) => {
    return await axios.put<Question>(`/api/admin/questions/${questionRequest.questionId}`, questionRequest)
    .then(response => response.data);
}

export const deleteQuestionById = async (id: number) => {
    return await axios.delete(`/api/admin/questions/${id}`)
    .then(response => response.data);
}