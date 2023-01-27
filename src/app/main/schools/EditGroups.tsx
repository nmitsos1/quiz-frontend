import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Badge, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Col } from 'reactstrap';
import { bulkAddEvents, bulkAddGroups, getAllGroups, getGroupsBySchoolId, Group, updateEventsForSchool, updateGroupsForSchool } from '../practice/questionGroups/GroupModel';
import { getSchoolById } from './SchoolModel';
import _ from 'lodash';
import { getEventsBySchoolId } from '../events/EventModel';

interface EditGroups {
    selectedIds: Array<number>
}
function EditGroups({selectedIds}: EditGroups) {

    const { isLoading, isError, data: groupPage, error } = useQuery(['groups'], () => getAllGroups('', 1, 1000));
    const groups = groupPage?.content;

    if (isLoading || !groups) {
        return <h4>Loading Groups...</h4>
    }

    if (isError) {
        let err = error as AxiosError
        return <h4>There was a problem loading Groups. {err.message} - {err.response?.statusText}</h4>
    }

    if (groups.length === 0) {
        return <h4>No Groups to display.</h4>
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
        <div>
            <BulkAddGroups selectedIds={selectedIds} groups={groups}/>
            <br /> <br />
            <BulkAddGroups selectedIds={selectedIds} groups={groups.filter(group => group.groupType==='EventPackage')} isForEvents={true} />
        </div>
    );
}

interface EditSchoolGroupsProps {
    id: number,
    groups: Array<Group>
}
function EditSchoolGroups({id, groups}: EditSchoolGroupsProps) {

    const { data: school } = useQuery(['school', id], () => getSchoolById(id));
    const { isLoading: areGroupsLoading, isFetching: areGroupsFetching, isError: isGroupError, data: schoolGroups, error: groupError } = useQuery(['school-groups', id], () => getGroupsBySchoolId(id));
    const { isLoading: areEventsLoading, isFetching: areEventsFetching, isError: isEventError, data: schoolEvents, error: eventError } = useQuery(['school-events', id], () => getEventsBySchoolId(id));

    if (areGroupsLoading || areEventsLoading) {
        return <h4>Loading School Groups...</h4>
    }

    if (areGroupsFetching || areEventsFetching) {
        return <h4>Loading School Groups...</h4>
    }

    if (isGroupError) {
        let err = groupError as AxiosError
        return <h4>There was a problem loading School Groups. {err.message} - {err.response?.statusText}</h4>
    }
    if (isEventError) {
        let err = eventError as AxiosError
        return <h4>There was a problem loading School Groups. {err.message} - {err.response?.statusText}</h4>
    }

    return (
        <div>
            <EditSchoolGroupsForm id={id} name={school?.schoolName || ''} 
            groups={groups.filter(group => group.groupType==='QuestionPackage')} schoolGroups={schoolGroups.filter(group => group.groupType==='QuestionPackage')}/><br/><br/>
            <EditSchoolGroupsForm id={id} name={school?.schoolName || ''} isForEvents={true}
            groups={groups.filter(group => group.groupType==='EventPackage')} schoolGroups={schoolEvents}/>
        </div>
    );
}

