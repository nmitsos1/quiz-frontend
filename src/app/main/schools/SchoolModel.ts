import axios from "axios";

export interface School {
    schoolName: string,
    email: string,
    role: ROLE
}

export enum ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export const getMySchool = async () => {
    return await axios.get<School>('/api/user/school')
    .then(response => response.data);
}

export const getSchools = async (name: String) => {
    return await axios.get<Array<School>>('/api/admin/schools')
    .then(response => response.data);
}
