import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, CardText, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getMyEvents } from './EventModel';
import Moment from 'moment';
import { Attempt, beginEvent, isAttemptOnGroupCompleted, killAttempt } from '../quiz/attempt/AttemptModel';
import { startNextQuestion } from '../quiz/QuestionAttemptModel';
import { useNavigate } from 'react-router-dom';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group } from '../practice/questionGroups/GroupModel';

function Events() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const beginEventMutation = useMutation(beginEvent, {
        onSuccess: () => {
          queryClient.invalidateQueries(['attempts']);
          queryClient.invalidateQueries(['attempt-in-progress']);
          startNextQuestionMutation.mutate();
        },
        onError: (error) => {
          let err = error as AxiosError;
          if (err.response?.status===400) {
            const errMessage = err.request.response.split(': ')[1].split('\\r\\n')[0];
            if (errMessage==="You can't start a new attempt while the last attempt is in progress") {
                toggle();
            }
          }
        }
      });
    
      const startNextQuestionMutation = useMutation(startNextQuestion, {
        onSuccess: () => {
          navigate(`/quiz`);
        }
      });
  
      const killAttemptInProgressMutation = useMutation(killAttempt, {
        onSuccess: () => {
            toggle();
            queryClient.invalidateQueries(['attempt-in-progress']);
        },
        mutationKey: ['terminate-attempt']
      });
    
    const { isLoading, isError, data: groups, error } = useQuery(['my-events'], getMyEvents);

    if (isLoading) {
        return <h4>Loading Your Events...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading your Events. {err.message} - {err.response?.statusText}</h4>
    }

    if (groups?.length === 0) {
        return <h4>You are not signed up for any events</h4>
    }

    const nextEvent = groups[0];
    
    return (
        <div>
            <h3>Your Events</h3>
            <NextEvent nextEvent={nextEvent} beginEventMutation={beginEventMutation} />
            <hr/>
            <h4>Upcoming</h4>
            {groups.length > 1 ?
            groups.map((group, index) => {
                if (index === 0)
                    return <React.Fragment />;
                return (
                    <Card className='request-card'>
                        <CardHeader><h5><b>{group.questionGroupName}</b></h5></CardHeader>
                        <br/><br/>
                        <CardText>
                            <div className='request-text'>
                                <h5><i>Event Start Date: <b>{`${Moment(group.eventStartDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></h5>
                                <h5><i>Event End Date: <b>{`${Moment(group.eventEndDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></h5>
                                <h5>{group.questionGroupDescription}</h5>
                            </div>
                        </CardText>
                    </Card>
                )
            })
        : <h5>No other events to display</h5>}
        <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Terminate Quiz Attempt in Progress?</ModalHeader>
            <ModalBody>
                <label htmlFor="delete"><b>Another quiz attempt is currently in progress. Would you like to terminate it?</b></label>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
                <Button color="danger" outline onClick={() => killAttemptInProgressMutation.mutate()} >
                    Terminate Attempt <FontAwesomeIcon icon={faTrashAlt as IconProp}/>
                </Button>
            </ModalFooter>
        </Modal>
        </div>
    )
}

interface NextEventProps {
    nextEvent: Group,
    beginEventMutation: UseMutationResult<Attempt, unknown, number, unknown>
}
function NextEvent({nextEvent, beginEventMutation}: NextEventProps) {

    const {data: attemptCompleted} = useQuery(['attempt-completed', nextEvent.questionGroupId], () => isAttemptOnGroupCompleted(nextEvent.questionGroupId));

    const navigate = useNavigate();

    const current = new Date();
    const inProgress = (nextEvent.eventStartDate && nextEvent.eventEndDate) ?
     (current >= Moment(nextEvent.eventStartDate).toDate() && current < Moment(nextEvent.eventEndDate).toDate()) : false;

    return (
        <Card>
        <CardHeader><h4>{inProgress ? 'Event now in progress: ' : 'Your next upcoming event: '} <b>{nextEvent.questionGroupName}</b></h4></CardHeader>
        <CardBody>
            <CardText>
                {inProgress ? 
                attemptCompleted ?
                <h4><i>You have completed this event</i></h4>
                :
                attemptCompleted === false ?
                <React.Fragment>
                    <Button block color='primary' outline onClick={() => navigate(`/quiz`)}><h3>Click here to Continue Event</h3></Button>
                    <br/>
                </React.Fragment>
                :
                <React.Fragment>
                    <Button block color='primary' outline onClick={() => beginEventMutation.mutate(nextEvent.questionGroupId)}><h3>Click here to Begin Event</h3></Button>
                    <br/>
                </React.Fragment>
                : <br />}
                <Alert color={inProgress ? 'success' : 'info'}>
                    <h4><i>Event Start Date: <b>{`${Moment(nextEvent.eventStartDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></h4>
                    <h4><i>Event End Date: <b>{`${Moment(nextEvent.eventEndDate).format('MMMM D, YYYY hh:mm A')}`}</b></i></h4>
                </Alert>
                <Alert color='secondary'>
                    <h5>{nextEvent.questionGroupDescription}</h5>
                </Alert>
            </CardText>
        </CardBody>
    </Card>

    )
}

export default Events