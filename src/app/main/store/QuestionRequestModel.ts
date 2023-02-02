import axios from "axios";
import { Page } from "../Pagination";
import { Group } from "../practice/questionGroups/GroupModel";
import { School } from "../schools/SchoolModel";

export interface QuestionRequest {
    questionRequestId: number,
    school: School,
    numberOfQuestions: number,
    isPristine: boolean,
    isClean: boolean,
    state: string,
    description: string,
    createdAt: Date
}

export enum FulfillOptions {
    NONE,
    CREATE,
    REUSE,
    FULFILL
}

export const getQuestionRequests = async (page: number, count: number) => {
    return await axios.get<Page<QuestionRequest>>(`/api/admin/question-requests?page=${page}&count=${count}`)
    .then(response => response.data);
}

interface CreateGroupAndFulfillRequestProps {
    questionRequestId: number,
    name: string,
    description: string
}
export const createGroupAndFulfillRequest = async ({questionRequestId, name, description}: CreateGroupAndFulfillRequestProps) => {
    return await axios.post<Group>(`/api/admin/question-requests/${questionRequestId}`, {name, description});
}

interface FulfillRequestWithExistingGroupProps {
    questionRequestId: number,
    questionGroupId: number
}
export const fulfillRequestWithExistingGroup = async ({ questionRequestId, questionGroupId }: FulfillRequestWithExistingGroupProps) => {
    return await axios.post(`/api/admin/question-requests/${questionRequestId}/groups/${questionGroupId}`);
}

export const deleteQuestionRequest = async (id: number) => {
    return await axios.delete(`/api/admin/question-requests/${id}`);
}

export const getMyQuestionRequest = async () => {
    return await axios.get<QuestionRequest | undefined>(`/api/user/requests`)
    .then(response => response.data);
}

export interface QuestionRequestInput {
    numberOfQuestions: number,
    isPristine: boolean,
    isClean: boolean,
    description: string
}
export const submitQuestionRequest = async (questionRequest: QuestionRequestInput) => {
    return await axios.post<QuestionRequest>(`/api/user/requests`, questionRequest)
    .then(response => response.data);
}

export const deleteMyQuestionRequest = async () => {
    return await axios.delete(`/api/user/requests`);
}
