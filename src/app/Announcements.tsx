import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardBody, CardTitle, Collapse } from 'reactstrap';
import { addAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from './AnnouncementModel';

function Announcements() {

  const queryClient = useQueryClient();

  const { isLoading, isError, data: announcements, error } = useQuery(['announcements'], getAnnouncements);

  const added = useMutation(addAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    }
  });
  const updated = useMutation(updateAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    }
  });
  const deleted = useMutation(deleteAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    }
  });

  const handleSubmit = () => {
    added.mutate({ title: 'test', content: 'test text'})
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
      <div>
        {announcements?.map(announcement => {
          return (
            <Card color='dark'>
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
