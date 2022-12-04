import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { TopicCount, getMyAvailableQuestionCount, getTopics, getAvailableQuestionCount } from './TopicModel'
import { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import TopicCountForm from "./TopicCountForm";
import CreateAndBeginQuizButton from "../CreateAndBeginQuizButton";
import { GroupRequest } from "../questionGroups/GroupModel";

interface SamplingFormProps {
  groupIds: Array<number>,
  adminGroupRequest?: GroupRequest
}
function SamplingForm({groupIds, adminGroupRequest}: SamplingFormProps) {

  const { isLoading, isError, data: topics, error } = useQuery(['topics'], getTopics);
  const { data: anyCount } = useQuery(
    ['topic-count', groupIds, adminGroupRequest?.state, adminGroupRequest?.isPristine, adminGroupRequest?.isClean],
      () => adminGroupRequest ? getAvailableQuestionCount('Any', adminGroupRequest?.state, adminGroupRequest?.isPristine, adminGroupRequest?.isClean) 
        : getMyAvailableQuestionCount('Any', groupIds));

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const [selectedTopic, setSelectedTopic] = useState<string>();
  const [topicCounts, setTopicCounts] = useState<Array<TopicCount>>([]);

  useEffect(() => {
    setTopicCounts([]);
  }, [groupIds]);

  let isAnyFacetInvalid = false;
  let facetCount = 0;
  if (anyCount) {
    if (topicCounts.length > 0) {
      facetCount = topicCounts.map(cc => cc.count).reduce((a,b) => a+b);
      if (facetCount > anyCount) {
        isAnyFacetInvalid = true;
      }
    }
  }

  if (isLoading) {
    return <h4>Loading Filter Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading filter topics. {err.message} - {err.response?.statusText}</h4>
  }

  const topicSelection = (topic: string) => {
    setSelectedTopic(topic);
  }

  const removeTopicCount = (index: number) => {
    let list = [...topicCounts];
    list.splice(index, 1);
    setTopicCounts(list);
  }

  return (
    <div className="sampling-form">
      <h4>Question Sample</h4>
      <label>
        Enter your filtering criteria for question topics below and click {adminGroupRequest ? 'Create Group' : 'begin'} to create a 
        randomized question {adminGroupRequest ? 'group' : 'set'}. The question limit per set is <b>250</b> questions.
      </label>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle color="primary" outline caret>{selectedTopic || 'Select a topic'}</DropdownToggle>
        <DropdownMenu>
          {!topicCounts.map(cc => cc.topic).includes('Any') ?
          <DropdownItem onClick={() => topicSelection('Any')} key={0}>{'Any'}</DropdownItem> : <React.Fragment/>}
        {topics.filter(topic => !topicCounts.map(cc => cc.topic).includes(topic)).map((topic, index) => {
          return (<DropdownItem onClick={() => topicSelection(topic)} key={index+1}>{topic}</DropdownItem>)
        })}
        </DropdownMenu>
      </Dropdown>
      {selectedTopic ?
      <TopicCountForm topic={selectedTopic} setTopic={setSelectedTopic} groupIds={groupIds} 
      topicCounts={topicCounts} setTopicCounts={setTopicCounts} adminGroupRequest={adminGroupRequest}/>
      : 
      <br />
      }
      <hr />
      {topicCounts.map((cc, index) => {
        return (<Button key={index} outline color={`${cc.topic==='Any' && isAnyFacetInvalid ? 'danger' : 'success'}`}>
          {cc.topic}{' '}<Badge>{cc.count}</Badge>{' '}
          <FontAwesomeIcon onClick={() => removeTopicCount(index)} icon={faX as IconProp}></FontAwesomeIcon>
        </Button>)
      })}
      {isAnyFacetInvalid ?
      <div>
        You have applied an 'Any' facet with a count greater than the number of questions remaining after applying your other facets. 
        Please remove this facet and reapply with a lower question count.
      </div>
      :
      (topicCounts.length > 0) ?
      topicCounts.map(cc => cc.count).reduce((a,b) => a+b) <= 250 ?
      <React.Fragment><br/><br/><CreateAndBeginQuizButton topicCounts={topicCounts} groupIds={groupIds} adminGroupRequest={adminGroupRequest}/> <label>{facetCount} Total Questions</label></React.Fragment>
      :
      <div>You are over the question limit. Your current question total is {facetCount} and the limit is 250.</div>
      :
      <div>No filters added.</div>}
    </div>
  )
}

export default SamplingForm