import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React from "react";
import { useParams } from "react-router-dom";
import { getAttemptById } from "./AttemptModel";
import Moment from 'moment';
import { Card, CardBody, CardFooter, CardHeader, CardText, CardTitle } from "reactstrap";

function Attempt() {

    const { attemptId } = useParams();
    const { isLoading, isError, data: attempt, error } = useQuery(['attempt', attemptId], () => getAttemptById(attemptId));

    if (isLoading) {
        return <h4>Loading Your Attempt...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading the requested attempt. {err.message} - {err.response?.statusText}</h4>
    }

    return (
        <div className="attempt-page">
            <h3>Quiz attempt for {attempt.questionGroupName}</h3>
            <h5>Start Time: {Moment(attempt.groupStartTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <h5>End Time: {Moment(attempt.endTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <h5>Score: {attempt.currentScore}</h5>
            <h5>{attempt.questionInstanceAttempts.length} out of {attempt.questionGroup.questionInstances.length} questions answered</h5>
            {attempt.questionInstanceAttempts.map(q => {
                const score = q.questionScore;
                const startTime = Moment(q.questionStartTime);
                const endTime = Moment(q.questionEndTime);

                return (
                    <Card outline color={score === 10 ? 'success' : score > 4 ? undefined : score > 1 ? 'warning' : 'danger'}>
                        <CardHeader>
                            <CardTitle><b>Question #{q.questionInstance.questionIndex + 1} - {score > 0 ? `Correct for ${score} points` : 'Incorrect'}</b></CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>{q.questionInstance.question.questionText}</CardText>
                            <CardText><b>Your Answer:</b> {q.answer}</CardText>
                            {q.secondAnswer ? <CardText>Second Try: {q.secondAnswer}</CardText> : <React.Fragment />}
                        </CardBody>
                        <CardFooter>
                            <CardText><small><i>Time to answer: {Moment.duration(endTime.diff(startTime)).asSeconds()} seconds</i></small></CardText>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    )
}

export default Attempt