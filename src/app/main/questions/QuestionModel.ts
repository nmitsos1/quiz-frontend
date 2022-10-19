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
