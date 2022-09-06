import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardBody, CardColumns, CardFooter, CardHeader, CardText, CardTitle, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { Announcement, deleteAnnouncement, updateAnnouncement } from './AnnouncementModel';
import { getMySchool, ROLE } from '../../SchoolModel';
import Moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faBan, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

function AnnouncementCard({announcementId: id, title, content, createdAt, updatedAt}: Announcement) {
  const {data: school} = useQuery(['my-school'], getMySchool)
  
  return (
    <Card outline color='dark' className='announcement-card'>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{title}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{content}</CardText>
        {school?.role === ROLE.ADMIN ?
        <Row>
          <Col>
            <UpdateAnnouncementModal announcementId={id} title={title} content={content}/>
          </Col>
          <Col></Col>
          <Col></Col>
          <Col>
            <DeleteAnnouncementModal announcementId={id} title={title} content={content} />
          </Col>
        </Row> : <React.Fragment />}
      </CardBody>
      <CardFooter><small><i>Posted on {Moment(createdAt).format('MMMM D, YYYY hh:mm A')}{createdAt === updatedAt ? '' :
       `, last edited ${Moment(updatedAt).format('MMMM D, YYYY hh:mm A')}`}</i></small></CardFooter>

    </Card>
  );
}

function UpdateAnnouncementModal({announcementId: id, title, content}: Announcement) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [updatedTitle, setUpdatedTitle] = useState(title);
  const [updatedContent, setUpdatedContent] = useState(content);

  const updateAnnouncementMutation = useMutation(updateAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['update-announcement']
  });

  const handleSubmit = () => {
    updateAnnouncementMutation.mutate({ announcementId: id, title: updatedTitle, content: updatedContent});
    toggle();
  }

  return (
    <React.Fragment>
      <Button onClick={toggle} color="secondary" block>
        Edit <FontAwesomeIcon icon={faEdit} />
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update Announcement</ModalHeader>
        <ModalBody>
          <label><span className="asterisk">*</span> = Required Field</label><br/>
          <label htmlFor="title"><b>Announcement Title</b><span className="asterisk">*</span></label>
          <Input type="text" name="title" required defaultValue={title} onChange={(event) => setUpdatedTitle(event.target.value)}/>
          <label htmlFor="content"><b>Announcement Content</b><span className="asterisk">*</span></label>
          <Input type="textarea" rows="5" name="content" required defaultValue={content} onChange={(event) => setUpdatedContent(event.target.value)}/>
        </ModalBody>
        <ModalFooter>
          <Button disabled={updatedTitle==='' || updatedContent===''} color="primary" onClick={handleSubmit}>Update <FontAwesomeIcon icon={faEdit}/></Button>
          <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

function DeleteAnnouncementModal({announcementId: id}: Announcement) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [deleteText, setDeleteText] = useState<string>();

  const deleteAnnouncementMutation = useMutation(deleteAnnouncement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements'])
    },
    mutationKey: ['delete-announcement']
  });

  const handleSubmit = () => {
    deleteAnnouncementMutation.mutate(id);
    setDeleteText('');
    toggle();
  };

  const cancelDelete = () => {
    setDeleteText('');
    toggle();
  };

  return (
    <React.Fragment>
      <Button onClick={toggle} color="danger" block>
        Delete <FontAwesomeIcon icon={faTrash as IconProp} />
      </Button>
      <Modal isOpen={modal} toggle={cancelDelete}>
        <ModalHeader toggle={cancelDelete}>Delete Announcement</ModalHeader>
        <ModalBody>
          <label htmlFor="delete"><b>Are you sure you want to delete this announcement? You can not undo this action.</b></label>
          <Input name="delete" placeholder="Type DELETE to continue" onChange={(event) => setDeleteText(event.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={cancelDelete}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
          <Button color="danger" outline onClick={handleSubmit} disabled={deleteText!=='DELETE'}>Delete <FontAwesomeIcon icon={faTrashAlt as IconProp}/></Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default AnnouncementCard;
