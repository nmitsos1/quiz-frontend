import axios from "axios";

export const getCategories = async () => {
  return await axios.get<Array<string>>('/api/user/categories')
  .then(response => response.data);
}

export const getAvailableQuestionCount = async (category: string, groupIds: Array<number>) => {
  return await axios.get<number>(`/api/user/questions/count?category=${category.toUpperCase()}&groupIds=${groupIds}`)
  .then(response => response.data);
}
