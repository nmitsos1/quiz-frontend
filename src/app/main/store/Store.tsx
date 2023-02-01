import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Button, Card, CardHeader, CardText } from "reactstrap";
import { getEvents } from "../events/EventModel";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faInfoCircle, faTrophy, faX } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Group } from "../practice/questionGroups/GroupModel";
import { deleteMyEventRequest, isMyRequestFulfilled, requestEvent } from "./RequestModel";

function Store() {

    return (
        <div>
            <h3>Store</h3>
            <Button color="primary">Request Question Package</Button>
            <hr />
            <EventList />
        </div>
    );
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