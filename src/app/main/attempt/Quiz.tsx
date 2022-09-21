import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { isUndefined } from "lodash";
import React from "react";
import { Card, CardBody, CardHeader, CardText, CardTitle } from "reactstrap";
import { getCurrentAttempt } from "./AttemptModel";
import { getCurrentQuestion } from "./Question/QuestionModel";

function Quiz() {

    const { isLoading: isAttemptLoaded, isError: isAttemptError, data: attempt, error: attemptError } = useQuery(['attempt'], getCurrentAttempt);
    const { isLoading: isQuestionLoaded, isError: isQuestionError, data: question, error: questionError } = useQuery(['question'], getCurrentQuestion);
    const isLoading = isAttemptLoaded || isQuestionLoaded;

    if (isLoading) {
        return <h4>Loading Next Question...</h4>
    }

    if (isAttemptError) {
        let err = attemptError as AxiosError
        return <h4>There was a problem loading your current question. {err.message} - {err.response?.statusText}</h4>
    }

    if (isQuestionError) {
        let err = questionError as AxiosError
        return <h4>There was a problem loading your current question. {err.message} - {err.response?.statusText}</h4>
    }

    return (
        <div className="quiz-page">
            <h4>Question #{isUndefined(attempt) ? '?' : (attempt.currentQuestionIndex + 1)}</h4>
            <Card>{question?.questionText}</Card>
            {question?.answers.map(answer => {
                return (
                    <Card>
                        <CardBody>
                            <CardText>{answer.answerText}</CardText>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    )
}

export default Quiz