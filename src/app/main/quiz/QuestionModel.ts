import axios from "axios";
import { Page } from "../Pagination";

export interface QuestionInstanceAttempt {
    questionInstanceAttemptId: number,
    attempt: number,
    questionInstance: QuestionInstance,
    questionStartTime: Date,
    questionEndTime: Date,
    questionScore: number,
    answer: string,
    secondAnswer: string
}

export interface QuestionInstance {
    questionInstanceId: number,
    questionIndex: number,
    question: Question
}

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

export const getCurrentQuestion = async () => {
    return await axios.get<QuestionInstanceAttempt>(`/api/user/attempts/question`)
    .then(response => response.data);
}

export const startNextQuestion = async () => {
    return await axios.post<QuestionInstanceAttempt>(`/api/user/attempts/question`)
    .then(response => response.data);
}

export const answerCurrentQuestion = async (answer: Answer) => {
    return await axios.post<Boolean>(`/api/user/attempts/question/answer`, answer)
    .then(response => response.data);
}

export const getMyQuestionsByAttemptId = async (id: number, page: number, count: number) => {
    console.log(page)
    console.log(count)
    return await axios.get<Page<QuestionInstanceAttempt>>(`/api/user/attempts/${id}/questions?page=${page}&count=${count}`)
    .then(response => response.data);
}

export const getMyQuestionsCountByGroupId = async (id: number) => {
    return await axios.get<number>(`/api/user/groups/${id}/instances`)
    .then(response => response.data);
}
