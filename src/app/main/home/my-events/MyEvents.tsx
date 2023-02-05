import { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, CardText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faTrophy, faStore } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Attempt, getMyEventPlacement, getMyRecentEventAttempts } from '../../quiz/attempt/AttemptModel';
import Moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';

function MyEvents() {

  const { isLoading, isError, data: eventAttempts, error } = useQuery(['my-event-attempts'], getMyRecentEventAttempts);

  if (isLoading) {
    return <h4>Loading Recent Events...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading Recent Events. {err.message} - {err.response?.statusText}</h4>
  }

  return (
      <div>
          <h4>My Recent Events</h4>
          <label>
            {eventAttempts?.length === 0 ? '' : 'Click a card to view more information. '}To sign up for events and request questions,{' '}
            <Button color="primary" outline tag={Link} to="/store">Go To The Store Page <FontAwesomeIcon icon={faStore as IconProp}/></Button>
          </label>
          {eventAttempts?.length === 0 ? <h4>No Recent Events to display.</h4>
          :
          eventAttempts?.map(attempt => {
          return (
            <MyEventAttemptCard attempt={attempt}/>
          );
        })}
      </div>
  );
}

interface MyEventAttemptCardProps {
  attempt: Attempt
}
function MyEventAttemptCard({attempt}: MyEventAttemptCardProps) {

  const navigate = useNavigate();

  const { data: eventPlacement } = useQuery(['my-event-placement', attempt.attemptId], () => getMyEventPlacement(attempt.attemptId));

  const getSuffix = (num: number) => {
    let ordinal = 'th';

    if (num%10===1 && num%100!==11)
      ordinal = 'st';
    else if (num%10===2 && num%100!==12)
      ordinal = 'nd';
    else if (num%10===3 && num%100!==13)
      ordinal = 'rd';

    return ordinal;
  }
  return (
    <Card key={attempt.attemptId} onClick={() => navigate(`/attempt/${attempt.attemptId}`)} color='dark' outline>
      <CardHeader><h5><b>{attempt.questionGroup.questionGroupName}</b></h5></CardHeader>
      <CardBody>
          <CardText>
            <h4>
              {!eventPlacement ? 
              <Badge color='dark'>Event is still in progress <FontAwesomeIcon icon={faHourglassHalf as IconProp}/></Badge>
              :
              <Badge color={eventPlacement.myPlacement < 6 ? 'success' : 'primary'}>
                {eventPlacement.myPlacement}{getSuffix(eventPlacement.myPlacement)} out of {eventPlacement.numberOfParticipants} participants
                {eventPlacement.myPlacement === 1 ? '! Congratulations! ' : ''}{eventPlacement.myPlacement === 1 ? <FontAwesomeIcon icon={faTrophy as IconProp}/> : ''}
              </Badge>
              }
            </h4>
            <label>Your Score - {attempt.currentScore} points</label>
          </CardText>
      </CardBody>
      <CardFooter><small><i>Started on {Moment(attempt.groupStartTime).format('MMMM D, YYYY hh:mm A')}
      {`, finished on ${Moment(attempt.endTime).format('MMMM D, YYYY hh:mm A')}`}</i></small></CardFooter>
    </Card>
  )
}

export default MyEvents;
