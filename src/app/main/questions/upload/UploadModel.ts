import axios from "axios";


export const uploadQuestionPdf = async (file: File) => {
    const formData = new FormData();
    formData.append('File', file);
    return await axios.post(`/api/admin/upload/questions`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
    })
    .then(response => response.data);
}