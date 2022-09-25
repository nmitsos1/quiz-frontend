import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardBody, CardColumns, CardFooter, CardHeader, CardText, CardTitle, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import Moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faBan, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { deleteSchool, School, updateSchool } from './SchoolModel';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBd-0G7MbAm5kFMgfSCu91OdMqwxcoGTX4",
  authDomain: "quiz-e585a.firebaseapp.com",
  projectId: "quiz-e585a",
  storageBucket: "quiz-e585a.appspot.com",
  messagingSenderId: "141725654516",
  appId: "1:141725654516:web:76aa09b1edee8afb4feda1",
  measurementId: "G-PNBVB4QD4E"
};
const admin = firebase.initializeApp(firebaseConfig, 'Admin');

function SchoolCard({schoolId: id, schoolName, email, createdAt, updatedAt}: School) {
  
  return (
    <Card outline color='dark' className='announcement-card'>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{schoolName}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{email}</CardText>
        <Row>
          <Col>
            <UpdateSchoolModal schoolId={id} schoolName={schoolName} email={email}/>
          </Col>
          <Col></Col>
          <Col></Col>
          <Col>
            <DeleteSchoolModal schoolId={id} schoolName={schoolName} email={email} />
          </Col>
        </Row>
      </CardBody>
      <CardFooter><small><i>Added on {Moment(createdAt).format('MMMM D, YYYY hh:mm A')}{createdAt === updatedAt ? '' :
       `, last edited ${Moment(updatedAt).format('MMMM D, YYYY hh:mm A')}`}</i></small></CardFooter>
    </Card>
  );
}

function UpdateSchoolModal({schoolId: id, schoolName, email}: School) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [secondModal, setSecondModal] = useState<boolean>(false);
  const secondToggle = () => setSecondModal(!secondModal);

  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

  const [updatedSchoolName, setUpdatedSchoolName] = useState(schoolName);
  const [updatedEmail, setUpdatedEmail] = useState(email);

  const updateSchoolMutation = useMutation(updateSchool, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schools'])
      setIsSuccessful(true);
    },
    onError: () => {
      setIsSuccessful(false);
    },
    mutationKey: ['update-school']
  });

  const handleSubmit = () => {
    admin.auth().createUserWithEmailAndPassword(email, window.crypto.randomUUID())
    .then(() => {
        admin.auth().signOut();
        updateSchoolMutation.mutate({ schoolId: id, schoolName: updatedSchoolName, email: updatedEmail});
      }).catch(error => {
        console.log(error.code);
        if (error.code === 'auth/email-already-in-use') {
            updateSchoolMutation.mutate({ schoolId: id, schoolName: updatedSchoolName, email: updatedEmail});
        } else {
            setIsSuccessful(false);
        }
    })
    toggle();
    secondToggle();
  }

  return (
    <React.Fragment>
      <Button onClick={toggle} color="secondary" block>
        Edit <FontAwesomeIcon icon={faEdit} />
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update School</ModalHeader>
        <ModalBody>
          <label><span className="asterisk">*</span> = Required Field</label><br/>
          <label htmlFor="name"><b>School Name</b><span className="asterisk">*</span></label>
          <Input type="text" name="name" required defaultValue={schoolName} onChange={(event) => setUpdatedSchoolName(event.target.value)}/>
          <label htmlFor="email"><b>School Email</b><span className="asterisk">*</span></label>
          <Input type="text" name="email" required defaultValue={email} onChange={(event) => setUpdatedEmail(event.target.value)}/>
        </ModalBody>
        <ModalFooter>
          <Button disabled={updatedSchoolName==='' || updatedEmail===''} color="primary" onClick={handleSubmit}>Update <FontAwesomeIcon icon={faEdit}/></Button>
          <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={secondModal} toggle={secondToggle}>
          <ModalHeader toggle={secondToggle}>{isSuccessful ? 'School Added' : 'An Error Occurred'}</ModalHeader>
          <ModalBody>
              {isSuccessful ? 'This school has been updated with the given email address and a random password. ' + 
              ' Next, the user must go to the login screen, enter this email address, and select the Reset Password link in order to set a new password.'
              : 'An error has occurred while adding the school, please refresh the page and try again. Make sure this email is not already in use. '
              + 'If this occurs again, please contact the developer at nmitsos13@gmail.com.'
              }
          </ModalBody>
          <ModalFooter>
              <Button outline color="secondary" onClick={secondToggle}>Exit <FontAwesomeIcon icon={faBan as IconProp}/></Button>
          </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

function DeleteSchoolModal({schoolId: id}: School) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [deleteText, setDeleteText] = useState<string>();

  const deleteSchoolMutation = useMutation(deleteSchool, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schools'])
    },
    mutationKey: ['delete-school']
  });

  const handleSubmit = () => {
    deleteSchoolMutation.mutate(id);
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
        <ModalHeader toggle={cancelDelete}>Delete School</ModalHeader>
        <ModalBody>
          <label htmlFor="delete"><b>Are you sure you want to delete this school? You can not undo this action.</b></label>
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

export default SchoolCard;
