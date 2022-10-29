import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, CardBody, CardHeader, CardTitle, Collapse, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getCorrectAnswerByQuestionId, getQuestionById, Question, Answer, updateQuestionById, deleteQuestionById } from './QuestionModel';
import _ from 'lodash';
import { IdProps, letters } from '../Shared';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faBan, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface QuestionCardProps {
    questionId: number,
    questionCategory: string,
    questionText: string,
    isSelected: boolean,
    setSelectedId: Function,
    groupId?: number
}
function QuestionCard({questionId, questionCategory, questionText, isSelected, setSelectedId, groupId}: QuestionCardProps) {
    
    const [isOpen, setIsOpen] = useState(isSelected);

    useEffect(() => {
      _.debounce(() => setIsOpen(isSelected), 200)();
    }, [isSelected])
  
    return (
      <Card outline color='dark' className='announcement-card'
      onClick={() => setSelectedId(questionId)}>
        <CardHeader>
          <CardTitle>
            <div><b>{questionCategory}</b> - {questionText}</div>
          </CardTitle>
        </CardHeader>
        {groupId ? <React.Fragment /> :
          <Collapse isOpen={isOpen}>
            <CardBody>
              {isSelected ? <QuestionCardBody id={questionId} /> : <React.Fragment><div>&nbsp;</div><div>&nbsp;</div></React.Fragment>}
            </CardBody>
          </Collapse>
        }
      </Card>
    );
}

function QuestionCardBody({id}: IdProps) {

  const { isLoading, isError, data: question, error } = useQuery(['question', id], () => getQuestionById(id));
  const { data: correctAnswer } = useQuery(['question-answer', id], () => getCorrectAnswerByQuestionId(id));

  if (isLoading || !correctAnswer) {
    return <h4>Loading Question Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading this question. {err.message} - {err.response?.statusText}</h4>
  }

  return (
    <React.Fragment>
      {question.answers.map((answer, index) => {
        return correctAnswer.answerId === answer.answerId ? <b><div>{letters[index]}{answer.answerText}</div></b> : <div>{letters[index]}{answer.answerText}</div>
      })}
      <br />
      <UpdateQuestionModal question={question} correctAnswer={correctAnswer}/>
      <DeleteQuestionModal id={question.questionId}/>
    </React.Fragment>
  );
}

