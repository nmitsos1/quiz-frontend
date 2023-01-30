import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Button, Card, CardHeader, CardText } from "reactstrap";
import { getEvents } from "../events/EventModel";
import Moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Group } from "../practice/questionGroups/GroupModel";

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

    return (
        <Card style={{marginRight: '120px'}}>
            <CardHeader>
                <big><b>{group.questionGroupName}</b></big>
                <div className='card-buttons'>
                    <Button onClick={(e) => {e.stopPropagation();}} color="primary" outline size='sm'>
                        Send Request to Join <FontAwesomeIcon icon={faTrophy as IconProp} size='sm'/>
                    </Button>
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