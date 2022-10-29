import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import Pagination, { Page } from '../Pagination';
import { addQuestion, Answer, getQuestions, Question } from './QuestionModel';
import QuestionCard from './QuestionCard';
import QuestionsUpload from './upload/QuestionUpload';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { getCategories } from '../practice/categories/CategoryModel';

function QuestionsPage() {

    const { isLoading, isError, data: categories, error } = useQuery(['categories'], getCategories);

    const [selectedCategory, setSelectedCategory] = useState<string>();
    const [text, setText] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
  
    if (isLoading) {
      return <h4>Loading Filter Data...</h4>
    }
  
    if (isError) {
      let err = error as AxiosError
      return <h4>There was a problem loading filter categories. {err.message} - {err.response?.statusText}</h4>
    }
  
    return (
        <div className='questions-page'>
            <h3>Questions</h3>
            <Col>
                <Row>
                <Col xs="6"><AddQuestionModal /><QuestionsUpload /></Col>
                <Col xs="2">
                  <Dropdown isOpen={isOpen} toggle={toggle}>
                    <DropdownToggle color="primary" outline caret>{selectedCategory || 'Filter by category'}</DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem></DropdownItem>
                      <DropdownItem onClick={() => setSelectedCategory('Any')} key={0}>{'Any'}</DropdownItem>
                      {categories.map((category, index) => {
                        return (<DropdownItem onClick={() => setSelectedCategory(category)} key={index+1}>{category}</DropdownItem>)
                      })}
                    </DropdownMenu>
                  </Dropdown>
                </Col>
                    <Col>
                      <Input placeholder="Search by name..." onChange={event => setText(event.target.value)}/>
                    </Col>
                </Row>
                <Questions text={text} category={selectedCategory?.toLocaleUpperCase() || 'ANY'}/>
            </Col>
        </div>
    )
}

function AddQuestionModal() {
    const queryClient = useQueryClient();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [category, setCategory] = useState('');
    const [text, setText] = useState('');

    const [answer1, setAnswer1] = useState<Answer>({answerId: -1, answerText: ''});
    const [answer2, setAnswer2] = useState<Answer>({answerId: -2, answerText: ''});
    const [answer3, setAnswer3] = useState<Answer>({answerId: -3, answerText: ''});
    const [answer4, setAnswer4] = useState<Answer>({answerId: -4, answerText: ''});
    const [correctAnswer, setCorrectAnswer] = useState(0);

    const addQuestionMutation = useMutation(addQuestion, {
        onSuccess: () => {
          queryClient.invalidateQueries(['question'])
          queryClient.invalidateQueries(['question-answer'])
          queryClient.invalidateQueries(['questions'])
        },
        mutationKey: ['add-question']
    });

    const handleSubmit = () => {
        const answers: Array<Answer> = [
          answer1, answer2, answer3, answer4
        ]
        const answer: Answer = correctAnswer===1 ? answer1 : correctAnswer===2 ? answer2 : correctAnswer===3 ? answer3 : correctAnswer===4 ? answer4
         : {answerId:0,answerText:''};
        addQuestionMutation.mutate({ 
          questionId: 0, questionCategory: category, questionText: text,
          answers: answers, correctAnswer: answer.answerText, isShuffled: true
        });
        toggle();
    }

    return (
        <React.Fragment>
          <Button onClick={toggle} color="primary">
            Add Question <FontAwesomeIcon icon={faCircleQuestion as IconProp}/>
          </Button>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Update Question</ModalHeader>
            <ModalBody>
              <label><span className="asterisk">*</span> = Required Field</label><br/>
              <label htmlFor="content"><b>Question</b><span className="asterisk">*</span></label>
              <Input maxLength={500} type="textarea" rows="4" name="content" required onChange={(event) => setText(event.target.value)}/>
              <label htmlFor="category"><b>Question Category</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="category" required onChange={(event) => setCategory(event.target.value)}/>
              <label htmlFor="answer1"><b>Answer 1</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer1" required 
                onChange={(event) => setAnswer1({answerId: answer1.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer2"><b>Answer 2</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer2" required 
                onChange={(event) => setAnswer2({answerId: answer2.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer3"><b>Answer 3</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer3" required 
                onChange={(event) => setAnswer3({answerId: answer3.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer4"><b>Answer 4</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer4" required 
                onChange={(event) => setAnswer4({answerId: answer4.answerId, answerText: event.target.value})}/>
              <label htmlFor="correct"><b>Select Correct Answer</b><span className="asterisk">*</span></label>
              <ButtonGroup>
                <Button color='primary' onClick={() => setCorrectAnswer(1)} 
                  active={correctAnswer===1} outline={correctAnswer!==1}>
                  Answer 1
                </Button>
                <Button color='primary' onClick={() => setCorrectAnswer(2)} 
                  active={correctAnswer===2} outline={correctAnswer!==2}>
                  Answer 2
                </Button>
                <Button color='primary' onClick={() => setCorrectAnswer(3)} 
                  active={correctAnswer===3} outline={correctAnswer!==3}>
                  Answer 3
                </Button>
                <Button color='primary' onClick={() => setCorrectAnswer(4)} 
                  active={correctAnswer===4} outline={correctAnswer!==4}>
                  Answer 4
                </Button>
              </ButtonGroup>
            </ModalBody>
            <ModalFooter>
              <Button disabled={category==='' || text==='' || answer1.answerText==='' 
                || answer2.answerText==='' || answer3.answerText==='' || answer4.answerText==='' || correctAnswer===0}
                color="primary" onClick={handleSubmit}>
                Add <FontAwesomeIcon icon={faQuestionCircle as IconProp}/>
              </Button>
              <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
    );
}


interface QuestionsProps {
    text: string,
    category: string
}
function Questions({text, category}: QuestionsProps) {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { isError, data: questionPage, error } = useQuery(['questions', text, category, page, count], () => getQuestions(text, category, page, count));
    const [pageData, setPageData] = useState<Page<Question>>();

    const [selectedId, setSelectedId] = useState<number>(-1);

    useEffect(() => {
      setPage(1);
    }, [text, category]);

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