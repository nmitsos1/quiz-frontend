import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Button, ButtonGroup, Card, CardHeader, CardText, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { getEvents } from "../events/EventModel";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheckCircle, faFileCircleQuestion, faInfoCircle, faPersonCircleQuestion, faTrophy, faX } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Group } from "../practice/questionGroups/GroupModel";
import { deleteMyEventRequest, isMyRequestFulfilled, requestEvent } from "./EventRequestModel";
import { deleteMyQuestionRequest, getMyQuestionRequest, submitQuestionRequest } from "./QuestionRequestModel";

function Store() {

    return (
        <div>
            <h3>Store</h3>
            <RequestQuestionPackageModal />
            <hr />
            <EventList />
        </div>
    );
}

function RequestQuestionPackageModal() {
    const queryClient = useQueryClient();
  
    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [numberOfQuestions, setNumberOfQuestions] = useState<number>();
    const [isPristine, setIsPristine] = useState<boolean>(true);
    const [isClean, setIsClean] = useState<boolean>(true);
    const [description, setDescription] = useState<string>('');

    const { data: group } = useQuery(['question-request'], getMyQuestionRequest);

    const submitQuestionRequestMutation = useMutation(submitQuestionRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-request']);
        },
        mutationKey: ['request-submit']
    })

    const deleteMyQuestionRequestMutation = useMutation(deleteMyQuestionRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-request']);
        },
        mutationKey: ['delete-request']
    })

    const handleSubmit = () => {
        if (!numberOfQuestions || numberOfQuestions <= 0)
            return;
        submitQuestionRequestMutation.mutate({
            numberOfQuestions: numberOfQuestions,
            isPristine: isPristine,
            isClean: isClean,
            description: description
        });
        toggle();
    }

    return (
        <React.Fragment>
            {!group ?
            <Button color="primary" onClick={toggle}>
                Request Question Package <FontAwesomeIcon icon={faFileCircleQuestion as IconProp} />
            </Button>
            :
            <React.Fragment>
                <FontAwesomeIcon icon={faInfoCircle as IconProp} size='sm'/>{' '}
                Your request for {`${group.numberOfQuestions} question${group.numberOfQuestions > 1 ? 's' : ''}`} is being processed{' '}
                <Button color="dark" outline size='sm'>
                    Cancel Request <FontAwesomeIcon onClick={() => deleteMyQuestionRequestMutation.mutate()} icon={faX as IconProp}/>
                </Button>
            </React.Fragment>
            }
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Request Question Package</ModalHeader>
                <ModalBody>
                <label><span className="asterisk">*</span> = Required Field</label><br/>
                <label htmlFor="email"><b>Number of Questions</b><span className="asterisk">*</span></label>
                <Input maxLength={3} type="number" name="email" required onChange={(event) => setNumberOfQuestions(parseInt(event.target.value))}/>
                <label>Do you want pristine or non-pristine questions?</label><br/>
                <ButtonGroup>
                    <Button color='primary' onClick={() => setIsPristine(true)} 
                    active={isPristine} outline={!isPristine}>
                    Pristine
                    </Button>
                    <Button color='primary' onClick={() => setIsPristine(false)} 
                    active={!isPristine} outline={isPristine}>
                    Not Pristine
                    </Button>
                </ButtonGroup>
                {isPristine ? <br /> :
                <div>
                    <label>Is this for an external event or just for practice?</label><br/>
                    <ButtonGroup>
                        <Button color='primary' onClick={() => setIsClean(true)} 
                        active={isClean} outline={!isClean}>
                        External Event
                        </Button>
                        <Button color='primary' onClick={() => setIsClean(false)} 
                        active={!isClean} outline={isClean}>
                        Practice
                        </Button>
                    </ButtonGroup>
                </div>
                }
                <label htmlFor="content"><b>Additional Instructions</b><span className="asterisk">*</span></label>
                <Input maxLength={500} type="textarea" rows="4" name="content" required onChange={(event) => setDescription(event.target.value)}/>
                </ModalBody>
                <ModalFooter>
                    <Button disabled={!numberOfQuestions || numberOfQuestions <= 0} color="primary" onClick={handleSubmit}>
                        Create Request <FontAwesomeIcon icon={faPersonCircleQuestion as IconProp}/>
                    </Button>
                    <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    )
}

function EventList() {
    const { isLoading, isError, data: groups, error } = useQuery(['my-events'], getEvents);

    if (isLoading) {
        return <h4>Loading Your Events...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading your Events. {err.message} - {err.response?.statusText}</h4>
    }

    if (groups?.length === 0) {
        return <h4>No events are currently available</h4>
    }

    return (
        <div>
            <h4>Upcoming Events</h4>
            {groups.map(group => {
                return (
                    <EventCard group={group}/>
                )
            })}
        </div>
    )
}

interface EventCardProps {
    group: Group
}
function EventCard({group}: EventCardProps) {

    const queryClient = useQueryClient();

    const { data: isRequestFulfilled } = useQuery(['event-request', group.questionGroupId], () => isMyRequestFulfilled(group.questionGroupId));

    const requestEventMutation = useMutation(requestEvent, {
        onSuccess: () => {
            queryClient.invalidateQueries(['event-request', group.questionGroupId]);
        },
        mutationKey: ['request-event']
    });

    const deleteMyEventRequestMutation = useMutation(deleteMyEventRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['event-request', group.questionGroupId]);
        },
        mutationKey: ['delete-request']
    });

    return (
        <Card style={{marginRight: '120px'}}>
            <CardHeader>
                <big><b>{group.questionGroupName}</b></big>
                <div className='card-buttons'>
                    {isRequestFulfilled ?
                    <Button color="success" outline size='sm'>
                        Request Accepted <FontAwesomeIcon icon={faCheckCircle as IconProp} size='sm'/>
                    </Button>
                    :
                    isRequestFulfilled === false ?
                    <React.Fragment>
                        <FontAwesomeIcon icon={faInfoCircle as IconProp} size='sm'/> Your request is being processed{' '}
                        <Button color="dark" outline size='sm'>
                            Cancel Request <FontAwesomeIcon onClick={() => deleteMyEventRequestMutation.mutate(group.questionGroupId)} icon={faX as IconProp}/>
                        </Button>
                    </React.Fragment>
                    :
                    <Button onClick={() => requestEventMutation.mutate(group.questionGroupId)} color="primary" outline size='sm'>
                        Send Request to Join <FontAwesomeIcon icon={faTrophy as IconProp} size='sm'/>
                    </Button>
                    }
                </div>
            </CardHeader>
            <br/><br/>
            <CardText style={{margin: '15px'}}>
                <div><big><i>Event Start Date: <b>{`${Moment(group.eventStartDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></big></div>
                <div><big><i>Event End Date: <b>{`${Moment(group.eventEndDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></big></div>
            </CardText>
        </Card>
    )
}

export default Store