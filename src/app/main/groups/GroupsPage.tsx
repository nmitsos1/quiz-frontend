import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'reactstrap';
import Pagination, { Page } from '../Pagination';
import SamplingForm from '../practice/categories/SamplingForm';
import GroupCard from '../practice/questionGroups/GroupCard';
import { getAllGroups, Group } from '../practice/questionGroups/GroupModel';

function GroupsPage() {

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(5);
    const { isError, data: groupPage, error } = useQuery(['groups', page, count], () => getAllGroups('', page, count));
    const [pageData, setPageData] = useState<Page<Group>>();

    const [selectedId, setSelectedId] = useState<number>();

    useEffect(() => {
        if (groupPage)
            setPageData(groupPage);
    },[groupPage]);

    if (!pageData) {
        return <h4>Loading Questions...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Questions. {err.message} - {err.response?.statusText}</h4>
    }

    const groups = pageData.content;

    return (
    <Row>
        <Col>
        <div className='groups'>
          <h4>Question Groups</h4>
          <label>Select a question group</label>
          <Pagination page={pageData} setPage={setPage} setCount={setCount}/>
          <div>
            {groups.map(group => {
              return (
                <GroupCard key={group.questionGroupId} group={group} selectedIds={Array(1).fill(selectedId)} setSelectedIds={setSelectedId}
                    isSingleSelect={true} isAdminPage={true}/>
              );
            })}
          </div>
        </div>
        </Col>
        <Col>
            {selectedId ?
            <div>ayy</div>
            :
            <SamplingForm groupIds={[]} isAdminPage={true}/>
            }
        </Col>
    </Row>
      );
}

export default GroupsPage