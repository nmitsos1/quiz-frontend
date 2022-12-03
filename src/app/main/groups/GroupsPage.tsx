import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Modal, ButtonGroup, Input } from 'reactstrap';
import Pagination, { Page } from '../Pagination';
import SamplingForm from '../practice/categories/SamplingForm';
import GroupCard from '../practice/questionGroups/GroupCard';
import { getAllGroups, Group } from '../practice/questionGroups/GroupModel';
import QuestionsPage from '../questions/QuestionsPage';
import { StateDropdown } from '../Shared';

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
          <label>Select a question group or create a new group on the right</label>
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
            <QuestionsPage groupId={selectedId}/>
            :
            <CreateQuestionGroup />
            }
        </Col>
    </Row>
      );
}

function CreateQuestionGroup() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [isPackage, setIsPackage] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [isPristine, setIsPristine] = useState(true);
  const [isClean, setIsClean] = useState(true);
  const [state, setState] = useState('All');

  const [isSample, setIsSample] = useState(true);

  const [isMc, setIsMc] = useState(true);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    if (isPackage) {
      setStartDate(undefined);
      setEndDate(undefined);
      setIsPristine(true);
    } else {
      setIsPristine(true);
    }
  }, [isPackage]);

  useEffect(() => {
    if (isPristine) {
      setState('All');
    } else {
      setState('AL');
    }
  }, [isPristine]) 

  const fileSetter = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        //console.log(event.target.files[0]);
        setFile(event.target.files[0]);
    } else {
        setFile(undefined);
    }
  }

  return (
    <div>
      <h4>Create Question Group</h4>
      <label>Group Name<span className='asterisk'>*</span></label>
      <Input maxLength={60} type="text" required onChange={(event) => setName(event.target.value)}/>
      <label>Group Description<span className='asterisk'>*</span></label>
      <Input maxLength={500} type="textarea" rows="3" required onChange={(event) => setDescription(event.target.value)}/>
      <div>
        <label>Group Type</label><br/>
        <ButtonGroup>
            <Button color='primary' onClick={() => setIsPackage(true)} 
            active={isPackage} outline={!isPackage}>
            General Question Package
            </Button>
            <Button color='primary' onClick={() => setIsPackage(false)} 
            active={!isPackage} outline={isPackage}>
            Official Event
            </Button>
        </ButtonGroup>
        {isPackage ? 
        <div>
        <label>Pristine Question Group?</label><br/>
        <ButtonGroup>
            <Button color='primary' onClick={() => setIsPristine(true)} 
            active={isPristine} outline={!isPristine}>
            Pristine
            </Button>
            <Button color='primary' onClick={() => setIsPristine(false)} 
            active={!isPristine} outline={isPristine}>
            Not Pristine
            </Button>
        </ButtonGroup>
        {isPristine ? 
        isSample ?
        <div>
          <label>Pristine in what state?</label>
          <StateDropdown selectedState={state} setSelectedState={setState} includesAll={true}/>
        </div> : <React.Fragment />
        : 
        <div>
          <label>Clean Question Group? (Used for external events/non practice set packages)</label><br/>
          <ButtonGroup>
              <Button color='primary' onClick={() => setIsClean(true)} 
              active={isClean} outline={!isClean}>
              Clean
              </Button>
              <Button color='primary' onClick={() => setIsClean(false)} 
              active={!isClean} outline={isClean}>
              Not Clean
              </Button>
          </ButtonGroup>
          {!isPristine && isSample ? 
          <div>
            <label>{isClean ? 'Clean' : 'Unclean'} in what state?</label>
            <StateDropdown selectedState={state} setSelectedState={setState} />
          </div>
          : <React.Fragment /> }
        </div>}
      </div> :
        <div>
          <label>Start Date (Local Timezone)<span className='asterisk'>*</span></label>
          <Input type='datetime-local' onChange={(event) => setStartDate(new Date(event.target.value))} />
          <label>End Date (Local Timezone)<span className='asterisk'>*</span></label>
          <Input type='datetime-local' onChange={(event) => setEndDate(new Date(event.target.value))} />
          <label>Official Events will always use pristine questions that have never been seen in any state</label>
        </div>}
      </div>
      {name && description && (isPackage || (startDate && endDate))
      ?
      <div>
        <div>
          <label>How to create new Question Group?</label><br/>
          <ButtonGroup>
              <Button color='primary' onClick={() => setIsSample(true)} 
              active={isSample} outline={!isSample}>
              Random Question Sample
              </Button>
              <Button color='primary' onClick={() => setIsSample(false)} 
              active={!isSample} outline={isSample}>
              CSV Upload
              </Button>
          </ButtonGroup>
        </div>
        <hr/>
        {isSample ? 
        <SamplingForm groupIds={[]} adminGroupRequest={{
          name: name,
          description: description,
          isPackage: isPackage,
          startDate: startDate,
          endDate: endDate,
          isPristine: isPristine,
          isClean: isClean,
          state: state
        }}/>
        :
        <div>
          <h4>Question Upload</h4>
          <label>Question Type</label><br/>
          <ButtonGroup>
              <Button color='primary' onClick={() => setIsMc(true)} 
              active={isMc} outline={!isMc}>
              Multiple Choice
              </Button>
              <Button color='primary' onClick={() => setIsMc(false)} 
              active={!isMc} outline={isMc}>
              Short Answer
              </Button>
          </ButtonGroup><br/>
          <label>
              <b>Column Headers: </b>
              {isMc ?
              'Question, Correct Answer, Level, Question Type, Status, Topic, Title, Catlines'
              :
              'Question, Answer, Level, Type, Status, Topic, Catlines, Title'
              }
          </label>
          <br /><br />
          <label>Select a CSV file to upload</label><br />
          <Input type='file' name='file' onChange={fileSetter}/>
          <label>Correctly formatted question rows will be entered into the database. You will receive a CSV file with incorrectly formatted rows.</label>
        </div>
        }
      </div>
      :
      <React.Fragment />}
    </div>
  );
}
export default GroupsPage