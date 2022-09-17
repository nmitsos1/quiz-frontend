import React from 'react';
import { Card, CardBody, CardColumns, CardFooter, CardHeader, CardText, CardTitle } from 'reactstrap';
import { Group } from './GroupModel';

interface GroupCardProps {
  group: Group,
  selectedIds: Array<number>,
  setSelectedIds: Function
}
function GroupCard({group, selectedIds, setSelectedIds}: GroupCardProps) {
  
  return (
    <Card key={group.questionGroupId} className='group-card'
    inverse={selectedIds.includes(group.questionGroupId) ? true : false} 
    color={`${selectedIds.includes(group.questionGroupId) ? 'primary' : 'light'}`} 
      onClick={() => {
        let list = [...selectedIds];
        if (selectedIds.includes(group.questionGroupId))
          list.splice(list.indexOf(group.questionGroupId),1);
        else
          list.push(group.questionGroupId);
        setSelectedIds(list);
      }}>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{group.questionGroupName}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{group.questionGroupDescription || 'No description given.'}</CardText>
      </CardBody>
      <CardFooter>
        <i>{group.groupType}</i>
      </CardFooter>
    </Card>
);
}

export default GroupCard;
