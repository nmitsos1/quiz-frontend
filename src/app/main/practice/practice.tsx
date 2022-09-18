import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { AxiosError } from "axios";
import { getGroups } from "./questionGroups/GroupModel";
import GroupCard from "./questionGroups/GroupCard";
import SamplingForm from "./categories/SamplingForm";

function Practice() {

  const { isLoading, isError, data: groups, error, isSuccess } = useQuery(['groups'], getGroups);
  const [selectedIds, setSelectedIds] = useState<Array<number>>([-1]);

  useEffect(() => {
    if (groups && selectedIds.includes(-1)) {
      setSelectedIds(groups.map((group) => group.questionGroupId))
    }
  }, [groups]);

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
      <Row>
        <Col>
        <div className='groups'>
          <h4>Your Question Groups</h4>
          <label>Select and deselect your groups to access questions from. All groups are selected by default.</label>
          <div>
            {groups?.map(group => {
              return (
                <GroupCard group={group} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>
              );
            })}
          </div>
        </div>
        </Col>
        <Col>
          <SamplingForm groupIds={selectedIds}/>
        </Col>
      </Row>
    </div>
  )
}

export default Practice