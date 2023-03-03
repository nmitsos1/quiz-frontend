import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { beginAttempt, getRuleSetDescriptions, killAttempt, RuleSet } from '../quiz/attempt/AttemptModel';
import { startNextQuestion } from '../quiz/QuestionAttemptModel';
import { TopicCount } from './topics/TopicModel';
import { addGroup, addSet, GroupInput } from './questionGroups/GroupModel';
import _ from 'lodash';

interface CreateAndBeginQuizButtonProps {
    topicCounts?: Array<TopicCount>,
    groupIds?: Array<number>,
    groupId?: number,
    adminGroupRequest?: GroupInput
}
function CreateAndBeginQuizButton({topicCounts, groupIds, groupId, adminGroupRequest}: CreateAndBeginQuizButtonProps) {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);
  
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);
  
    const [isWorking, setIsWorking] = useState(false);
    const [ruleSet, setRuleSet] = useState<RuleSet>(RuleSet.OFFICIAL);
    const [allottedTime, setAllottedTime] = useState<number>();

    const addSetMutation = useMutation(addSet, {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['my-groups']);
        beginAttemptMutation.mutate({groupId: data.questionGroupId, ruleSet: ruleSet, allottedTime: allottedTime});
      }
    });
  
    const addGroupMutation = useMutation(addGroup, {
      onSuccess: () => {
        queryClient.invalidateQueries(['groups']);
        queryClient.invalidateQueries(['topics']);
      },
      mutationKey: ['create-group']
    });

    const beginAttemptMutation = useMutation(beginAttempt, {
      onSuccess: () => {
        queryClient.invalidateQueries(['attempts']);
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
    });

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setIsWorking(true);
      if (groupIds && topicCounts) {
        addSetMutation.mutate({ topicCounts: topicCounts, groupIds: groupIds});
      } else if (groupId) {
        beginAttemptMutation.mutate({groupId: groupId, ruleSet: ruleSet, allottedTime: allottedTime});
      } else {
        e.preventDefault();
      }
      const enableButton = _.debounce(() => setIsWorking(false), 3000);
      enableButton();
    }
      
    const handleAdminSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setIsWorking(true);
      if (adminGroupRequest && topicCounts) {
        adminGroupRequest.topicCounts = topicCounts;
        if (adminGroupRequest.isPackage) {
          addGroupMutation.mutate(adminGroupRequest);
        } else {
          if (adminGroupRequest.startDate && adminGroupRequest.endDate) {
            addGroupMutation.mutate(adminGroupRequest);
          }
        }
      }
      const enableButton = _.debounce(() => setIsWorking(false), 3000);
      enableButton();
    }

    return (
        <React.Fragment>
          {adminGroupRequest ? <React.Fragment/>
          :
          <React.Fragment>
            <label><b>Select a Rule Set</b></label>
            <Dropdown isOpen={isOpen} toggle={toggleDropdown}>
              <DropdownToggle color="primary" outline caret>{ruleSet}</DropdownToggle>
              <DropdownMenu>
              {Object.values(RuleSet).map((ruleset, index) => {
                return (<DropdownItem onClick={() => setRuleSet(ruleset)} key={index+1}>{ruleset}</DropdownItem>)
              })}
              </DropdownMenu>
            </Dropdown>
            <label>{getRuleSetDescriptions(ruleSet)}</label>
            {ruleSet === RuleSet.OFFICIAL ?
            <React.Fragment>
              <label><b>Enter an time limit in minutes</b></label>
              <Input type='number' onChange={(event) => setAllottedTime(parseInt(event.target.value))} />
            </React.Fragment>
            : <React.Fragment />
            }
            <hr/>          
          </React.Fragment>
          }
          {adminGroupRequest ?
            <Button color="primary" disabled={isWorking}
            onClick={handleAdminSubmit}>
                Create {adminGroupRequest.isPackage ? 'Package' : 'Official Event'}
            </Button>
            :
            <Button color="primary" disabled={isWorking || (ruleSet === RuleSet.OFFICIAL && !allottedTime)}
            onClick={handleSubmit}>
                {groupIds ? 'Create Set and ' : ''}Begin Quiz
            </Button>
          }
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