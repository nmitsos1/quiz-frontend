import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, CardHeader, CardText, Nav, NavItem, NavLink } from "reactstrap";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel, faCheckToSlot } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { deleteEventRequest, EventRequest, fulfillRequest, getEventRequests } from "./EventRequestModel";
import Pagination, { Page } from "../Pagination";

function Requests() {

    const [isEventRequestTab, setIsEventRequestTab] = useState(true);

    return (
        <div>
            <h3>Requests</h3>
            <Nav tabs>
                <NavItem>
                <NavLink active={isEventRequestTab} onClick={() => setIsEventRequestTab(true)}>Event Requests</NavLink>
                </NavItem>
                <NavItem>
                <NavLink active={!isEventRequestTab} onClick={() => setIsEventRequestTab(false)}>Question Requests</NavLink>
                </NavItem>
            </Nav>
            {isEventRequestTab ?
                <EventRequests />
                :
                <div>Question Requests Pending...</div>
            }
        </div>
    );
}

function EventRequests() {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { isLoading, isError, data: eventRequestPage, error } = useQuery(['event-requests', page, count], () => getEventRequests(page, count));

    const [pageData, setPageData] = useState<Page<EventRequest>>();

    useEffect(() => {
        if (eventRequestPage)
            setPageData(eventRequestPage);
    },[eventRequestPage]);

    if (!pageData) {
        return <h4>Loading Event Requests...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Event Requests. {err.message} - {err.response?.statusText}</h4>
    }

    const eventRequests = pageData.content;

    if (eventRequests.length === 0) {
        return <h4>No Event Requests to display.</h4>
    }

    return (
        <div>
            <h4>Upcoming Events</h4>
            <Pagination page={pageData} setPage={setPage} setCount={setCount}/>
            {eventRequests.map(request => {
                return (
                    <EventRequestCard request={request}/>
                )
            })}
        </div>
    )
}

interface EventRequestCardProps {
    request: EventRequest
}
function EventRequestCard({request}: EventRequestCardProps) {

    const queryClient = useQueryClient();

    const fulfillRequestMutation = useMutation(fulfillRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['event-requests']);
        },
        mutationKey: ['accept-request']
    });

    const declineRequestMutation = useMutation(deleteEventRequest, {
        onSuccess: () => {
            queryClient.invalidateQueries(['event-requests']);
        },
        mutationKey: ['decline-request']
    });

    return (
        <Card style={{marginRight: '120px'}}>
            <CardHeader>
                <big><b>{request.school.schoolName} - request to attend {request.eventPackage.questionGroupName}</b></big>
                <div className='card-buttons'>
                    <Button onClick={() => fulfillRequestMutation.mutate(request.eventRequestId)} color="success" outline size='sm'>
                        Approve Request <FontAwesomeIcon icon={faCheckToSlot as IconProp} size='sm'/>
                    </Button>{' '}
                    <Button onClick={() => declineRequestMutation.mutate(request.eventRequestId)} color="danger" outline size='sm'>
                        Decline Request <FontAwesomeIcon icon={faCancel as IconProp} size='sm'/>
                    </Button>
                </div>
            </CardHeader>
            <br/><br/>
            <CardText style={{margin: '15px'}}>
                <div><big><i>Requested on <b>{`${Moment(request.createdAt).format('MMMM D, YYYY hh:mm A')}`}</b></i></big></div>
            </CardText>
        </Card>
    )
}

export default Requests