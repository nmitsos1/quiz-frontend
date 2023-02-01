import axios from "axios";

export const isMyRequestFulfilled = async (id: number) => {
    return await axios.get<Boolean>(`/api/user/requests/events/${id}`)
    .then(response => response.data);
}

export const requestEvent = async (id: number) => {
    return await axios.post(`/api/user/requests/events/${id}`);
}

export const deleteMyEventRequest = async (id: number) => {
    return await axios.post(`/api/user/requests/events/${id}`);
}
