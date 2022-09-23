import axios from "axios";

export interface QuestionInstanceAttempt {
    questionInstanceAttemptId: number,
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
  