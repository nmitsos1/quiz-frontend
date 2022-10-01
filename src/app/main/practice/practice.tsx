import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Button, Col, Nav, NavItem, NavLink, Row } from "reactstrap";
import { AxiosError } from "axios";
import { getGroups, getMyGroupById, Group } from "./questionGroups/GroupModel";
import GroupCard from "./questionGroups/GroupCard";
import SamplingForm from "./categories/SamplingForm";
import { getCategories } from "./categories/CategoryModel";
import { beginAttempt } from "../quiz/attempt/AttemptModel";
import { useNavigate } from "react-router-dom";
import { startNextQuestion } from "../quiz/QuestionModel";

function Practice() {

  const { isLoading, isError, data: groups, error, isSuccess } = useQuery(['groups'], getGroups);

  const [isCustomTab, setIsCustomTab] = useState(false);

  if (isLoading) {
    return <h4>Loading Practice...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading your Question Groups. {err.message} - {err.response?.statusText}</h4>
  }

  if (groups?.length === 0) {
    return <h4>You do not own any question groups</h4>
  }

  return (
    <div className="practice-page">
      <h3>Practice</h3>
      <Nav tabs>
        <NavItem>
          <NavLink active={!isCustomTab} onClick={() => setIsCustomTab(false)}>Create Custom Quiz</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={isCustomTab} onClick={() => setIsCustomTab(true)}>Your Custom Quizzes</NavLink>
        </NavItem>
      </Nav>
      {!isCustomTab ?
        <CreateCustomQuiz groups={groups.filter(group => group.groupType !== 'QuestionSet')}/>
        :
        <YourCustomQuizzes groups={groups.filter(group => group.groupType === 'QuestionSet')} />
      }
      
    </div>
  )
}


interface CreateCustomQuizProps {
  groups: Array<Group>
}
function CreateCustomQuiz({groups}: CreateCustomQuizProps) {

  const [selectedIds, setSelectedIds] = useState<Array<number>>([-1]);

  useEffect(() => {
    if (groups && selectedIds.includes(-1)) {
      setSelectedIds(groups.map((group) => group.questionGroupId))
    }
  }, [groups]);

  return (
    <Row>
      <Col>
      <div className='groups'>
        <h4>Owned Question Groups</h4>
        <label>Select and deselect your groups to access questions from. All groups are selected by default.</label>
        <div>
          {groups.map(group => {
            return (
              <GroupCard group={group} selectedIds={selectedIds} setSelectedIds={setSelectedIds} isSingleSelect={false}/>
            );
          })}
        </div>
      </div>
      </Col>
      <Col>
        <SamplingForm groupIds={selectedIds}/>
      </Col>
  </Row>

  );
}

interface YourCustomQuizzesProps {
  groups: Array<Group>
}
function YourCustomQuizzes({groups}: CreateCustomQuizProps) {

  const { isLoading, isError, data: categories, error } = useQuery(['categories'], getCategories);

  const [selectedId, setSelectedId] = useState<number>();

  if (isLoading) {
    return <h4>Loading Categories...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading categories. {err.message} - {err.response?.statusText}</h4>
  }

  return (
    <Row>
      <Col>
      <div className='groups'>
        <h4>Your Custom Quizzes</h4>
        <label>Select a question set </label>
        <div>
          {groups.map(group => {
            return (
              <GroupCard group={group} selectedIds={Array(1).fill(selectedId)} setSelectedIds={setSelectedId} isSingleSelect={true}/>
            );
          })}
        </div>
      </div>
      </Col>
      <Col>
          {selectedId ?
          <CustomQuizInformation id={selectedId} categories={categories}/>
          :
          <div>Select a question set on the left to view group information and begin an attempt.</div>
          }
      </Col>
  </Row>

  );
}

interface CustomQuizInformationProps {
  id: number,
  categories: Array<string>
}
function CustomQuizInformation({id, categories}: CustomQuizInformationProps) {

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isLoading, isError, data: group, error } = useQuery(['group', id], () => getMyGroupById(id));

  const beginAttemptMutation = useMutation(beginAttempt, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['attempts']);
      startNextQuestionMutation.mutate();
    }
  });

  const startNextQuestionMutation = useMutation(startNextQuestion, {
    onSuccess: (data) => {
      navigate(`/quiz`);
    }
  });

  if (isLoading) {
    return <h4>Loading Selected Group...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading your selected group. {err.message} - {err.response?.statusText}</h4>
  }

  return (
    <div>
      <h5>{group.questionGroupName}</h5>
      {categories.map(category => {
        let categoryCount = 0;
        group.questionInstances?.map(instance => {
          if (instance.question.questionCategory===category) {
            categoryCount++;
          }
        })
        if (categoryCount===0) {
          return <React.Fragment />
        } else {
          return (
            <div>{categoryCount} {category} Question{categoryCount>1?'s':''}</div>
          );
        }
      })}
      <div><b>{group.questionInstances?.length} Total Question{group.questionInstances && group.questionInstances?.length>1 ? 's' : ''}</b></div>
      <Button color="primary" onClick={() => beginAttemptMutation.mutate(id)}>Start New Attempt</Button>
    </div>
  );
}
export default Practice