import { QuestionInstance } from './../../quiz/QuestionModel';
import axios from "axios";
import { CategoryCount } from "../categories/CategoryModel";

export interface Group {
  questionGroupId: number,
  questionGroupName: string,
  questionGroupDescription: string,
  groupType: string,
  questionInstances: Array<QuestionInstance>
}

export interface SetRequest {
  categoryCounts: Array<CategoryCount>,
  groupIds: Array<number>
}

export const getGroups = async () => {
  return await axios.get<Array<Group>>('/api/user/groups')
  .then(response => response.data);
}

export const getGroupsBySchoolId = async (schoolId: number) => {
  return await axios.get<Array<Group>>(`/api/admin/groups/schools/${schoolId}`)
  .then(response => response.data);
}

export const getAllGroups = async () => {
  return await axios.get<Array<Group>>(`/api/admin/groups`)
  .then(response => response.data);
}


export const addSet = async (set: SetRequest) => {
  return await axios.post<Group>('api/user/groups', set)
  .then(response => response.data);
}

export const updateSet = async (group: Group) => {
  return await axios.put<Group>(`api/admin/groups/${group.questionGroupId}`, group)
  .then(response => response.data);
}

export const deleteSet = async (id: number | undefined) => {
  return await axios.delete(`api/admin/groups/${id}`);
}

