import { QuestionInstance } from '../../quiz/QuestionAttemptModel';
import axios from "axios";
import { CategoryCount } from "../categories/CategoryModel";
import { Page } from '../../Pagination';

export interface Group {
  questionGroupId: number,
  questionGroupName: string,
  questionGroupDescription: string,
  groupType?: string,
  questionInstances?: Array<QuestionInstance>
}

export interface SetRequest {
  categoryCounts: Array<CategoryCount>,
  groupIds: Array<number>
}

interface UpdateSchoolGroupsParams {
  schoolId: number,
  ids: Array<number>
}

interface BulkAddGroupsParams {
  schoolIds: Array<number>,
  groupIds: Array<number>
}

export const getMyGroups = async () => {
  return await axios.get<Array<Group>>('/api/user/groups')
  .then(response => response.data);
}

export const getMyGroupById = async (id: number) => {
  return await axios.get<Group>(`/api/user/groups/${id}`)
  .then(response => response.data);
}

export const getGroupsBySchoolId = async (schoolId: number) => {
  return await axios.get<Array<Group>>(`/api/admin/groups/schools/${schoolId}`)
  .then(response => response.data);
}

export const getAllGroups = async (name: string, page: number, count: number) => {
  return await axios.get<Page<Group>>(`/api/admin/groups?name=${name}&page=${page}&count=${count}`)
  .then(response => response.data);
}


export const addSet = async (set: SetRequest) => {
  return await axios.post<Group>('api/user/groups', set)
  .then(response => response.data);
}

export const addGroup = async (group: SetRequest) => {
  return await axios.post<Group>('api/admin/groups', group)
  .then(response => response.data);
}

export const updateMySet = async (group: Group) => {
  return await axios.put<Group>(`api/user/groups/${group.questionGroupId}`, group,)
  .then(response => response.data);
}

export const updateGroup = async (group: Group) => {
  return await axios.put<Group>(`api/admin/groups/${group.questionGroupId}`, group)
  .then(response => response.data);
}

export const updateGroupsForSchool = async ({schoolId, ids}: UpdateSchoolGroupsParams) => {
  return await axios.put(`/api/admin/groups/schools/${schoolId}`, {ids: ids})
  .then(response => response.data);
}

export const bulkAddGroups = async ({schoolIds, groupIds}: BulkAddGroupsParams) => {
  return await axios.put(`/api/admin/groups/schools`, {schoolIds: schoolIds, groupIds: groupIds})
  .then(response => response.data);
}

export const deleteMySet = async (id: number | undefined) => {
  return await axios.delete(`api/user/groups/${id}`);
}

export const deleteGroup = async (id: number | undefined) => {
  return await axios.delete(`api/admin/groups/${id}`);
}

