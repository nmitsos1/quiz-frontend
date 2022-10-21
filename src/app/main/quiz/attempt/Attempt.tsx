import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttemptById, isLastAttemptInProgress, shouldSaveSetPromptAppear } from "./AttemptModel";
import Moment from 'moment';
import { Button, Card, CardBody, CardFooter, CardHeader, CardText, CardTitle, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBan, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UpdateSetModal } from "../../practice/questionGroups/GroupCard";
import { getMyQuestionsByAttemptId, getMyQuestionsCountByGroupId, QuestionInstanceAttempt } from "../QuestionAttemptModel";
import Pagination, { Page } from "../../Pagination";

function Attempt() {

    const navigate = useNavigate();

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
            <Button outline onClick={() => navigate('/attempts')}>Back to History</Button>
            <br /><br />
            <h3>Quiz attempt for {attempt.questionGroup.questionGroupName}</h3>
            <h5>Start Time: {Moment(attempt.groupStartTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <h5>End Time: {Moment(attempt.endTime).format('MMMM D, YYYY hh:mm:ss A')}</h5>
            <QuestionAttempts attemptId={attemptId ? parseInt(attemptId) : 0} groupId={attempt.questionGroup.questionGroupId} score={attempt.currentScore}/>
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

interface QuestionAttemptsProps {
    attemptId: number,
    groupId: number,
    score: number
}
function QuestionAttempts({attemptId, groupId, score}: QuestionAttemptsProps) {

    const { data: totalQuestionCount } = useQuery(['question-instance-count', groupId], () => getMyQuestionsCountByGroupId(groupId));
    
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { data: questionAttemptsPage, isError, error } = 
        useQuery(['question-attempts', attemptId, page, count], () => getMyQuestionsByAttemptId(attemptId, page, count));
    const [pageData, setPageData] = useState<Page<QuestionInstanceAttempt>>();

    useEffect(() => {
        if (questionAttemptsPage)
            setPageData(questionAttemptsPage);
    },[questionAttemptsPage])
    
    if (!pageData) {
        return <div>Loading your questions...</div>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading the question list. {err.message} - {err.response?.statusText}</h4>
    }


    const questionAttempts = pageData.content;

    return (
        <React.Fragment>
            <h5>Score: {score} out of {(pageData.totalElements * 10)} possible points</h5>
            {totalQuestionCount ? 
            <h5>
                {pageData.totalElements} out of {totalQuestionCount} questions attempted
            </h5>
            : <React.Fragment />}
            <hr />
            <Pagination page={pageData} setPage={setPage} setCount={setCount}/>
            {questionAttempts.map(q => {
                const score = q.questionScore;
                const startTime = Moment(q.questionStartTime);
                const endTime = Moment(q.questionEndTime);

                return (
                    <Card key={q.questionInstanceAttemptId} outline color={score === 10 ? 'success' : score > 4 ? undefined : score > 1 ? 'warning' : 'danger'}>
                        <CardHeader>
                            <CardTitle><b>
                                Question #{q.questionInstance.questionIndex + 1} - {score > 0 ? `Correct for ${score} points` : !q.questionEndTime ? 'Incomplete' :'Incorrect'}
                            </b></CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>{q.questionInstance.question.questionText}</CardText>
                            <CardText><b>Your Answer:</b> {q.answer}</CardText>
                            {q.secondAnswer ? <CardText>Second Try: {q.secondAnswer}</CardText> : <React.Fragment />}
                        </CardBody>
                        <CardFooter>
                            {q.questionEndTime ? 
                            <CardText><small><i>Time to answer: {Moment.duration(endTime.diff(startTime)).asSeconds()} seconds</i></small></CardText>
                            : <CardText><small><i>Incomplete</i></small></CardText>}
                        </CardFooter>
                    </Card>
                );
            })}
        </React.Fragment>
    );
}

export default Attempt