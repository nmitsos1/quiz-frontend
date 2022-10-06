import { Page } from './../Pagination';
import axios from "axios";

export interface School {
    schoolId?: number,
    schoolName: string,
    email: string,
    role?: ROLE,
    createdAt?: Date,
    updatedAt?: Date
}

export enum ROLE {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export const getMySchool = async () => {
    return await axios.get<School>('/api/user/school')
    .then(response => response.data);
}

export const getSchoolById = async (id: number) => {
    return await axios.get<School>(`/api/admin/schools/${id}`)
    .then(response => response.data);
}

export const getSchools = async (name: String, page: number, count: number) => {
    return await axios.get<Page<School>>(`/api/admin/schools?name=${name}&page=${page}&count=${count}`)
    .then(response => response.data);
}

export const addSchool = async (school: School) => {
    return await axios.post<School>('api/admin/schools', school)
    .then(response => response.data);
}

export const updateSchool = async (school: School) => {
    return await axios.put<School>(`api/admin/schools/${school.schoolId}`, school)
    .then(response => response.data);
}
  
export const deleteSchool = async (id: number | undefined) => {
    return await axios.delete(`api/admin/schools/${id}`);
}
  