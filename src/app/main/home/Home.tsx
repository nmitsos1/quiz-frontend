import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faEdit, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { getMySchool, School, updateMySchool } from "../schools/SchoolModel";
import { StateDropdown } from "../Shared";
import Announcements from "./announcements/Announcements";
import MyEvents from "./my-events/MyEvents";

function Home() {

    const {data: school} = useQuery(['my-school'], getMySchool)

    return (
        <div className="home-page">
            <Row>
                <Col>
                    <Announcements />
                </Col>
                <Col>
                    <MyEvents />
                </Col>
            </Row>
            {school ? <UpdateMySchoolInfoPrompt school={school} /> : <React.Fragment />}
        </div>
    )
}

interface UpdateMySchoolInfoPromptProps {
    school: School
}
function UpdateMySchoolInfoPrompt({school}: UpdateMySchoolInfoPromptProps) {

    const queryClient = useQueryClient();

    const needToUpdate = !school.schoolName || !school.address1 || !school.city || !school.state || !school.zip || !school.phone; 
    const [modal, setModal] = useState<boolean>(needToUpdate);
    const toggle = () => setModal(!modal);

    const [updatedSchoolName, setUpdatedSchoolName] = useState(school.schoolName);
    const [updatedAddress1, setAddress1] = useState(school.address1 || '');
    const [updatedAddress2, setAddress2] = useState(school.address2 || '');
    const [updatedCity, setCity] = useState(school.city || '');
    const [updatedSelectedState, setSelectedState] = useState(school.state || '');
    const [updatedZip, setZip] = useState(school.zip || '');
    const [updatedPhone, setPhone] = useState(school.phone || '');  
      
    const updateSchoolMutation = useMutation(updateMySchool, {
        onSuccess: () => {
          queryClient.invalidateQueries(['schools'])
        },
        mutationKey: ['updated a school']
      });
    
    const handleSubmit = () => {
        const updatedSchool: School = {
          schoolId: school.schoolId,
          email: '',
          schoolName: updatedSchoolName,
          address1: updatedAddress1,
          address2: updatedAddress2,
          city: updatedCity,
          state: updatedSelectedState,
          zip: updatedZip,
          phone: updatedPhone
      }
      updateSchoolMutation.mutate(updatedSchool);
      toggle();
    }
    
    return (
        <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Update Your School Information</ModalHeader>
            <ModalBody>
            <label>We are missing information about your school. Please fill out the fields below where applicable.</label>
            <label><span className="asterisk">*</span> = Required Field</label><br/>
            <label htmlFor="name"><b>School Name</b><span className="asterisk">*</span></label>
            <Input maxLength={60} type="text" name="name" required defaultValue={school.schoolName} onChange={(event) => setUpdatedSchoolName(event.target.value)}/>
            <label htmlFor="address1"><b>Address Line 1</b><span className="asterisk">*</span></label>
            <Input maxLength={60} type="text" name="address1" required defaultValue={school.address1} onChange={(event) => setAddress1(event.target.value)}/>
            <label htmlFor="address2"><b>Address Line 2</b></label>
            <Input maxLength={60} type="text" name="address2" required defaultValue={school.address2} onChange={(event) => setAddress2(event.target.value)}/>
            <label htmlFor="city"><b>City</b><span className="asterisk">*</span></label>
            <Input maxLength={60} type="text" name="city" required defaultValue={school.city} onChange={(event) => setCity(event.target.value)}/>
            <Row>
                <Col>
                    <label htmlFor="state"><b>State</b><span className="asterisk">*</span></label>
                    <StateDropdown selectedState={updatedSelectedState} setSelectedState={setSelectedState}/>
                </Col>
                <Col>
                    <label htmlFor="zip"><b>ZIP Code</b><span className="asterisk">*</span></label>
                    <Input maxLength={12} type="text" name="zip" required defaultValue={school.zip} onChange={(event) => setZip(event.target.value)}/>
                </Col>
            </Row>
            <label htmlFor="phone"><b>Phone Number</b><span className="asterisk">*</span></label>
            <Input maxLength={15} type="text" name="phone" required defaultValue={school.phone} onChange={(event) => setPhone(event.target.value)}/>
            </ModalBody>
            <ModalFooter>
            <Button disabled={updatedSchoolName==='' || updatedAddress1==='' || updatedCity==='' || updatedSelectedState==='' || updatedZip==='' || updatedPhone===''}
             color="primary" onClick={handleSubmit}>Update <FontAwesomeIcon icon={faEdit as IconProp}/></Button>
            <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
        </Modal>
    );

}

export default Home