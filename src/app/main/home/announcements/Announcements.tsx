import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { addAnnouncement, getAnnouncements } from './AnnouncementModel';
import { getMySchool, ROLE } from '../../SchoolModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faScroll, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import AnnouncementCard from './AnnouncementCard';

function Announcements() {

  const { isLoading, isError, data: announcements, error } = useQuery(['announcements'], getAnnouncements);
  const {data: school} = useQuery(['my-school'], getMySchool)

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
      {school?.role===ROLE.ADMIN ? <AddAnnouncementModal /> : <React.Fragment/>}
      <div>
        {announcements?.map(announcement => {
          return (
            <AnnouncementCard announcementId={announcement.announcementId} title={announcement.title} content={announcement.content}
             createdAt={announcement.createdAt} updatedAt={announcement.updatedAt}/>
          );
        })}
      </div>
    </div>
  );
}

function AddAnnouncementModal() {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const addAnnouncementMutation = useMutation(addAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['add-announcement']
  });

  const handleSubmit = () => {
    addAnnouncementMutation.mutate({ title: title, content: content});
    toggle();
  }

  return (
    <React.Fragment>
      <Button color='primary' onClick={toggle}>
        Add Announcement <FontAwesomeIcon icon={faScroll as IconProp} />
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add Announcement</ModalHeader>
        <ModalBody>
          <label><span className="asterisk">*</span> = Required Field</label><br/>
          <label htmlFor="title"><b>Announcement Title</b><span className="asterisk">*</span></label>
          <Input type="text" name="title" required onChange={(event) => setTitle(event.target.value)}/>
          <label htmlFor="content"><b>Announcement Content</b><span className="asterisk">*</span></label>
          <Input type="textarea" rows="5" name="content" required onChange={(event) => setContent(event.target.value)}/>
        </ModalBody>
        <ModalFooter>
          <Button disabled={title==='' || content===''} color="primary" onClick={handleSubmit}>Add <FontAwesomeIcon icon={faBullhorn as IconProp}/></Button>
          <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default Announcements;
