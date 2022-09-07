import React from 'react';
import { Card, CardBody, CardColumns, CardHeader, CardText, CardTitle } from 'reactstrap';
import { Group } from './GroupModel';

function GroupCard({questionGroupId: id, questionGroupName, questionGroupDescription}: Group) {
  
  return (
    <Card outline color='dark' className='group-card'>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{questionGroupName}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{questionGroupDescription}</CardText>
      </CardBody>
    </Card>
  );
}

export default GroupCard;
