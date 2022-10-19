import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBan, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { attempt, isUndefined } from "lodash";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Card, CardBody, CardText, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { Answer } from "../questions/QuestionModel";
import { letters } from "../Shared";
import { getAttemptById, getMyAttempt, getMyAttempts, killAttempt, RuleSet } from "./attempt/AttemptModel";
import { answerCurrentQuestion, getCurrentQuestion, startNextQuestion } from "./QuestionAttemptModel";
import { DefaultTimer, RelayTimer } from "./QuizTimers";

function Quiz() {

    const { isLoading, isError, data: questionAttempt, error } = useQuery(['question-attempt'], getCurrentQuestion);
    const { data: attempt } = useQuery(['attempt'], getMyAttempt);
    const questionNumber = questionAttempt?.questionInstance.questionIndex;
    const question = questionAttempt?.questionInstance.question;
    const answerOne = questionAttempt?.answer;
    const answerTwo = questionAttempt?.secondAnswer;
    const score = questionAttempt?.questionScore;
    const startTime = questionAttempt?.questionStartTime;
    const endTime = questionAttempt?.questionEndTime;
    
    const [selectedAnswer, setSelectedAnswer] = useState<Answer>();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

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

    const killAttemptInProgressMutation = useMutation(killAttempt, {
        onSuccess: () => {
            toggle();
            navigate(`/attempt/${questionAttempt?.attempt}`);
        },
        mutationKey: ['terminate-attempt']
    })

    const handleSubmit = () => {
        if (selectedAnswer) {
            answerCurrentQuestionMutation.mutate(selectedAnswer)
            setSelectedAnswer(undefined);
        }
    }

    if (isLoading || !attempt) {
        return <h4>Loading Next Question...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading your current question. {err.message} - {err.response?.statusText}</h4>
    }

    let isAnswered = !!((score && score > 0) || (score === 0 && endTime));

    return (
        <div className="quiz-page">
            <h3>
                Question #{isUndefined(questionNumber) ? '?' : (questionNumber + 1)}
                {(score && score > 0) || (score === 0 && endTime) ? ` - You scored ${score} point${score === 1 ? '' : 's'}`: ''}
                <Button className="float-right-class" color="danger" outline onClick={toggle}>Terminate Quiz</Button>
            </h3>
            <br /><br />
            <Row>
                <Col xs="10">
                <h4>{question?.questionText}</h4>
                </Col>
                <Col xs="2">
                {startTime ? 
                <div className="float-right-class">
                    {
                        attempt.ruleSet === RuleSet.DEFAULT ?
                        <DefaultTimer key={startTime.toString()} startTime={startTime} endTime={endTime} />
                        :
                        attempt.ruleSet === RuleSet.RELAY ?
                        <RelayTimer key={startTime.toString()} startTime={startTime} endTime={endTime} answerCurrentQuestionMutation={answerCurrentQuestionMutation}/>
                        : <React.Fragment />
                    }
                </div>
                : <React.Fragment />}
                </Col>
            </Row>
            <Col>
            </Col>
            <hr />
            {question?.answers.map((answer, index) => {
                const isWrong = (answer.answerText === answerOne && (score===0 || answerTwo)) || (answer.answerText === answerTwo && score===0);
                const isRight = (answer.answerText === answerOne || answer.answerText === answerTwo) && score && score > 0;
                return (
                    (isWrong || isRight) ?
                    <Card key={index} className="answer-card" color={isWrong ? 'danger' : 'success'} inverse>
                        <CardBody>
                            <CardText><h5>{letters[index]}{answer.answerText}</h5></CardText>
                        </CardBody>
                    </Card>
                    :
                    ((score && score > 0) || (score === 0 && endTime)) ?
                    <Card key={index} className="answer-card">
                        <CardBody>
                            <CardText><h5>{letters[index]}{answer.answerText}</h5></CardText>
                        </CardBody>
                    </Card>
                    :
                    <Card key={index} className="answer-card" onClick={() => setSelectedAnswer(answer)} 
                    color={answer.answerId===selectedAnswer?.answerId ? 'primary' : 'secondary'} 
                    outline={answer.answerId!==selectedAnswer?.answerId} 
                    inverse={answer.answerId===selectedAnswer?.answerId}>
                        <CardBody>
                            <CardText><h5>{letters[index]}{answer.answerText}</h5></CardText>
                        </CardBody>
                    </Card>
                );
            })}
            <hr />
            <Button block size="lg" disabled={!selectedAnswer || isAnswered} color='primary'
            onClick={handleSubmit}>
                Submit Answer
            </Button>
            {isAnswered ?
            <React.Fragment>
                <br />
                <Button block outline size="lg" color='primary'
                onClick={() => startNextQuestionMutation.mutate()}>
                    Continue
                </Button>
            </React.Fragment>
            :
            <React.Fragment />
            }
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Terminate Quiz</ModalHeader>
                <ModalBody>
                    <label htmlFor="delete"><b>Are you sure you want to end this quiz session? You can not undo this action</b></label>
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

export default Quiz