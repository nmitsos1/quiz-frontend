import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button, Input } from "reactstrap";
import { TopicCount, getAvailableQuestionCount, getMyAvailableQuestionCount } from './TopicModel'
import { AxiosError } from "axios";
import { GroupRequest } from "../questionGroups/GroupModel";

interface TopicCountFormProps {
  topic: string,
  setTopic: Function,
  groupIds: Array<number>,
  topicCounts: Array<TopicCount>,
  setTopicCounts: Function,
  adminGroupRequest?: GroupRequest
}
function TopicCountForm({topic, setTopic, groupIds, topicCounts, setTopicCounts, adminGroupRequest}: TopicCountFormProps) {

  const { isLoading, isError, data: availableCount, error } = 
    useQuery(['topic-count', topic, groupIds, adminGroupRequest?.state, adminGroupRequest?.isPristine, adminGroupRequest?.isClean], () => adminGroupRequest ? 
      getAvailableQuestionCount(topic, adminGroupRequest?.state, adminGroupRequest?.isPristine, adminGroupRequest?.isClean)
        : getMyAvailableQuestionCount(topic, groupIds));
  const [count, setCount] = useState<number>(0);

  if (isLoading) {
    return <h4>Loading Count Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading count data. {err.message} - {err.response?.statusText}</h4>
  }

  if (availableCount === 0) {
    return <h4>You do not own any questions from this topic</h4>
  }

  const addTopicCount = () => {
    const topicCount: TopicCount = {
      topic: topic,
      count: count
    }
    let list = [...topicCounts];
    list.push(topicCount);
    setTopicCounts(list);
    setTopic(undefined);
  }
  
  return (
    <React.Fragment>
      <label>How many questions? There are {topic==='Any' ? (availableCount - topicCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount}
      {' '}{topic==='Any' ? '' : topic} questions available in this topic</label>

      <Input type="number" value={count} onChange={(event) => setCount(parseInt(event.target.value))}/>
      <br />
      <Button disabled={!count || (count <= 0 || count > (topic==='Any' ? (availableCount - topicCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount))}
      onClick={addTopicCount} color='dark'>Add Filter</Button>
    </React.Fragment>
  )
}

export default TopicCountForm