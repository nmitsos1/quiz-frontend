import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Badge, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { getAllGroups, getGroupsBySchoolId, Group, updateGroupsForSchool } from '../practice/questionGroups/GroupModel';
import { getSchoolById } from './SchoolModel';
import _ from 'lodash';

interface EditGroups {
    selectedIds: Array<number>
}
function EditGroups({selectedIds}: EditGroups) {

    const { isLoading, isError, data: groups, error } = useQuery(['groups'], () => getAllGroups());

    if (isLoading) {
        return <h4>Loading Groups...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Groups. {err.message} - {err.response?.statusText}</h4>
    }

    if (groups.length === 0) {
        return <h4>No Schools to display.</h4>
    }

    if (selectedIds.length===0) {
        return (
            <div>Select a school to edit question groups. Select multiple schools to add groups in bulk.</div>
        )
    }

    if (selectedIds.length===1) {
        return (
            <EditSchoolGroups id={selectedIds[0]} groups={groups}/>
        );
    }

    return (
        <div></div>
    );
}

interface EditSchoolGroupsProps {
    id: number,
    groups: Array<Group>
}
function EditSchoolGroups({id, groups}: EditSchoolGroupsProps) {

    const { data: school } = useQuery(['school', id], () => getSchoolById(id));
    const { isLoading, isFetching, isError, data: schoolGroups, error } = useQuery(['school-groups', id], () => getGroupsBySchoolId(id));

    if (isLoading) {
        return <h4>Loading School Groups...</h4>
    }

    if (isFetching) {
        return <h4>Loading School Groups...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading School Groups. {err.message} - {err.response?.statusText}</h4>
    }
    
    return (
        <EditSchoolGroupsForm id={id} name={school?.schoolName || ''} groups={groups} schoolGroups={schoolGroups}/>
    );
}

interface EditSchoolGroupsFormProps {
    id: number,
    name: string,
    groups: Array<Group>,
    schoolGroups: Array<Group>
}
function EditSchoolGroupsForm({id, groups, schoolGroups, name}: EditSchoolGroupsFormProps) {

    const queryClient = useQueryClient();

    const [updatedGroups, setUpdatedGroups] = useState(schoolGroups);
    const [addGroups, setAddGroups] = useState(groups.filter(group => !schoolGroups.map(sg => sg.questionGroupId).includes(group.questionGroupId)))

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const updateGroupsForSchoolMutation = useMutation(updateGroupsForSchool, {
        onSuccess: () => {
          queryClient.invalidateQueries(['school-groups'])
        },
        mutationKey: ['update-school']
    });

    const handleSubmit = () => {
        updateGroupsForSchoolMutation.mutate({schoolId: id, ids: updatedGroups.map(g => g.questionGroupId)})
    }
    
    const removeGroup = (index: number) => {
        let updatedList = [...updatedGroups];
        let itemToRemove = updatedGroups[index];
        updatedList.splice(index, 1);
        setUpdatedGroups(updatedList);

        let addList = [...addGroups];
        addList.push(itemToRemove);
        setAddGroups(addList);

    }

    const addGroup = (group: Group) => {
        let addList = [...addGroups];
        let itemToAdd = addList.filter(g => g.questionGroupId===group.questionGroupId)[0];
        addList.splice(addList.indexOf(itemToAdd), 1)
        setAddGroups(addList);

        let list = [...updatedGroups];
        list.push(itemToAdd);
        setUpdatedGroups(list);
    }

    const resetGroups = () => {
        queryClient.refetchQueries(['groups']);
        queryClient.refetchQueries(['school-groups']);
    }
    
    return (
        <div>
            <h5>Add Or Remove Question Groups For {name}</h5>
            <Row>
                <Col>
                    {addGroups.length===0 ? <div>There are no other groups to add to this school</div> :
                    <Dropdown isOpen={isOpen} toggle={toggle}>
                        <DropdownToggle color="primary" caret>Select a group to add</DropdownToggle>
                        <DropdownMenu>
                        {addGroups.filter(group => group.groupType!=='QuestionSet').map(group => {
                            return (<DropdownItem key={group.questionGroupId} onClick={() => addGroup(group)}>{group.questionGroupName}</DropdownItem>)
                        })}
                        </DropdownMenu>
                    </Dropdown>
                    }
                </Col>
                <Col>
                    <Button outline onClick={resetGroups}>Undo School Group Edits</Button>
                </Col>
            </Row>
            {updatedGroups.length===0 ? <div>There are no other groups to remove from this school</div> :
            updatedGroups.filter(group => group.groupType!=='QuestionSet').map((group, index) => {
                return (
                    <Button key={group.questionGroupId} outline color="primary">{group.questionGroupName}{' '}
                        <FontAwesomeIcon onClick={() => removeGroup(index)} icon={faX as IconProp}></FontAwesomeIcon>
                    </Button>
                );
            })}
            <Button onClick={handleSubmit} color='primary'>Update Groups</Button>
        </div>
    );
}

export default EditGroups