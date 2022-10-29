import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Col, Nav, NavItem, NavLink, Row } from "reactstrap";
import { AxiosError } from "axios";
import { getMyGroups, getMyGroupById, Group } from "./questionGroups/GroupModel";
import GroupCard from "./questionGroups/GroupCard";
import SamplingForm from "./categories/SamplingForm";
import { getCategoryCountsByGroupId } from "./categories/CategoryModel";
import CreateAndBeginQuizButton from "./CreateAndBeginQuizButton";
import { IdProps } from "../Shared";

function Practice() {

  const { isLoading, isError, data: groups, error } = useQuery(['my-groups'], getMyGroups);

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

interface QuizGroupProps {
  groups: Array<Group>
}
function CreateCustomQuiz({groups}: QuizGroupProps) {

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
              <GroupCard key={group.questionGroupId} group={group} selectedIds={selectedIds} setSelectedIds={setSelectedIds} isSingleSelect={false}/>
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

function YourCustomQuizzes({groups}: QuizGroupProps) {

  const [selectedId, setSelectedId] = useState<number>();

  return (
    <Row>
      <Col>
      <div className='groups'>
        <h4>Your Custom Quizzes</h4>
        <label>Select a question set </label>
        <div>
          {groups.map(group => {
            return (
              <GroupCard key={group.questionGroupId} group={group} selectedIds={Array(1).fill(selectedId)} setSelectedIds={setSelectedId} isSingleSelect={true}/>
            );
          })}
        </div>
      </div>
      </Col>
      <Col>
          {selectedId ?
          <CustomQuizInformation id={selectedId}/>
          :
          <div>Select a question set on the left to view group information and begin an attempt.</div>
          }
      </Col>
  </Row>

  );
}

function CustomQuizInformation({id}: IdProps) {

  const { data: group } = useQuery(['group', id], () => getMyGroupById(id));
  const { isLoading, isError, data: categoryCounts, error } = useQuery(['group-category-counts', id], () => getCategoryCountsByGroupId(id));

  if (!group) {
    return <h4>Loading Selected Group...</h4>
  }

  if (isLoading) {
    return <h4>Loading Group Category Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading your group category data. {err.message} - {err.response?.statusText}</h4>
  }

  const totalCount = categoryCounts.filter(cc => cc.questionCategory==='Any')[0].count;

  return (
    <div>
      <h5>{group.questionGroupName}</h5>
      {categoryCounts.map((categoryCount, index) => {
        if (categoryCount.questionCategory!=='Any')
          return (<div key={index}>{`${categoryCount.count} ${categoryCount.questionCategory} Question${categoryCount.count>1?'s':''}`}</div>)
      })}
      <div><b>{totalCount} Total Question{totalCount>1 ? 's' : ''}</b></div>
      <hr />
      <CreateAndBeginQuizButton groupId={id}/>
    </div>
  );
}
export default Practice