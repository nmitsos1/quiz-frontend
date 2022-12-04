import axios from "axios";

export interface TopicCount {
  topic: string,
  count: number
}

export const getTopics = async () => {
  return await axios.get<Array<string>>('/api/user/topics')
  .then(response => response.data);
}

export const getMyAvailableQuestionCount = async (topic: string, groupIds: Array<number>) => {
  return await axios.get<number>(`/api/user/questions/count?topic=${topic.toUpperCase()}&groupIds=${groupIds}`)
  .then(response => response.data);
}

export const getAvailableQuestionCount = async (topic: string, state: string, isPristine: boolean, isClean: boolean) => {
  return await axios.get<number>(`/api/admin/questions/count?topic=${topic.toUpperCase()}&state=${state}&isPristine=${isPristine}&isClean=${isClean}`)
  .then(response => response.data);
}

export const getTopicCountsByGroupId = async (groupId: number) => {
  return await axios.get<Array<TopicCount>>(`/api/user/questions/count/group/${groupId}`)
  .then(response => response.data);
}
