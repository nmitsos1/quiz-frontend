import { GroupInput } from './../../practice/questionGroups/GroupModel';
import axios from "axios";


export const uploadMultipleChoiceCsv = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`/api/admin/upload/mc`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
    })
    .then(response => response.data);
}

export const uploadShortAnswerCsv = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axios.post(`/api/admin/upload/sa`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
    })
    .then(response => response.data);
}

export interface GroupUpload {
    file: File,
    group: GroupInput
}
export const uploadGroupMultipleChoiceCsv = async ({file, group}: GroupUpload) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupInput', new Blob([JSON.stringify(group)], {
        type: 'application/json'
    }))
    return await axios.post(`/api/admin/upload/group/mc`, formData, {
        responseType: 'blob'
    })
    .then(response => response.data);
}

export const uploadGroupShortAnswerCsv = async ({file, group}: GroupUpload) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupInput', new Blob([JSON.stringify(group)], {
        type: 'application/json'
    }))
    return await axios.post(`/api/admin/upload/group/sa`, formData, {
        responseType: 'blob'
    })
    .then(response => response.data);
}