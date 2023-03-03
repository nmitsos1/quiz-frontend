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
    ruleSet: RuleSet,
    timeRemaining: number
}

export interface EventPlacement {
    numberOfParticipants: number,
    myPlacement: number
}

export enum RuleSet {
    OFFICIAL = 'Official',
    CLASSIC = 'Classic',
    RELAY = 'Relay',
    UNTIMED = 'Untimed'
}

export function getRuleSetDescriptions(ruleSet: RuleSet) {
    switch (ruleSet) {
        case RuleSet.RELAY:
            return '10 seconds to answer each question. You only get one guess, scoring is all or nothing.'
        case RuleSet.UNTIMED:
            return 'You may take as long as you like to submit a single answer for each question.'
        case RuleSet.CLASSIC:
            return 'An older mode of competitive play. More points for faster answers, with an opportunity to guess again if you get it wrong for fewer points.'
        case RuleSet.OFFICIAL:
        default:
            return 'The default mode used in official events. You must complete the quiz in the alotted time, but each individual question is untimed.'
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

export const getMyRecentEventAttempts = async () => {
    return await axios.get<Array<Attempt>>(`/api/user/attempts/recent-events`)
    .then(response => response.data);
}

export const getMyEventPlacement = async (attemptId: number) => {
    return await axios.get<EventPlacement>(`/api/user/attempts/${attemptId}/placement`)
    .then(response => response.data);
}

export const shouldSaveSetPromptAppear = async (id: string | undefined) => {
    return await axios.get<boolean>(`/api/user/attempts/${id}/savesetprompt`)
    .then(response => response.data);
}

export const getAttemptTypeInProgress = async () => {
    return await axios.get<string>(`/api/user/attempts/inProgress`)
    .then(response => response.data);
}

export const isAttemptOnGroupCompleted = async (id: number) => {
    return await axios.get<boolean>(`/api/user/attempts/events/${id}/completed`)
    .then(response => response.data);
}

export interface beginAttemptParams {
    groupId: number,
    ruleSet: RuleSet,
    allottedTime?: number
}
export const beginAttempt = async (params: beginAttemptParams) => {
    return await axios.post<Attempt>(`/api/user/attempts/groups/${params.groupId}/${params.ruleSet}${params.allottedTime ? `?time=${params.allottedTime}` : ''}`)
    .then(response => response.data);
}

export const beginEvent = async (groupId: number) => {
    return await axios.post<Attempt>(`/api/user/attempts/events/${groupId}`)
    .then(response => response.data);
}

export const killAttempt = async () => {
    return await axios.post<Attempt>(`/api/user/attempts/stop`)
    .then(response => response.data);
}
