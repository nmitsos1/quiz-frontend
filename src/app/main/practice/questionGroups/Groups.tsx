import { AxiosError } from 'axios';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGroups } from './GroupModel';
import GroupCard from './GroupCard';

function Groups() {

  const { isLoading, isError, data: groups, error } = useQuery(['groups'], getGroups);

  if (isLoading) {
    return <h4>Loading Announcements...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading your Question Groups. {err.message} - {err.response?.statusText}</h4>
  }

  if (groups?.length === 0) {
    return <h4>You do not own any question groups</h4>
  }

  return (
    <div className='groups'>
      <h4>Your Question Groups</h4>
      <div>
        {groups?.map(group => {
          return (
            <GroupCard questionGroupId={group.questionGroupId} questionGroupName={group.questionGroupName} questionGroupDescription={group.questionGroupDescription} />
          );
        })}
      </div>
    </div>
  );
}

export default Groups;
