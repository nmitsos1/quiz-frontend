import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttemptById, isLastAttemptInProgress, shouldSaveSetPromptAppear } from "./AttemptModel";
import Moment from 'moment';
import { Button, Card, CardBody, CardFooter, CardHeader, CardText, CardTitle, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBan, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UpdateSetModal } from "../../practice/questionGroups/GroupCard";

function Attempt() {

    const { attemptId } = useParams();
    const { isLoading, isError, data: attempt, error } = useQuery(['attempt', attemptId], () => getAttemptById(attemptId));
    const { data: shouldSaveSetModalAppear } = useQuery(['save-set-modal', attemptId], () => shouldSaveSetPromptAppear(attemptId));
    useQuery(['attempt-in-progress'], isLastAttemptInProgress);

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [saveSet, setSaveSet] = useState(false);

    const handleSave = () => {
        toggle();
        setSaveSet(true);
    }

    useEffect(() => {
        if (shouldSaveSetModalAppear) {
            toggle();
        }
    }, [shouldSaveSetModalAppear])
  
    if (isLoading) {
        return <h4>Loading Your Attempt...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading the requested attempt. {err.message} - {err.response?.statusText}</h4>
    }

    return (
        <div className="attempt-page">
            <h3>Quiz attempt for {attempt.questionGroup.questionGroupName}</h3>
            <h5>Start Time: {Moment(attempt.groupStartTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <h5>End Time: {Moment(attempt.endTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <h5>Score: {attempt.currentScore}</h5>
            <h5>
                {(attempt.questionInstanceAttempts.length - (attempt.questionInstanceAttempts[attempt.questionInstanceAttempts.length-1].questionEndTime ? 0 : 1))}
                {' '}out of {attempt.questionGroup.questionInstances?.length} questions answered
            </h5>
            {attempt.questionInstanceAttempts.map(q => {
                const score = q.questionScore;
                const startTime = Moment(q.questionStartTime);
                const endTime = Moment(q.questionEndTime);
                if (!q.questionEndTime) {
                    return (
                        <React.Fragment />
                    );
                }

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
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Save this Quiz Set?</ModalHeader>
                <ModalBody>
                    Would you like to save this question set so that you can reuse it in the future? Unsaved sets will be deleted at 4:00 AM EST everyday, along with attempt records.
                </ModalBody>
                <ModalFooter>
                <Button color="primary" onClick={handleSave}>Yes <FontAwesomeIcon icon={faFloppyDisk as IconProp}/></Button>
                <Button outline color="secondary" onClick={toggle}>No <FontAwesomeIcon icon={faBan as IconProp}/></Button>
                </ModalFooter>
            </Modal>
            {saveSet ?
            <UpdateSetModal group={attempt.questionGroup} isButtonHidden={true}/>
            : <React.Fragment />
            }
        </div>
    )
}

export default Attempt