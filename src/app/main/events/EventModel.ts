import axios from "axios";
import { Group, UpdateSchoolGroupsParams } from "../practice/questionGroups/GroupModel";

export const getMyEvents = async () => {
  return await axios.get<Array<Group>>(`/api/user/events`)
  .then(response => response.data);
}

export const getEventsBySchoolId = async (schoolId: number) => {
  return await axios.get<Array<Group>>(`/api/admin/events/schools/${schoolId}`)
  .then(response => response.data);
}

export const updateEventsForSchool = async ({schoolId, ids}: UpdateSchoolGroupsParams) => {
  return await axios.put(`/api/admin/events/schools/${schoolId}`, {ids: ids})
  .then(response => response.data);
}

