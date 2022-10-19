import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Input, Row } from 'reactstrap';
import Pagination, { Page } from '../Pagination';
import { getQuestions, Question } from './QuestionModel';
import QuestionCard from './QuestionCard';
import QuestionsUpload from './upload/QuestionUpload';

function QuestionsPage() {

    const [text, setText] = useState('');

    return (
        <div className='questions-page'>
            <h3>Questions</h3>
            <Row><Col xs="2">
                <QuestionsUpload />
            </Col></Row>
            <Col>
                <Row>
                <Col><div /></Col>
                    <Col>
                        <Input placeholder="Search by name..." onChange={event => setText(event.target.value)}/>
                    </Col>
                </Row>
                <Questions text={text} />
            </Col>
        </div>
    )
}

interface QuestionsProps {
    text: string
}
function Questions({text}: QuestionsProps) {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { isError, data: questionPage, error } = useQuery(['questions', text, page, count], () => getQuestions(text, page, count));
    const [pageData, setPageData] = useState<Page<Question>>();

    const [selectedId, setSelectedId] = useState<number>(-1);

    useEffect(() => {
        if (questionPage)
            setPageData(questionPage);
    },[questionPage]);

    if (!pageData) {
        return <h4>Loading Questions...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Questions. {err.message} - {err.response?.statusText}</h4>
    }

    const questions = pageData.content;

    if (questions.length === 0) {
        return <h4>No Questions to display.</h4>
    }
    return (
        <React.Fragment>
            <hr />
            <Pagination page={pageData} setPage={setPage} setCount={setCount}/>
            {
            questions.map(question => {
                return (
                    <QuestionCard questionId={question.questionId} questionCategory={question.questionCategory} questionText={question.questionText} 
                    isSelected={selectedId===question.questionId} setSelectedId={setSelectedId}/>
                );
            })}
        </React.Fragment>
    )
}

export default QuestionsPage