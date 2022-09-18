import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardColumns, CardHeader, CardText, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Row, Spinner } from "reactstrap";
import Groups from "./questionGroups/Groups";
import { CategoryCount, getAvailableQuestionCount, getCategories } from './categories/CategoryModel'
import { AxiosError } from "axios";
import { addSet, getGroups } from "./questionGroups/GroupModel";
import GroupCard from "./questionGroups/GroupCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

function Practice() {

  const { isLoading, isError, data: groups, error, isSuccess } = useQuery(['groups'], getGroups);
  const [selectedIds, setSelectedIds] = useState<Array<number>>([-1]);

  useEffect(() => {
    if (groups && selectedIds.includes(-1)) {
      setSelectedIds(groups.map((group) => group.questionGroupId))
    }
  }, [groups]);

  if (isLoading) {
    return <h4>Loading Practice...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading your Question Groups. {err.message} - {err.response?.statusText}</h4>
  }

  if (groups?.length === 0) {
    return <h4>You do not own any question groups</h4>
  }

  return (
    <div className="practice-page">
      <h3>Practice</h3>
      <Row>
        <Col>
        <div className='groups'>
          <h4>Your Question Groups</h4>
          <label>Select and deselect your groups to access questions from. All groups are selected by default.</label>
          <div>
            {groups?.map(group => {
              return (
                <GroupCard group={group} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>
              );
            })}
          </div>
        </div>
        </Col>
        <Col>
          <SamplingForm groupIds={selectedIds}/>
        </Col>
      </Row>
    </div>
  )
}

interface SamplingFormProps {
  groupIds: Array<number>
}
function SamplingForm({groupIds}: SamplingFormProps) {

  const { isLoading, isError, data: categories, error } = useQuery(['categories'], getCategories);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [categoryCounts, setCategoryCounts] = useState<Array<CategoryCount>>([]);

  const queryClient = useQueryClient();

  const addSetMutation = useMutation(addSet, {
    onSuccess: () => {
      queryClient.invalidateQueries(['groups'])
    },
    mutationKey: ['add-set']
  });

  if (isLoading) {
    return <h4>Loading Filter Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading filter categories. {err.message} - {err.response?.statusText}</h4>
  }

  const categorySelection = (category: string) => {
    setSelectedCategory(category);
  }

  const removeCategoryCount = (index: number) => {
    let list = [...categoryCounts];
    list.splice(index, 1);
    setCategoryCounts(list);
  }

  const handleSubmit = () => {
    addSetMutation.mutate({ categoryCounts: categoryCounts, groupIds: groupIds});
  }


  return (
    <div className="sampling-form">
      <h4>Question Sample</h4>
      <label>
        Enter your filtering criteria for question categories below and click begin to create a 
        randomized question set. If you plan on applying the 'Any' filter, you must apply it last
        after setting other desired category filters.
      </label>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle color="primary" caret>{selectedCategory || 'Select a category'}</DropdownToggle>
        <DropdownMenu>
          {!categoryCounts.map(cc => cc.questionCategory).includes('Any') ?
          <DropdownItem onClick={() => categorySelection('Any')} key={0}>{'Any'}</DropdownItem> : <React.Fragment/>}
        {categories.filter(category => !categoryCounts.map(cc => cc.questionCategory).includes(category)).map((category, index) => {
          return (<DropdownItem onClick={() => categorySelection(category)} key={index+1}>{category}</DropdownItem>)
        })}
        </DropdownMenu>
      </Dropdown>
      {selectedCategory ?
      <CategoryCountForm category={selectedCategory} setCategory={setSelectedCategory} groupIds={groupIds} categoryCounts={categoryCounts} setCategoryCounts={setCategoryCounts}/>
      : 
      <React.Fragment />
      }
      {categoryCounts.map((cc, index) => {
        return (<Button outline color="success">{cc.questionCategory}{' '}<Badge>{cc.count}</Badge>{' '}
          <FontAwesomeIcon onClick={() => removeCategoryCount(index)} icon={faX as IconProp}></FontAwesomeIcon>
        </Button>)
      })}
      {categoryCounts.length > 0 ?
      <Button color="primary" onClick={handleSubmit}>Begin Quiz</Button> : <React.Fragment/>}
    </div>
  )
}

interface CategoryCountFormProps {
  category: string,
  setCategory: Function,
  groupIds: Array<number>,
  categoryCounts: Array<CategoryCount>,
  setCategoryCounts: Function
}
function CategoryCountForm({category, setCategory, groupIds, categoryCounts, setCategoryCounts}: CategoryCountFormProps) {

  const { isLoading, isError, data: availableCount, error } = 
    useQuery(['category-count', category, groupIds], () => getAvailableQuestionCount(category, groupIds));
  const [count, setCount] = useState<number>(0);

  if (isLoading) {
    return <h4>Loading Count Data...</h4>
  }

  if (isError) {
    let err = error as AxiosError
    return <h4>There was a problem loading count data. {err.message} - {err.response?.statusText}</h4>
  }

  if (availableCount === 0) {
    return <h4>You do not own any questions from this category</h4>
  }

  const addCategoryCount = () => {
    const categoryCount: CategoryCount = {
      questionCategory: category,
      count: count
    }
    let list = [...categoryCounts];
    list.push(categoryCount);
    if (category !== 'Any') {
      list.forEach((cc, index) => {
        if (cc.questionCategory === 'Any') {
          list.splice(index, 1);
        }
      })
    }
    setCategoryCounts(list);
    setCategory(undefined);
  }
  
  return (
    <React.Fragment>

      <label>How many questions? There are {category==='Any' ? (availableCount - categoryCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount}
      {' '}{category==='Any' ? '' : category} questions available</label>

      <Input type="number" value={count} onChange={(event) => setCount(parseInt(event.target.value))}/>

      <Button disabled={!count || (count <= 0 || count > (category==='Any' ? (availableCount - categoryCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount))}
      onClick={addCategoryCount} color='info'>Add Filter</Button>

    </React.Fragment>
  )
}
export default Practice