interface QuestionModalProps {
  question: Question,
  correctAnswer: Answer
}
function UpdateQuestionModal({question, correctAnswer}: QuestionModalProps) {
    const queryClient = useQueryClient();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [updatedCategory, setUpdatedCategory] = useState(question.questionCategory);
    const [updatedText, setUpdatedText] = useState(question.questionText);

    const [answer1, setAnswer1] = useState(question.answers[0]);
    const [answer2, setAnswer2] = useState(question.answers[1]);
    const [answer3, setAnswer3] = useState(question.answers[2]);
    const [answer4, setAnswer4] = useState(question.answers[3]);
    const [newCorrectAnswer, setNewCorrectAnswer] = useState((question.answers.findIndex(ans => ans.answerId===correctAnswer.answerId)+1));

    const updateQuestionMutation = useMutation(updateQuestionById, {
        onSuccess: () => {
          queryClient.invalidateQueries(['question', question.questionId])
          queryClient.invalidateQueries(['question-answer', question.questionId])
          queryClient.invalidateQueries(['questions'])
        },
        mutationKey: ['update-question']
    });

    const handleSubmit = () => {
        const newAnswers: Array<Answer> = [
          answer1, answer2, answer3, answer4
        ]
        const answer: Answer = newCorrectAnswer===1 ? answer1 : newCorrectAnswer===2 ? answer2 : newCorrectAnswer===3 ? answer3 : newCorrectAnswer===4 ? answer4
         : {answerId:0,answerText:''};
        updateQuestionMutation.mutate({ 
          questionId: question.questionId, questionCategory: updatedCategory, questionText: updatedText,
          answers: newAnswers, correctAnswer: answer.answerText, isShuffled: true
        });
        toggle();
    }

    return (
        <React.Fragment>
          <Button onClick={toggle} color="secondary" outline className='delete-button'>
            Edit <FontAwesomeIcon icon={faEdit as IconProp}/>
          </Button>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Update Question</ModalHeader>
            <ModalBody>
              <label><span className="asterisk">*</span> = Required Field</label><br/>
              <label htmlFor="content"><b>Question</b><span className="asterisk">*</span></label>
              <Input maxLength={500} type="textarea" rows="4" name="content" required defaultValue={question.questionText} onChange={(event) => setUpdatedText(event.target.value)}/>
              <label htmlFor="category"><b>Question Category</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="category" required defaultValue={question.questionCategory} onChange={(event) => setUpdatedCategory(event.target.value)}/>
              <label htmlFor="answer1"><b>Answer 1</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer1" required defaultValue={answer1.answerText} 
                onChange={(event) => setAnswer1({answerId: answer1.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer2"><b>Answer 2</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer2" required defaultValue={answer2.answerText} 
                onChange={(event) => setAnswer2({answerId: answer2.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer3"><b>Answer 3</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer3" required defaultValue={answer3.answerText} 
                onChange={(event) => setAnswer3({answerId: answer3.answerId, answerText: event.target.value})}/>
              <label htmlFor="answer4"><b>Answer 4</b><span className="asterisk">*</span></label>
              <Input maxLength={60} type="text" name="answer4" required defaultValue={answer4.answerText} 
                onChange={(event) => setAnswer4({answerId: answer4.answerId, answerText: event.target.value})}/>
              <label htmlFor="correct"><b>Select Correct Answer</b><span className="asterisk">*</span></label>
              <ButtonGroup>
                <Button color='primary' onClick={() => setNewCorrectAnswer(1)} 
                  active={newCorrectAnswer===1} outline={newCorrectAnswer!==1}>
                  Answer 1
                </Button>
                <Button color='primary' onClick={() => setNewCorrectAnswer(2)} 
                  active={newCorrectAnswer===2} outline={newCorrectAnswer!==2}>
                  Answer 2
                </Button>
                <Button color='primary' onClick={() => setNewCorrectAnswer(3)} 
                  active={newCorrectAnswer===3} outline={newCorrectAnswer!==3}>
                  Answer 3
                </Button>
                <Button color='primary' onClick={() => setNewCorrectAnswer(4)} 
                  active={newCorrectAnswer===4} outline={newCorrectAnswer!==4}>
                  Answer 4
                </Button>
              </ButtonGroup>
            </ModalBody>
            <ModalFooter>
              <Button disabled={updatedCategory==='' || updatedText==='' || answer1.answerText==='' 
                || answer2.answerText==='' || answer3.answerText==='' || answer4.answerText==='' || newCorrectAnswer===0}
                color="primary" onClick={handleSubmit}>
                Update <FontAwesomeIcon icon={faEdit as IconProp}/>
              </Button>
              <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
    );
}

function DeleteQuestionModal({id}: IdProps) {
    const queryClient = useQueryClient();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [deleteText, setDeleteText] = useState<string>();

    const deleteQuestionMutation = useMutation(deleteQuestionById, {
        onSuccess: () => {
        queryClient.invalidateQueries(['questions'])
        },
        mutationKey: ['delete-question']
    });

    const handleSubmit = () => {
        deleteQuestionMutation.mutate(id);
        setDeleteText('');
        toggle();
    };

    const cancelDelete = () => {
        setDeleteText('');
        toggle();
    };

    return (
        <React.Fragment>
          <Button onClick={toggle} color="danger" outline className='left-margin-class'>
            Delete <FontAwesomeIcon icon={faTrash as IconProp}/>
          </Button>
          <Modal isOpen={modal} toggle={cancelDelete}>
            <ModalHeader toggle={cancelDelete}>Delete Question</ModalHeader>
            <ModalBody>
            <label htmlFor="delete"><b>Are you sure you want to delete this question? You can not undo this action.</b></label>
            <Input name="delete" placeholder="Type DELETE to continue" onChange={(event) => setDeleteText(event.target.value)} />
            </ModalBody>
            <ModalFooter>
            <Button color="secondary" onClick={cancelDelete}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
            <Button color="danger" outline onClick={handleSubmit} disabled={deleteText!=='DELETE'}>Delete <FontAwesomeIcon icon={faTrashAlt as IconProp}/></Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
    );
}

export default QuestionCard;
