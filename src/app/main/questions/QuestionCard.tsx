import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Collapse } from 'reactstrap';
import { getCorrectAnswerByQuestionId, getQuestionById } from './QuestionModel';
import _ from 'lodash';
import { letters } from '../Shared';

interface QuestionCardProps {
    questionId: number,
    questionCategory: string,
    questionText: string,
    isSelected: boolean,
    setSelectedId: Function
}
function QuestionCard({questionId, questionCategory, questionText, isSelected, setSelectedId}: QuestionCardProps) {
    
    const [isOpen, setIsOpen] = useState(isSelected);

    useEffect(() => {
      _.debounce(() => setIsOpen(isSelected), 125)();
    }, [isSelected])
  
    return (
      <Card outline color='dark' className='announcement-card'
      onClick={() => setSelectedId(questionId)}>
        <CardHeader>
          <CardTitle>
            <div><b>{questionCategory}</b> - {questionText}</div>
          </CardTitle>
        </CardHeader>
          <Collapse isOpen={isOpen}>
            <CardBody>
              {isSelected ? <QuestionCardBody id={questionId} /> : <React.Fragment><div>&nbsp;</div><div>&nbsp;</div></React.Fragment>}
            </CardBody>
          </Collapse>
      </Card>
    );
}

interface QuestionCardBodyProps {
  id: number
}
function QuestionCardBody({id}: QuestionCardBodyProps) {

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
      <Button outline>Edit</Button>
      <Button className='left-margin-class' outline color='danger'>Delete</Button>
    </React.Fragment>
  );
}

// interface QuestionModalProps {
//     questionId: number
// }
// function UpdateAnnouncementModal({questionId: id}: QuestionModalProps) {
//     const queryClient = useQueryClient();

//     const [modal, setModal] = useState<boolean>(false);
//     const toggle = () => setModal(!modal);

//     const [updatedTitle, setUpdatedTitle] = useState(title);
//     const [updatedContent, setUpdatedContent] = useState(content);

//     const updateAnnouncementMutation = useMutation(updateAnnouncement, {
//         onSuccess: () => {
//         queryClient.invalidateQueries(['announcements'])
//         },
//         mutationKey: ['update-announcement']
//     });

//     const handleSubmit = () => {
//         updateAnnouncementMutation.mutate({ announcementId: id, title: updatedTitle, content: updatedContent});
//         toggle();
//     }

//     return (
//         <React.Fragment>
//         <Button onClick={toggle} color="secondary" outline className='delete-button' size='sm'>
//             <FontAwesomeIcon icon={faEdit} size='sm'/>
//         </Button>
//         <Modal isOpen={modal} toggle={toggle}>
//             <ModalHeader toggle={toggle}>Update Announcement</ModalHeader>
//             <ModalBody>
//             <label><span className="asterisk">*</span> = Required Field</label><br/>
//             <label htmlFor="title"><b>Announcement Title</b><span className="asterisk">*</span></label>
//             <Input maxLength={60} type="text" name="title" required defaultValue={title} onChange={(event) => setUpdatedTitle(event.target.value)}/>
//             <label htmlFor="content"><b>Announcement Content</b><span className="asterisk">*</span></label>
//             <Input maxLength={500} type="textarea" rows="5" name="content" required defaultValue={content} onChange={(event) => setUpdatedContent(event.target.value)}/>
//             </ModalBody>
//             <ModalFooter>
//             <Button disabled={updatedTitle==='' || updatedContent===''} color="primary" onClick={handleSubmit}>Update <FontAwesomeIcon icon={faEdit}/></Button>
//             <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
//             </ModalFooter>
//         </Modal>
//         </React.Fragment>
//     );
// }

// function DeleteAnnouncementModal({announcementId: id}: Announcement) {
//     const queryClient = useQueryClient();

//     const [modal, setModal] = useState<boolean>(false);
//     const toggle = () => setModal(!modal);

//     const [deleteText, setDeleteText] = useState<string>();

//     const deleteAnnouncementMutation = useMutation(deleteAnnouncement, {
//         onSuccess: () => {
//         queryClient.invalidateQueries(['announcements'])
//         },
//         mutationKey: ['delete-announcement']
//     });

//     const handleSubmit = () => {
//         deleteAnnouncementMutation.mutate(id);
//         setDeleteText('');
//         toggle();
//     };

//     const cancelDelete = () => {
//         setDeleteText('');
//         toggle();
//     };

//     return (
//         <React.Fragment>
//         <Button size='sm' onClick={toggle} color="danger" outline>
//             <FontAwesomeIcon icon={faTrash as IconProp} size='sm'/>
//         </Button>
//         <Modal isOpen={modal} toggle={cancelDelete}>
//             <ModalHeader toggle={cancelDelete}>Delete Announcement</ModalHeader>
//             <ModalBody>
//             <label htmlFor="delete"><b>Are you sure you want to delete this announcement? You can not undo this action.</b></label>
//             <Input name="delete" placeholder="Type DELETE to continue" onChange={(event) => setDeleteText(event.target.value)} />
//             </ModalBody>
//             <ModalFooter>
//             <Button color="secondary" onClick={cancelDelete}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
//             <Button color="danger" outline onClick={handleSubmit} disabled={deleteText!=='DELETE'}>Delete <FontAwesomeIcon icon={faTrashAlt as IconProp}/></Button>
//             </ModalFooter>
//         </Modal>
//         </React.Fragment>
//     );
// }

export default QuestionCard;
