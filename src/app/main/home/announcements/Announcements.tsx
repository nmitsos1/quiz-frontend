import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardBody, CardColumns, CardFooter, CardHeader, CardText, CardTitle, Col, Row } from 'reactstrap';
import { addAnnouncement, Announcement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from './AnnouncementModel';
import { getMySchool, ROLE } from '../../SchoolModel';
import Moment from 'moment';

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
    <div className='announcements'>
      <h4>Announcements</h4>
      {school?.role===ROLE.ADMIN ? <Button color='primary' onClick={handleSubmit}>Add Announcement</Button> : <React.Fragment/>}
      <div>
        {announcements?.map(announcement => {
          return (
            <AnnouncementCard id={announcement.id} title={announcement.title} content={announcement.content}
             createdAt={announcement.createdAt} updatedAt={announcement.updatedAt}/>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementCard({id, title, content, createdAt, updatedAt}: Announcement) {
  const {data: school} = useQuery(['my-school'], getMySchool)
  
  return (
    <Card outline color='dark' className='announcement-card'>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{title}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{content}</CardText>
        <Row>
          <Col>
            <Button color='info' block>Edit</Button>
          </Col>
          <Col></Col>
          <Col></Col>
          <Col>
            <Button color='danger' block>Delete</Button>
          </Col>
        </Row>
      </CardBody>
      <CardFooter><small><i>Posted on {Moment(createdAt).format('MMMM D, YYYY hh:mm A')}{createdAt === updatedAt ? '' :
       `, last edited ${Moment(updatedAt).format('MMMM D, YYYY hh:mm A')}`}</i></small></CardFooter>
    </Card>
  );
}

export default Announcements;
