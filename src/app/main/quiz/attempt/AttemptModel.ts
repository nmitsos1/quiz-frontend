import { Group } from './../../practice/questionGroups/GroupModel';
import { QuestionInstanceAttempt } from './../QuestionModel';
import axios from "axios";

export interface Attempt {
    attemptId: number,
    questionGroupName: string,
    groupStartTime: Date,
    currentQuestionIndex: number,
    currentScore: number,
    endTime: Date,
    questionInstanceAttempts: Array<QuestionInstanceAttempt>,
    questionGroup: Group
}

export const getAttemptById = async (id: string | undefined) => {
    return await axios.get<Attempt>(`/api/user/attempts/${id}`)
    .then(response => response.data);
}

export const getMyAttempts = async () => {
    return await axios.get<Array<Attempt>>(`/api/user/attempts`)
    .then(response => response.data);
}

export const shouldSaveSetPromptAppear = async (id: string | undefined) => {
    return await axios.get<boolean>(`/api/user/attempts/${id}/savesetprompt`)
    .then(response => response.data);
}

export const isLastAttemptInProgress = async () => {
    return await axios.get<boolean>(`/api/user/attempts/inProgress`)
    .then(response => response.data);
}

export const beginAttempt = async (groupId: number) => {
    return await axios.post<Attempt>(`/api/user/attempts/groups/${groupId}`)
    .then(response => response.data);
}

export const killAttempt = async () => {
    return await axios.post<Attempt>(`/api/user/attempts/stop`)
    .then(response => response.data);
}
