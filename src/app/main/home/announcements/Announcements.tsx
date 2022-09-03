import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardBody, CardTitle } from 'reactstrap';
import { addAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from './AnnouncementModel';
import { getMySchool, ROLE } from '../../SchoolModel';

function Announcements() {

  const { isLoading, isError, data: announcements, error } = useQuery(['announcements'], getAnnouncements);
  const {data: school} = useQuery(['my-school'], getMySchool)

  const queryClient = useQueryClient();

  const addAnnouncementMutation = useMutation(addAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['add-announcement']
  });

  const updateAnnouncementMutation = useMutation(updateAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['update-announcement']
  });

  const deleteAnnouncementMutation = useMutation(deleteAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['delete-announcement']
  });

  const handleSubmit = () => {
    addAnnouncementMutation.mutate({ title: 'test', content: 'test text'})
  }

  if (isLoading) {
    return <h4>Loading Announcements...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading Announcements. {err.message} - {err.response?.statusText}</h4>
  }

  if (announcements?.length === 0) {
    return <h4>No Announcements to display.</h4>
  }

  return (
    <div>
      <h4>Announcements</h4>
      {school?.role===ROLE.ADMIN ? <Button color='primary' onClick={handleSubmit}>Add Announcement</Button> : <React.Fragment/>}
      <div>
        {announcements?.map(announcement => {
          return (
            <Card outline color='info'>
              <CardTitle>{announcement.title}</CardTitle>
              <CardBody>{announcement.content}</CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Announcements;
