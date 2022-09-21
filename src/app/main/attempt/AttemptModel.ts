import axios from "axios";

export interface Attempt {
    attemptId: number,
    questionGroupName: string,
    groupStartTime: Date,
    currentQuestionIndex: number,
    currentScore: number,
    endTime: Date
}

export const getCurrentAttempt = async () => {
    return await axios.get<Attempt>(`/api/user/attempts/current`)
    .then(response => response.data);
}

export const beginAttempt = async (groupId: number) => {
    return await axios.post<Attempt>(`/api/user/attempts/groups/${groupId}`)
    .then(response => response.data);
}
  