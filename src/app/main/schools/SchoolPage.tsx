import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faUser, faSchool, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import SchoolCard from "./SchoolCard";
import { addSchool, getSchools } from "./SchoolModel";
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
  
function SchoolPage() {
    const [name, setName] = useState('');

    return (
        <div className="schools-page">
            <h4>Schools</h4>
            <Row>
                <Input onChange={event => setName(event.target.value)}/>
                <AddSchoolModal />
            </Row>
            <Schools name={name}/>
        </div>
    )

}

interface SchoolsProps {
    name: string
}
function Schools({ name } : SchoolsProps) {

    const { isLoading, isError, data: schools, error } = useQuery(['schools', name], () => getSchools(name));

    if (isLoading) {
        return <h4>Loading Schools...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Schools. {err.message} - {err.response?.statusText}</h4>
    }

    if (schools?.length === 0) {
        return <h4>No Schools to display.</h4>
    }
    return (
        <React.Fragment>
            {
            schools.map(school => {
                return (
                    <SchoolCard schoolId={school.schoolId} schoolName={school.schoolName} email={school.email}
                    createdAt={school.createdAt} updatedAt={school.updatedAt}/>
                );
            })}
        </React.Fragment>
    )
}

function AddSchoolModal() {
    const queryClient = useQueryClient();
  
    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);
  
    const [secondModal, setSecondModal] = useState<boolean>(false);
    const secondToggle = () => setSecondModal(!secondModal);

    const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

    const [schoolName, setSchoolName] = useState('');
    const [email, setEmail] = useState('');
  
    const addSchoolMutation = useMutation(addSchool, {
      onSuccess: () => {
        queryClient.invalidateQueries(['schools']);
        setIsSuccessful(true);
      },
      onError: () => {
        setIsSuccessful(false);
      },
      mutationKey: ['add-school']
    });
  
    const handleSubmit = () => {
        admin.auth().createUserWithEmailAndPassword(email, window.crypto.randomUUID())
        .then(() => {
            admin.auth().signOut();
            addSchoolMutation.mutate({schoolName: schoolName, email: email});
        }).catch(error => {
            console.log(error.code);
            if (error.code === 'auth/email-already-in-use') {
                addSchoolMutation.mutate({schoolName: schoolName, email: email});
            } else {
                setIsSuccessful(false);
            }
        })
        toggle();
        secondToggle();
    }

  
    return (
      <React.Fragment>
        <Button color='primary' onClick={toggle}>
          Add School <FontAwesomeIcon icon={faUser as IconProp} />
        </Button>
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>Add School</ModalHeader>
          <ModalBody>
            <label><span className="asterisk">*</span> = Required Field</label><br/>
            <label htmlFor="name"><b>School Name</b><span className="asterisk">*</span></label>
            <Input type="text" name="name" required onChange={(event) => setSchoolName(event.target.value)}/>
            <label htmlFor="email"><b>Email</b><span className="asterisk">*</span></label>
            <Input type="text" name="email" required onChange={(event) => setEmail(event.target.value)}/>
          </ModalBody>
          <ModalFooter>
            <Button disabled={schoolName==='' || email===''} color="primary" onClick={handleSubmit}>Add <FontAwesomeIcon icon={faSchool as IconProp}/></Button>
            <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={secondModal} toggle={secondToggle}>
            <ModalHeader toggle={secondToggle}>{isSuccessful ? 'School Added' : 'An Error Occurred'}</ModalHeader>
            <ModalBody>
                {isSuccessful ? 'This school has been registered with the given email address and a random password. ' + 
                ' Next, the user must go to the login screen, enter this email address, and select the Reset Password link in order to set a new password.'
                : 'An error has occurred while adding the school, please refresh the page and try again. If this occurs again, please contact the developer'
                + ' at nmitsos13@gmail.com.'
                }
            </ModalBody>
            <ModalFooter>
                <Button outline color="secondary" onClick={secondToggle}>Exit <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
        </Modal>
      </React.Fragment>
    );
}
  
export default SchoolPage