import { Group } from './../../practice/questionGroups/GroupModel';
import { QuestionInstanceAttempt } from '../QuestionAttemptModel';
import axios from "axios";

export interface Attempt {
    attemptId: number,
    questionGroupName: string,
    groupStartTime: Date,
    currentQuestionIndex: number,
    currentScore: number,
    endTime: Date,
    questionInstanceAttempts: Array<QuestionInstanceAttempt>,
    questionGroup: Group,
    ruleSet: RuleSet
}

export enum RuleSet {
    DEFAULT = 'Default',
    RELAY = 'Relay',
    UNTIMED = 'Untimed'
}

export function getRuleSetDescriptions(ruleSet: RuleSet) {
    switch (ruleSet) {
        case RuleSet.RELAY:
            return '10 seconds to answer each question. You only get one guess, scoring is all or nothing.'
        case RuleSet.UNTIMED:
            return 'You may take as long as you like to submit a single answer for each question.'
        case RuleSet.DEFAULT:
        default:
            return 'The default mode used in official events. More points for faster answers, with an opportunity to guess again if you get it wrong for fewer points.'
    }
}

export const getAttemptById = async (id: string | undefined) => {
    return await axios.get<Attempt>(`/api/user/attempts/${id}`)
    .then(response => response.data);
}

export const getMyAttempt = async () => {
    return await axios.get<Attempt>(`/api/user/attempt`)
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

export interface beginAttemptParams {
    groupId: number,
    ruleSet: RuleSet
}
export const beginAttempt = async (params: beginAttemptParams) => {
    return await axios.post<Attempt>(`/api/user/attempts/groups/${params.groupId}/${params.ruleSet}`)
    .then(response => response.data);
}

export const killAttempt = async () => {
    return await axios.post<Attempt>(`/api/user/attempts/stop`)
    .then(response => response.data);
}