interface EditSchoolGroupsFormProps {
    id: number,
    name: string,
    groups: Array<Group>,
    schoolGroups: Array<Group>,
    isForEvents?: boolean
}
function EditSchoolGroupsForm({id, groups, schoolGroups, name, isForEvents}: EditSchoolGroupsFormProps) {

    const queryClient = useQueryClient();

    const [updatedGroups, setUpdatedGroups] = useState(schoolGroups);
    const [addGroups, setAddGroups] = useState(groups.filter(group => !schoolGroups.map(sg => sg.questionGroupId).includes(group.questionGroupId)))

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const updateGroupsForSchoolMutation = useMutation(isForEvents ? updateEventsForSchool : updateGroupsForSchool, {
        onSuccess: () => {
            queryClient.invalidateQueries(['school-groups'])
            queryClient.invalidateQueries(['school-events'])
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
        queryClient.refetchQueries(['school-events'])
    }
    
    return (
        <div>
            <h4>{isForEvents ? `Add Or Remove Event attendence For ${name}` : `Add Or Remove Question Groups For ${name}`}</h4>
            <Row>
                <Col>
                    {addGroups.length===0 ? <div>There are no other {isForEvents ? 'events' : 'groups'} to add to this school</div> :
                    <Dropdown isOpen={isOpen} toggle={toggle}>
                        <DropdownToggle color="primary" caret>Select {isForEvents ? 'an event' : 'a group'} to add</DropdownToggle>
                        <DropdownMenu>
                        {addGroups.map(group => {
                            return (<DropdownItem key={group.questionGroupId} onClick={() => addGroup(group)}>{group.questionGroupName}</DropdownItem>)
                        })}
                        </DropdownMenu>
                    </Dropdown>
                    }
                </Col>
                <Col>
                    <Button outline onClick={resetGroups}>Undo School {isForEvents ? 'Event Attendence' : 'Group'} Edits</Button>
                </Col>
            </Row>
            <hr />
            {updatedGroups.length===0 ? <div>There are no other {isForEvents ? 'events' : 'groups'} to remove from this school</div> :
            updatedGroups.map((group, index) => {
                return (
                    <Button key={group.questionGroupId} outline color="primary">{group.questionGroupName}{' '}
                        <FontAwesomeIcon onClick={() => removeGroup(index)} icon={faX as IconProp}></FontAwesomeIcon>
                    </Button>
                );
            })}
            <br /><br />
            <Button onClick={handleSubmit} color='primary'>Update {isForEvents ? 'Events' : 'Groups'}</Button>
        </div>
    );
}

interface BulkAddGroupsProps {
    selectedIds: Array<number>,
    groups: Array<Group>,
    isForEvents?: boolean
}
function BulkAddGroups({selectedIds, groups, isForEvents}: BulkAddGroupsProps) {

    const queryClient = useQueryClient();

    const [groupsToAdd, setGroupsToAdd] = useState<Array<Group>>([]);

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const bulkAddGroupsMutation = useMutation(isForEvents ? bulkAddEvents : bulkAddGroups, {
        onSuccess: () => {
            queryClient.invalidateQueries(['school-groups'])
            queryClient.invalidateQueries(['school-events'])
        },
        mutationKey: ['update-school']
    });

    const handleSubmit = () => {
        bulkAddGroupsMutation.mutate({schoolIds: selectedIds, groupIds: groupsToAdd.map(g => g.questionGroupId)})
        setGroupsToAdd([])
    }

    const addGroup = (group: Group) => {
        let list = [...groupsToAdd];
        list.push(group);
        setGroupsToAdd(list);
    }

    const removeGroup = (index: number) => {
        let updatedList = [...groupsToAdd];
        updatedList.splice(index, 1);
        setGroupsToAdd(updatedList);
    }

    return (
        <div>
            <h4>Bulk Add {isForEvents ? 'Events' : 'Question Groups'} To {selectedIds.length} Selected Schools</h4>
            {groups.length===0 ? <div>There are no other {isForEvents ? 'events' : 'groups'} to add</div> :
                <Dropdown isOpen={isOpen} toggle={toggle}>
                    <DropdownToggle color="primary" caret>Select a group to add</DropdownToggle>
                    <DropdownMenu>
                    {groups.filter(group => group.groupType!=='QuestionSet')
                    .filter(group => !groupsToAdd.map(g => g.questionGroupId).includes(group.questionGroupId))
                    .map(group => {
                        return (<DropdownItem key={group.questionGroupId} onClick={() => addGroup(group)}>{group.questionGroupName}</DropdownItem>)
                    })}
                    </DropdownMenu>
                </Dropdown>
            }
            <hr />
            {groupsToAdd.length===0 ? <div>No {isForEvents ? 'events' : 'groups'} are selected to be added</div> :
            groupsToAdd.filter(group => group.groupType!=='QuestionSet').map((group, index) => {
                return (
                    <Button key={group.questionGroupId} outline color="primary">{group.questionGroupName}{' '}
                        <FontAwesomeIcon onClick={() => removeGroup(index)} icon={faX as IconProp}></FontAwesomeIcon>
                    </Button>
                );
            })}
            <br /><br />
            <Button onClick={handleSubmit} color='primary'>Add {isForEvents ? 'Events' : 'Groups'}</Button>
        </div>
    );
}

export default EditGroups