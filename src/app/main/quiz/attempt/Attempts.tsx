import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { Card, CardBody, CardFooter, CardHeader, CardText } from 'reactstrap';
import { getMySchool } from '../../schools/SchoolModel';
import { getMyAttempts } from './AttemptModel';
import Moment from 'moment';
import { useNavigate } from 'react-router-dom';

function Attempts() {
 
    const navigate = useNavigate();

    const {data: school} = useQuery(['my-school'], getMySchool);
    const { isLoading, isError, data: attempts, error } = useQuery(['attempts'], () => getMyAttempts());

    if (isLoading) {
        return <h4>Loading Your Quiz Attempt History...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading your attempts. {err.message} - {err.response?.statusText}</h4>
    }

    if (attempts.length===0) {
        return <h4>You have made no recent attempts that have been saved.</h4>
    }

    return(
        <div className='attempts-page'>
            <h3>Quiz Attempt History for {school?.schoolName}</h3>
            <label>Select a record to view more information.</label>
            {attempts.map(attempt => {
                return (<Card onClick={() => navigate(`/attempt/${attempt.attemptId}`)} color='dark' outline>
                    <CardHeader>Quiz attempt on {attempt.questionGroup.questionGroupName}</CardHeader>
                    <CardBody>
                        <CardText>Started on {Moment(attempt.groupStartTime).format('MMMM D, YYYY hh:mm A')}</CardText>
                    </CardBody>
                </Card>);
            })
            }
        </div>
    )
}

export default Attempts