import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { beginAttempt, killAttempt } from '../quiz/attempt/AttemptModel';
import { startNextQuestion } from '../quiz/QuestionModel';
import { CategoryCount } from './categories/CategoryModel';
import { addSet } from './questionGroups/GroupModel';

interface CreateAndBeginQuizButtonProps {
    categoryCounts?: Array<CategoryCount>,
    groupIds?: Array<number>,
    groupId?: number
}
function CreateAndBeginQuizButton({categoryCounts, groupIds, groupId}: CreateAndBeginQuizButtonProps) {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);
  
    const addSetMutation = useMutation(addSet, {
        onSuccess: (data) => {
          queryClient.invalidateQueries(['groups']);
          beginAttemptMutation.mutate(data.questionGroupId);
        }
      });
    
      const beginAttemptMutation = useMutation(beginAttempt, {
        onSuccess: () => {
          queryClient.invalidateQueries(['attempts', 'attempt-in-progress']);
          queryClient.invalidateQueries(['attempt-in-progress']);
          startNextQuestionMutation.mutate();
        },
        onError: (error) => {
          let err = error as AxiosError;
          if (err.response?.status===400) {
            const errMessage = err.request.response.split(': ')[1].split('\\r\\n')[0];
            if (errMessage==="You can't start a new attempt while the last attempt is in progress") {
                toggle();
            }
          }
        }
      });
    
      const startNextQuestionMutation = useMutation(startNextQuestion, {
        onSuccess: () => {
          navigate(`/quiz`);
        }
      });

      const killAttemptInProgressMutation = useMutation(killAttempt, {
        onSuccess: () => {
            toggle();
            queryClient.invalidateQueries(['attempt-in-progress']);
        },
        mutationKey: ['terminate-attempt']
      })
      
    return (
        <React.Fragment>
            <Button color="primary" 
            onClick={(e) => (groupIds&&categoryCounts) ? addSetMutation.mutate({ categoryCounts: categoryCounts, groupIds: groupIds})
            : groupId ? beginAttemptMutation.mutate(groupId) : e.preventDefault()}>
                {groupIds ? 'Create Set and ' : ''}Begin Quiz
            </Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Terminate Quiz Attempt in Progress?</ModalHeader>
                <ModalBody>
                    <label htmlFor="delete"><b>Another quiz attempt is currently in progress. Would you like to terminate it?</b></label>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
                    <Button color="danger" outline onClick={() => killAttemptInProgressMutation.mutate()} >
                        Terminate Attempt <FontAwesomeIcon icon={faTrashAlt as IconProp}/>
                    </Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    )
}

export default CreateAndBeginQuizButton;