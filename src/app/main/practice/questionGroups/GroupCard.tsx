import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faBan, faTrash, faTrashAlt, faFilePdf, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import fileDownload from 'js-file-download';
import React, { useState } from 'react';
import { Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, CardText, CardTitle, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { deleteGroup, deleteMySet, downloadGroupPdf, downloadMyGroupPdf, Group, updateGroup, updateMySet } from './GroupModel';

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

interface GroupModalProps {
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

function DownloadPdfModal({group, isAdminPage}: GroupModalProps) {

  const [modal, setModal] = useState<boolean>(false);
  const toggle = () => setModal(!modal);

  const [isCustom, setIsCustom] = useState(false);
  const [numberOfRounds, setNumberOfRounds] = useState<number>(1);
  const [isMax, setIsMax] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [hasBonus, setHasBonus] = useState(false);

  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const downloadGroupMutation = useMutation(isAdminPage ? downloadGroupPdf : downloadMyGroupPdf, {
    onSuccess: (data) => {
      fileDownload(data, `${group.questionGroupName}.pdf`)
    },
    mutationKey: ['download-group']
  });

  const handleSubmit = () => {
    downloadGroupMutation.mutate({
      groupId: group.questionGroupId,
      isCustom: isCustom,
      numberOfRounds: numberOfRounds,
      isMax: isMax,
      numberOfQuestions: numberOfQuestions,
      hasBonus: hasBonus,
      hasPassword: hasPassword,
      password: password
    });
    toggle();
  };

  return (
    <React.Fragment>
      <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="info" outline size='sm'>
        <FontAwesomeIcon icon={faDownload as IconProp} size='sm'/>
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Download PDF</ModalHeader>
        <ModalBody>
          <label>Would you like to customize your download?</label><br/>
          <ButtonGroup>
              <Button color='primary' onClick={() => setIsCustom(true)} 
              active={isCustom} outline={!isCustom}>
              Yes
              </Button>
              <Button color='primary' onClick={() => setIsCustom(false)} 
              active={!isCustom} outline={isCustom}>
              No
              </Button>
          </ButtonGroup>
          {isCustom ?
          <div>
            <label>How many rounds?</label><br/>
            <Input type="number" value={numberOfRounds} onChange={(event) => setNumberOfRounds(parseInt(event.target.value))}/>
            <label>How many questions per round?</label><br/>
            <ButtonGroup>
              <Button color='primary' onClick={() => setIsMax(true)} 
              active={isMax} outline={!isMax}>
              Maximum amount
              </Button>
              <Button color='primary' onClick={() => setIsMax(false)} 
              active={!isMax} outline={isMax}>
              Custom
              </Button>
            </ButtonGroup>
            {!isMax ?
            <div>
              <label>Questions per round</label>
              <Input type="number" value={numberOfQuestions} onChange={(event) => setNumberOfQuestions(parseInt(event.target.value))}/>
            </div>
            : <React.Fragment />}
            <label>Bonus questions for each round?</label><br/>
            <ButtonGroup>
              <Button color='primary' onClick={() => setHasBonus(true)} 
              active={hasBonus} outline={!hasBonus}>
              Yes
              </Button>
              <Button color='primary' onClick={() => setHasBonus(false)} 
              active={!hasBonus} outline={hasBonus}>
              No
              </Button>
            </ButtonGroup>
          </div> : <br />}
          <label>Encrypt file with password?</label><br/>
            <ButtonGroup>
              <Button color='primary' onClick={() => setHasPassword(true)} 
              active={hasPassword} outline={!hasPassword}>
              Yes
              </Button>
              <Button color='primary' onClick={() => setHasPassword(false)} 
              active={!hasPassword} outline={hasPassword}>
              No
              </Button>
            </ButtonGroup>
            {hasPassword ?
            <div>
              <label>Enter Password</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
              <label>Confirm Password</label>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/>
            </div>
            : <React.Fragment />}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit} 
          disabled={(isCustom && (!(numberOfRounds > 0) || (!isMax && !(numberOfQuestions > 0))) || (hasPassword && (password !== confirmPassword)))}>
            Download PDF <FontAwesomeIcon icon={faFilePdf as IconProp}/>
          </Button>
          <Button color="secondary" outline onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default GroupCard;
