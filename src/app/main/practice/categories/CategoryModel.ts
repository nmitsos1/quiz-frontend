import axios from "axios";

export interface CategoryCount {
  category: string,
  count: number
}

export const getCategories = async () => {
  return await axios.get<Array<string>>('/api/user/categories')
  .then(response => response.data);
}

export const getMyAvailableQuestionCount = async (category: string, groupIds: Array<number>) => {
  return await axios.get<number>(`/api/user/questions/count?category=${category.toUpperCase()}&groupIds=${groupIds}`)
  .then(response => response.data);
}

export const getAvailableQuestionCount = async (category: string) => {
  return await axios.get<number>(`/api/admin/questions/count?category=${category.toUpperCase()}`)
  .then(response => response.data);
}

export const getCategoryCountsByGroupId = async (groupId: number) => {
  return await axios.get<Array<CategoryCount>>(`/api/user/questions/count/group/${groupId}`)
  .then(response => response.data);
}
