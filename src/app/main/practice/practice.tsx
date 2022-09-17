import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardColumns, CardHeader, CardText, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner } from "reactstrap";
import Groups from "./questionGroups/Groups";
import { getAvailableQuestionCount, getCategories } from './questionGroups/categories/CategoryModel'
import { AxiosError } from "axios";
import { getGroups } from "./questionGroups/GroupModel";
import GroupCard from "./questionGroups/GroupCard";

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
          <SamplingForm groupIds={selectedIds}/>
        </Col>
        <Col>
        <div className='groups'>
          <h4>Your Question Groups</h4>
          <div>
            {groups?.map(group => {
              return (
                <GroupCard group={group} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>
              );
            })}
          </div>
        </div>
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
  const [availableQuestions, setAvailableQuestions] = useState<number>();
  const [categoryCount, setCategoryCount] = useState<number>();

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

  return (
    <div className="sampling-form">
      <label>Enter your filtering criteria below and click begin to create a randomized question set</label>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle color="primary" caret>{selectedCategory || 'Select a category'}</DropdownToggle>
        <DropdownMenu>
        {categories.map((category, index) => {
          return (<DropdownItem onClick={() => categorySelection(category)} key={index}>{category}</DropdownItem>)
        })}
        </DropdownMenu>
      </Dropdown>
      {(selectedCategory && availableQuestions) ?
      <React.Fragment>
        <label>How many questions? There are {availableQuestions} {selectedCategory} questions available</label>
      </React.Fragment>
      : 
      selectedCategory ?
      <Spinner />
      :
      <React.Fragment />
      }
    </div>
  )
}

interface CategoryCountFormProps {
  category: string,
  setCategory: Function,
  groupIds: Array<number>
}
function CategoryCountForm({category, setCategory, groupIds}: CategoryCountFormProps) {

  const { data: groups } = useQuery(['groups'], getGroups);
  const { isLoading, isError, data: availableCount, error } = 
    useQuery(['category-count'], () => getAvailableQuestionCount(category, groupIds));

  return (
    <React.Fragment>
    <label>How many questions? There are {availableCount} {category} questions available</label>
    </React.Fragment>
)
}
export default Practice