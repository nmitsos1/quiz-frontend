import axios from "axios";

export interface Group {
  questionGroupId: number,
  questionGroupName: string,
  questionGroupDescription: string,
  groupType: string
}

export const getGroups = async () => {
  return await axios.get<Array<Group>>('/api/user/groups')
  .then(response => response.data);
}

export const addSet = async (group: Group) => {
  return await axios.post<Group>('api/admin/groups', group)
  .then(response => response.data);
}

export const updateSet = async (group: Group) => {
  return await axios.put<Group>(`api/admin/groups/${group.questionGroupId}`, group)
  .then(response => response.data);
}

export const deleteSet = async (id: number | undefined) => {
  return await axios.delete(`api/admin/groups/${id}`);
}

