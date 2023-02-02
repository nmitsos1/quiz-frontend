import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faFileCircleExclamation, faCheckToSlot, faPersonCircleQuestion, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Card, CardHeader, CardText, Input } from "reactstrap";
import { FulfillOptions, createGroupAndFulfillRequest, fulfillRequestWithExistingGroup, deleteQuestionRequest, QuestionRequest } from "./QuestionRequestModel";
import Moment from 'moment';
import { AxiosError } from "axios";
import { getAllGroups, Group } from "../practice/questionGroups/GroupModel";
import { Page } from "../Pagination";

export interface QuestionRequestCardProps {
    request: QuestionRequest
}
function QuestionRequestCard({request}: QuestionRequestCardProps) {

    return (
        <Card style={{marginRight: '120px'}}>
            <CardHeader>
                <big><b>{request.school.schoolName} - request for {`${request.numberOfQuestions} question${request.numberOfQuestions > 1 ? 's' : ''}`}</b></big>
                <div className='card-buttons'>
                    <ResolveQuestionRequestModal request={request}/>
                </div>
            </CardHeader>
            <br/><br/>
            <CardText style={{margin: '15px'}}>
                <div><big><i>Requested on <b>{`${Moment(request.createdAt).format('MMMM D, YYYY hh:mm A')}`}</b></i></big></div>
            </CardText>
        </Card>
    )
}

function ResolveQuestionRequestModal({request}: QuestionRequestCardProps) {
    const queryClient = useQueryClient();
  
    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [fulfillOption, setFulfillOption] = useState<FulfillOptions>(FulfillOptions.NONE);

    const deleteRequestMutation = useMutation(deleteQuestionRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-requests']);
            toggle();
        },
        mutationKey: ['fulfill-request']
    })

    return (
        <React.Fragment>
            <Button onClick={toggle} color="primary" outline size='sm'>
                Resolve Request <FontAwesomeIcon icon={faFileCircleExclamation as IconProp} size='sm'/>
            </Button>{' '}
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Resolve Question Request</ModalHeader>
                {fulfillOption === FulfillOptions.NONE ? 
                <React.Fragment>
                    <ModalBody>
                        <label><b>Select one of the following options to resolve this request:</b></label>
                        <label>Create a new group based on the request and assign it to the school</label>
                        <Button onClick={() => setFulfillOption(FulfillOptions.CREATE)} color="success" outline>
                            Create and Assign <FontAwesomeIcon icon={faCheckToSlot as IconProp}/>
                        </Button><hr />
                        <label>Select an existing group to assign to the school</label>
                        <Button onClick={() => setFulfillOption(FulfillOptions.REUSE)} color="success" outline>
                            Select and Assign <FontAwesomeIcon icon={faCheckToSlot as IconProp}/>
                        </Button><hr />
                        <label>Handle the group assignment separately and fulfill the request</label>
                        <Button onClick={() => deleteRequestMutation.mutate(request.questionRequestId)} color="success" outline>
                            Fulfill Request Only <FontAwesomeIcon icon={faCheckToSlot as IconProp}/>
                        </Button>
                    </ModalBody>
                    <ModalFooter>
                        <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
                    </ModalFooter>
                </React.Fragment>
                : fulfillOption === FulfillOptions.CREATE ?
                <QuestionRequestCreateForm requestId={request.questionRequestId} setFulfillOption={setFulfillOption} toggle={toggle}/>
                : fulfillOption === FulfillOptions.REUSE ?
                <QuestionRequestReuseForm requestId={request.questionRequestId} setFulfillOption={setFulfillOption} toggle={toggle}/>
                : <React.Fragment />
            }
            </Modal>
        </React.Fragment>
    )
}

interface QuestionRequestSubFormProps {
    requestId: number,
    setFulfillOption: Function,
    toggle: Function
}
function QuestionRequestReuseForm({requestId, setFulfillOption, toggle}: QuestionRequestSubFormProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState<string>('')

    const { isLoading, isError, data: groupsPage, error } = useQuery(['groups', name], () => getAllGroups(name, 1, 5));

    const [pageData, setPageData] = useState<Page<Group>>();
    const [group, setGroup] = useState<Group>();

    const fulfillRequestWithExistingGroupMutation = useMutation(fulfillRequestWithExistingGroup, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-requests']);
            toggle();
        },
        mutationKey: ['request-fulfill']
    })

    useEffect(() => {
        if (groupsPage)
            setPageData(groupsPage);
    },[groupsPage]);

    if (!pageData) {
        return <h4>Loading Existing Groups...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Existing Groups. {err.message} - {err.response?.statusText}</h4>
    }

    const groups = pageData.content;

    if (groups.length === 0) {
        return (
            <React.Fragment>
                <ModalBody>
                    <h4>No Existing Groups to display.</h4>
                </ModalBody>
                <ModalFooter>
                    <Button outline color="secondary" onClick={() => setFulfillOption(FulfillOptions.NONE)}>Go Back <FontAwesomeIcon icon={faBan as IconProp}/></Button>
                </ModalFooter>
            </React.Fragment>
        )
        
    }

    return (
        <React.Fragment>
            <ModalBody>
                <label htmlFor="name"><b>Enter Group Name</b></label>
                <Input maxLength={60} type="text" name="name" required onChange={(event) => setName(event.target.value)}/>
                <label><b>Existing Groups</b></label><br/>
                {groups.map(group => {
                    return (
                        <div>
                            <Button onClick={() => setGroup(group)} outline color="success">{group.questionGroupName}</Button>
                        </div>
                    )
                })}
                <label htmlFor="content"><b>{group ? `Selected Group: ${group.questionGroupName}` : 'No Group Selected'}</b></label>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={!group} onClick={() => fulfillRequestWithExistingGroupMutation.mutate({questionRequestId: requestId, questionGroupId: group?.questionGroupId || 0})}>
                    Assign Selected Group <FontAwesomeIcon icon={faPersonCircleQuestion as IconProp}/>
                </Button>
                <Button outline color="secondary" onClick={() => setFulfillOption(FulfillOptions.NONE)}>Go Back <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
        </React.Fragment>
    )
}

function QuestionRequestCreateForm({requestId, setFulfillOption, toggle}: QuestionRequestSubFormProps) {
    const queryClient = useQueryClient();

    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>();

    const createGroupAndFulfillRequestMutation = useMutation(createGroupAndFulfillRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-requests']);
            toggle();
        },
        mutationKey: ['request-fulfill']
    })

    return (
        <React.Fragment>
            <ModalBody>
                <label><span className="asterisk">*</span> = Required Field</label><br/>
                <label htmlFor="title"><b>Group Name</b><span className="asterisk">*</span></label>
                <Input maxLength={60} type="text" name="title" required onChange={(event) => setName(event.target.value)}/>
                <label htmlFor="content"><b>Group Description</b><span className="asterisk">*</span></label>
                <Input maxLength={500} type="textarea" rows="5" name="content" required onChange={(event) => setDescription(event.target.value)}/>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => createGroupAndFulfillRequestMutation.mutate({questionRequestId: requestId, name: name || '', description: description || ''})}>
                    Create and Assign Group <FontAwesomeIcon icon={faPersonCircleQuestion as IconProp}/>
                </Button>
                <Button outline color="secondary" onClick={() => setFulfillOption(FulfillOptions.NONE)}>Go Back <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
        </React.Fragment>
    )
}

export default QuestionRequestCard