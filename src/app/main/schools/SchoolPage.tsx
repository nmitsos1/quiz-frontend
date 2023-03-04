import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faUser, faSchool, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Collapse, Dropdown, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import SchoolCard from "./SchoolCard";
import { addSchool, getSchools, School } from "./SchoolModel";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import EditGroups from "./EditGroups";
import Pagination, { Page } from "../Pagination";
import { StateDropdown } from "../Shared";

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
    const [state, setState] = useState('All');
    const [selectedIds, setSelectedIds] = useState<Array<number>>([]);

    return (
        <div className="schools-page">
            <h3>Schools</h3>
            <Row>
                <Col>
                    <Row>
                        <Col xs="6">
                            <AddSchoolModal />
                        </Col>
                        <Col xs="2">
                            <StateDropdown selectedState={state} setSelectedState={setState} includesAll/>
                        </Col>
                        <Col>
                            <Input placeholder="Search by name..." onChange={event => setName(event.target.value)}/>
                        </Col>
                    </Row>
                    <Schools name={name} state={state} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>
                </Col>
                <Col>
                    <EditGroups selectedIds={selectedIds} />
                </Col>
            </Row>
        </div>
    )

}

interface SchoolsProps {
    name: string,
    state: string,
    selectedIds: Array<number>,
    setSelectedIds: Function
}
function Schools({ name, state, selectedIds, setSelectedIds } : SchoolsProps) {

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { isError, data: schoolPage, error } = useQuery(['schools', name, state, page, count], () => getSchools(name, state, page, count));
    const [pageData, setPageData] = useState<Page<School>>();

    useEffect(() => {
        if (schoolPage)
            setPageData(schoolPage);
    },[schoolPage]);

    if (!pageData) {
        return <h4>Loading Schools...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Schools. {err.message} - {err.response?.statusText}</h4>
    }

    const schools = pageData.content;

    if (schools.length === 0) {
        return <h4>No Schools to display.</h4>
    }
    return (
        <React.Fragment>
            <hr />
            {selectedIds.length > 0 ?
                <Button outline color="secondary" onClick={() => setSelectedIds([])} className="float-right-class">Deselect All</Button>
            : <React.Fragment />}
            <Pagination page={pageData} setPage={setPage} setCount={setCount}/>
            {
            schools.map(school => {
                return (
                    <SchoolCard key={school.schoolId} school={school} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>
                );
            })}
        </React.Fragment>
    )
}

function AddSchoolModal() {
    const queryClient = useQueryClient();
  
    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);
  
    const [isOpen, setIsOpen] = useState(false);
    const toggleInfo = () => setIsOpen(!isOpen);

    const [secondModal, setSecondModal] = useState<boolean>(false);
    const secondToggle = () => setSecondModal(!secondModal);
    const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

    const [email, setEmail] = useState('');

    const [schoolName, setSchoolName] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [zip, setZip] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        setSchoolName('');
        setAddress1('');
        setAddress2('');
        setCity('');
        setSelectedState('');
        setZip('');
        setPhone('');
    }, [isOpen, modal]);

    const addSchoolMutation = useMutation(addSchool, {
      onSuccess: () => {
        queryClient.invalidateQueries(['schools']);
        setIsSuccessful(true);
      },
      onError: () => {
        setIsSuccessful(false);
      },
      mutationKey: ['added a school']
    });
  
    const handleSubmit = () => {
        const school: School = {
            email: email,
            schoolName: schoolName,
            address1: address1,
            address2: address2,
            city: city,
            state: selectedState,
            zip: zip,
            phone: phone
        }
        admin.auth().createUserWithEmailAndPassword(email, window.crypto.randomUUID())
        .then(() => {
            admin.auth().signOut();
            addSchoolMutation.mutate(school);
        }).catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                addSchoolMutation.mutate(school);
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
            <label htmlFor="email"><b>Email</b><span className="asterisk">*</span></label>
            <Input maxLength={60} type="text" name="email" required onChange={(event) => setEmail(event.target.value)}/>
            <br />
            <Button color="dark" outline onClick={toggleInfo} active={isOpen}>{isOpen ? 'Clear and close below ' : 'Enter all '}school information</Button>
            {isOpen ? <React.Fragment />
            : <div>If you do not enter all school information, the school will be prompted to enter this when they sign in with the email above.</div>}
            <Collapse isOpen={isOpen}>
                <hr/>
                <label htmlFor="name"><b>School Name</b></label>
                <Input maxLength={60} type="text" name="name" required value={schoolName} onChange={(event) => setSchoolName(event.target.value)}/>
                <label htmlFor="address1"><b>Address Line 1</b></label>
                <Input maxLength={60} type="text" name="address1" required value={address1} onChange={(event) => setAddress1(event.target.value)}/>
                <label htmlFor="address2"><b>Address Line 2</b></label>
                <Input maxLength={60} type="text" name="address2" required value={address2} onChange={(event) => setAddress2(event.target.value)}/>
                <label htmlFor="city"><b>City</b></label>
                <Input maxLength={60} type="text" name="city" required value={city} onChange={(event) => setCity(event.target.value)}/>
                <Row>
                    <Col>
                        <label htmlFor="state"><b>State</b></label>
                        <StateDropdown selectedState={selectedState} setSelectedState={setSelectedState}/>
                    </Col>
                    <Col>
                        <label htmlFor="zip"><b>ZIP Code</b></label>
                        <Input maxLength={12} type="text" name="zip" required value={zip} onChange={(event) => setZip(event.target.value)}/>
                    </Col>
                </Row>
                <label htmlFor="phone"><b>Phone Number</b></label>
                <Input maxLength={15} type="text" name="phone" required value={phone} onChange={(event) => setPhone(event.target.value)}/>
            </Collapse>
          </ModalBody>
          <ModalFooter>
            <Button disabled={email===''} color="primary" onClick={handleSubmit}>Add <FontAwesomeIcon icon={faSchool as IconProp}/></Button>
            <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={secondModal} toggle={secondToggle}>
            <ModalHeader toggle={secondToggle}>{isSuccessful ? 'School Added' : 'An Error Occurred'}</ModalHeader>
            <ModalBody>
                {isSuccessful ? 'This school has been registered with the given email address and a random password. ' + 
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
  
export default SchoolPage