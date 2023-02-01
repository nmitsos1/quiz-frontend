import axios from "axios";
import { Page } from "../Pagination";
import { Group } from "../practice/questionGroups/GroupModel";
import { School } from "../schools/SchoolModel";

export interface EventRequest {
    eventRequestId: number,
    school: School,
    eventPackage: Group,
    createdAt: Date
}

export const getEventRequests = async (page: number, count: number) => {
    return await axios.get<Page<EventRequest>>(`/api/admin/event-requests?page=${page}&count=${count}`)
    .then(response => response.data);
}

export const fulfillRequest = async (id: number) => {
    return await axios.post(`/api/admin/event-requests/${id}`);
}

export const deleteEventRequest = async (id: number) => {
    return await axios.delete(`/api/admin/event-requests/${id}`);
}

export const isMyRequestFulfilled = async (id: number) => {
    return await axios.get<Boolean>(`/api/user/requests/events/${id}`)
    .then(response => response.data);
}

export const requestEvent = async (id: number) => {
    return await axios.post(`/api/user/requests/events/${id}`);
}

export const deleteMyEventRequest = async (id: number) => {
    return await axios.delete(`/api/user/requests/events/${id}`);
}
