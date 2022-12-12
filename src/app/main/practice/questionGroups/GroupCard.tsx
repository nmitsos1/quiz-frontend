import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faBan, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardText, CardTitle, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import DownloadPdfModal from './DownloadPdfModal';
import { deleteGroup, deleteMySet, Group, updateGroup, updateMySet } from './GroupModel';

interface GroupCardProps {
  group: Group,
  selectedIds: Array<number>,
  setSelectedIds: Function,
  isSingleSelect: boolean,
  isAdminPage?: boolean
}
function GroupCard({group, selectedIds, setSelectedIds, isSingleSelect, isAdminPage}: GroupCardProps) {
  
  return (
    <Card key={group.questionGroupId} className={`group-card ${selectedIds.includes(group.questionGroupId) ? 'selected-card': ''}`}
    color={`${selectedIds.includes(group.questionGroupId) ? 'info' : 'dark'}`} outline
      onClick={() => {
        if (isSingleSelect) {
          if (selectedIds[0] === group.questionGroupId)
            setSelectedIds(undefined);
          else
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
        <CardTitle>
          <b>{group.questionGroupName}</b>
          {isSingleSelect
          ?
          <div className='card-buttons'>
            <DownloadPdfModal group={group} isAdminPage={isAdminPage} />{' '}
            <UpdateSetModal group={group} isAdminPage={isAdminPage}/>{' '}
            <DeleteSetModal group={group} setSelectedIds={setSelectedIds} isAdminPage={isAdminPage}/>
          </div>
          : 
          <div className='card-buttons'>
            <DownloadPdfModal group={group} isAdminPage={isAdminPage} />
          </div>}

        </CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>{group.questionGroupDescription || 'No description given.'}</CardText>
      </CardBody>
    </Card>
  );
}

export interface GroupModalProps {
  group: Group,
  isButtonHidden?: boolean,
  setSelectedIds?: Function,
  isAdminPage?: boolean
}
export function UpdateSetModal({group, isButtonHidden, isAdminPage}: GroupModalProps) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(!!isButtonHidden);
  const toggle = () => setModal(!modal);

  const [updatedName, setUpdatedName] = useState(isButtonHidden ? '' : group.questionGroupName);
  const [updatedDescription, setUpdatedDescription] = useState(isButtonHidden ? '' : group.questionGroupDescription);

  const updateSetMutation = useMutation(isAdminPage ? updateGroup : updateMySet, {
    onSuccess: () => {
      queryClient.invalidateQueries(['my-groups'])
      queryClient.invalidateQueries(['groups'])
      queryClient.invalidateQueries(['attempt'])
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
      <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="secondary" outline size='sm'>
        <FontAwesomeIcon icon={faEdit as IconProp} size='sm'/>
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

function DeleteSetModal({group, setSelectedIds, isAdminPage}: GroupModalProps) {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [deleteText, setDeleteText] = useState<string>();

  const deleteSetMutation = useMutation(isAdminPage ? deleteGroup : deleteMySet, {
    onSuccess: () => {
      queryClient.invalidateQueries(['my-groups'])
      queryClient.invalidateQueries(['groups'])
    },
    mutationKey: ['delete-group']
  });

  const handleSubmit = () => {
    deleteSetMutation.mutate(group.questionGroupId);
    if (setSelectedIds) {
      setSelectedIds(undefined);
    }
    setDeleteText('');
    toggle();
  };

  const cancelDelete = () => {
    setDeleteText('');
    toggle();
  };

  return (
    <React.Fragment>
      <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="danger" outline size='sm'>
        <FontAwesomeIcon icon={faTrash as IconProp} size='sm'/>
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
