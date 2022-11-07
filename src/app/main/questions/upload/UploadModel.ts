import axios from "axios";


export const uploadMultipleChoiceCsv = async (file: File) => {
    const formData = new FormData();
    formData.append('File', file);
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
    formData.append('File', file);
    return await axios.post(`/api/admin/upload/sa`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
    })
    .then(response => response.data);
}