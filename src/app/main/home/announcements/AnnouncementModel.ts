import axios from "axios";

export interface Announcement {
  announcementId?: number,
  title: string,
  content: string,
  createdAt?: Date,
  updatedAt?: Date
}

export const getAnnouncements = async () => {
  return await axios.get<Array<Announcement>>('/api/user/announcements')
  .then(response => response.data);
}

export const addAnnouncement = async (announcement: Announcement) => {
  return await axios.post<Announcement>('/api/admin/announcements', announcement)
  .then(response => response.data);
}

export const updateAnnouncement = async (announcement: Announcement) => {
  return await axios.put<Announcement>(`/api/admin/announcements/${announcement.announcementId}`, announcement)
  .then(response => response.data);
}

export const deleteAnnouncement = async (id: number | undefined) => {
  return await axios.delete(`/api/admin/announcements/${id}`);
}

