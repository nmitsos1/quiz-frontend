import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faBan, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { title } from 'process';
import React, { useState } from 'react';
import { Button, Card, CardBody, CardColumns, CardFooter, CardHeader, CardText, CardTitle, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { Announcement, deleteAnnouncement } from '../../home/announcements/AnnouncementModel';
import { deleteSet, Group, updateMySet } from './GroupModel';

interface GroupCardProps {
  group: Group,
  selectedIds: Array<number>,
  setSelectedIds: Function,
  isSingleSelect: boolean
}
function GroupCard({group, selectedIds, setSelectedIds, isSingleSelect}: GroupCardProps) {
  
  return (
    <Card key={group.questionGroupId} className='group-card'
    inverse={selectedIds.includes(group.questionGroupId) ? true : false} 
    color={`${selectedIds.includes(group.questionGroupId) ? 'primary' : 'light'}`} 
      onClick={() => {
        if (isSingleSelect) {
          setSelectedIds(group.questionGroupId);
        } else {
          let list = [...selectedIds];
          if (selectedIds.includes(group.questionGroupId))
            list.splice(list.indexOf(group.questionGroupId),1);
          else
            list.push(group.questionGroupId);
          setSelectedIds(list);
        }
      }}>
      <CardHeader>
        <CardColumns></CardColumns>
        <CardTitle><b>{group.questionGroupName}</b></CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{group.questionGroupDescription || 'No description given.'}</CardText>
        {isSingleSelect
        ?
        <Row>
          <Col>
            <UpdateSetModal group={group}/>
          </Col>
          <Col></Col>
          <Col></Col>
          <Col>
            <DeleteSetModal group={group}/>
          </Col>
        </Row>
        : <React.Fragment /> }
      </CardBody>
      <CardFooter>
        <i>{group.groupType}</i>
      </CardFooter>
    </Card>
  );
}

interface GroupModalProps {
  group: Group,
  isButtonHidden?: boolean
}
export function UpdateSetModal({group, isButtonHidden}: GroupModalProps) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(!!isButtonHidden);
  const toggle = () => setModal(!modal);

  const [updatedName, setUpdatedName] = useState(isButtonHidden ? '' : group.questionGroupName);
  const [updatedDescription, setUpdatedDescription] = useState(isButtonHidden ? '' : group.questionGroupDescription);

  const updateSetMutation = useMutation(updateMySet, {
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
    },
    mutationKey: ['update-group']
  });

  const handleSubmit = () => {
    updateSetMutation.mutate({ questionGroupId: group.questionGroupId, questionGroupName: updatedName, questionGroupDescription: updatedDescription});
    toggle();
  }

  return (
    <React.Fragment>
      {isButtonHidden ?
      <React.Fragment />
      :
      <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="secondary" block>
        Edit <FontAwesomeIcon icon={faEdit as IconProp} />
      </Button>
      }
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update Group</ModalHeader>
        <ModalBody>
          <label><span className="asterisk">*</span> = Required Field</label><br/>
          <label htmlFor="name"><b>Group Name</b><span className="asterisk">*</span></label>
          <Input type="text" name="name" required defaultValue={isButtonHidden ? '' : group.questionGroupName} onChange={(event) => setUpdatedName(event.target.value)}/>
          <label htmlFor="description"><b>Group Description</b><span className="asterisk">*</span></label>
          <Input type="textarea" rows="5" name="description" required defaultValue={isButtonHidden ? '' : group.questionGroupDescription} onChange={(event) => setUpdatedDescription(event.target.value)}/>
        </ModalBody>
        <ModalFooter>
          <Button disabled={updatedName==='' || updatedDescription===''} color="primary" onClick={handleSubmit}>Update <FontAwesomeIcon icon={faEdit as IconProp}/></Button>
          <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

function DeleteSetModal({group}: GroupModalProps) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [deleteText, setDeleteText] = useState<string>();

  const deleteSetMutation = useMutation(deleteSet, {
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
    },
    mutationKey: ['delete-group']
  });

  const handleSubmit = () => {
    deleteSetMutation.mutate(group.questionGroupId);
    setDeleteText('');
    toggle();
  };

  const cancelDelete = () => {
    setDeleteText('');
    toggle();
  };

  return (
    <React.Fragment>
      <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="danger" block>
        Delete <FontAwesomeIcon icon={faTrash as IconProp} />
      </Button>
      <Modal isOpen={modal} toggle={cancelDelete}>
        <ModalHeader toggle={cancelDelete}>Delete Group</ModalHeader>
        <ModalBody>
          <label htmlFor="delete"><b>Are you sure you want to delete this set? You can not undo this action.</b></label>
          <Input name="delete" placeholder="Type DELETE to continue" onChange={(event) => setDeleteText(event.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={cancelDelete}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
          <Button color="danger" outline onClick={handleSubmit} disabled={deleteText!=='DELETE'}>Delete <FontAwesomeIcon icon={faTrashAlt as IconProp}/></Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default GroupCard;
