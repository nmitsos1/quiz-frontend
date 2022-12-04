import axios from "axios";
import { Page } from "../Pagination";
import { Question } from "../questions/QuestionModel";

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

export const getCurrentQuestion = async () => {
    return await axios.get<QuestionInstanceAttempt>(`/api/user/attempts/question`)
    .then(response => response.data);
}

export const startNextQuestion = async () => {
    return await axios.post<QuestionInstanceAttempt>(`/api/user/attempts/question`)
    .then(response => response.data);
}

export const answerCurrentQuestion = async (answer: String) => {
    return await axios.post<Boolean>(`/api/user/attempts/question/answer`, answer, {
        headers: {"Content-Type": "text/plain"}
    })
    .then(response => response.data);
}

export const getMyQuestionsByAttemptId = async (id: number, page: number, count: number) => {
    return await axios.get<Page<QuestionInstanceAttempt>>(`/api/user/attempts/${id}/questions?page=${page}&count=${count}`)
    .then(response => response.data);
}

export const getMyQuestionsCountByGroupId = async (id: number) => {
    return await axios.get<number>(`/api/user/groups/${id}/instances`)
    .then(response => response.data);
}
