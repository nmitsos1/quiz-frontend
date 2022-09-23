import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { isUndefined } from "lodash";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardText } from "reactstrap";
import { Answer, answerCurrentQuestion, getCurrentQuestion, startNextQuestion } from "./QuestionModel";

function Quiz() {

    const { isLoading, isError, data: questionAttempt, error } = useQuery(['question-attempt'], getCurrentQuestion);
    const questionNumber = questionAttempt?.questionInstance.questionIndex;
    const question = questionAttempt?.questionInstance.question;
    const answerOne = questionAttempt?.answer;
    const answerTwo = questionAttempt?.secondAnswer;
    const score = questionAttempt?.questionScore;
    
    const [selectedAnswer, setSelectedAnswer] = useState<Answer>();

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const startNextQuestionMutation = useMutation(startNextQuestion, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-attempt']);
        },
        onError: (error) => {
            let err = error as AxiosError;
            if (err.request.response.includes('No attempt is currently in progress')) {
                navigate(`/attempt/${questionAttempt?.attempt}`);
            }
        }
      });
    
    const answerCurrentQuestionMutation = useMutation(answerCurrentQuestion, {
        onSuccess: () => {
            queryClient.invalidateQueries(['question-attempt']);
        }
    });

    const handleSubmit = () => {
        if (selectedAnswer) {
            answerCurrentQuestionMutation.mutate(selectedAnswer)
            setSelectedAnswer(undefined);
        }
    }

    if (isLoading) {
        return <h4>Loading Next Question...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading your current question. {err.message} - {err.response?.statusText}</h4>
    }

    return (
        <div className="quiz-page">
            <h3>
                Question #{isUndefined(questionNumber) ? '?' : (questionNumber + 1)}
                {(score && score > 0) || (score === 0 && answerTwo) ? ` - You scored ${score} point${score === 1 ? '' : 's'}`: ''}
            </h3>
            <h4>{question?.questionText}</h4>
            {question?.answers.map(answer => {
                const isWrong = (answer.answerText === answerOne && (score===0 || answerTwo)) || (answer.answerText === answerTwo && score===0);
                const isRight = (answer.answerText === answerOne || answer.answerText === answerTwo) && score && score > 0;
                return (
                    (isWrong || isRight) ?
                    <Card className="answer-card" color={isWrong ? 'danger' : 'success'} inverse>
                        <CardBody>
                            <CardText>{answer.answerText}</CardText>
                        </CardBody>
                    </Card>
                    :
                    ((score && score > 0) || (score === 0 && answerTwo)) ?
                    <Card className="answer-card">
                        <CardBody>
                            <CardText>{answer.answerText}</CardText>
                        </CardBody>
                    </Card>
                    :
                    <Card className="answer-card" onClick={() => setSelectedAnswer(answer)} 
                    color={answer.answerId===selectedAnswer?.answerId ? 'primary' : 'secondary'} 
                    outline={answer.answerId!==selectedAnswer?.answerId} 
                    inverse={answer.answerId===selectedAnswer?.answerId}>
                        <CardBody>
                            <CardText>{answer.answerText}</CardText>
                        </CardBody>
                    </Card>
                );
            })}
            {(score && score > 0) || (score === 0 && answerTwo) ?
            <Button block outline size="lg" color='primary'
            onClick={() => startNextQuestionMutation.mutate()}>
                Continue
            </Button>
            :
            <Button block size="lg" disabled={!selectedAnswer} color='primary'
            onClick={handleSubmit}>
                Submit Answer
            </Button>
            }
        </div>
    )
}

export default Quiz