import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { CategoryCount, getAvailableQuestionCount, getCategories } from './CategoryModel'
import { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import CategoryCountForm from "./CategoryCountForm";
import CreateAndBeginQuizButton from "../CreateAndBeginQuizButton";

interface SamplingFormProps {
  groupIds: Array<number>
}
function SamplingForm({groupIds}: SamplingFormProps) {

  const { isLoading, isError, data: categories, error } = useQuery(['categories'], getCategories);
  const { data: anyCount } = useQuery(['category-count', groupIds], () => getAvailableQuestionCount('Any', groupIds));

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [categoryCounts, setCategoryCounts] = useState<Array<CategoryCount>>([]);

  useEffect(() => {
    setCategoryCounts([]);
  }, [groupIds]);

  let isAnyFacetInvalid = false;
  let facetCount = 0;
  if (anyCount) {
    if (categoryCounts.length > 0) {
      facetCount = categoryCounts.map(cc => cc.count).reduce((a,b) => a+b);
      if (facetCount > anyCount) {
        isAnyFacetInvalid = true;
      }
    }
  }

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

  return (
    <div className="sampling-form">
      <h4>Question Sample</h4>
      <label>
        Enter your filtering criteria for question categories below and click begin to create a 
        randomized question set. The question limit per set is <b>250</b> questions.
      </label>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle color="primary" outline caret>{selectedCategory || 'Select a category'}</DropdownToggle>
        <DropdownMenu>
          {!categoryCounts.map(cc => cc.questionCategory).includes('Any') ?
          <DropdownItem onClick={() => categorySelection('Any')} key={0}>{'Any'}</DropdownItem> : <React.Fragment/>}
        {categories.filter(category => !categoryCounts.map(cc => cc.questionCategory).includes(category)).map((category, index) => {
          return (<DropdownItem onClick={() => categorySelection(category)} key={index+1}>{category}</DropdownItem>)
        })}
        </DropdownMenu>
      </Dropdown>
      {selectedCategory ?
      <CategoryCountForm category={selectedCategory} setCategory={setSelectedCategory} groupIds={groupIds} 
      categoryCounts={categoryCounts} setCategoryCounts={setCategoryCounts}/>
      : 
      <br />
      }
      <hr />
      {categoryCounts.map((cc, index) => {
        return (<Button key={index} outline color={`${cc.questionCategory==='Any' && isAnyFacetInvalid ? 'danger' : 'success'}`}>
          {cc.questionCategory}{' '}<Badge>{cc.count}</Badge>{' '}
          <FontAwesomeIcon onClick={() => removeCategoryCount(index)} icon={faX as IconProp}></FontAwesomeIcon>
        </Button>)
      })}
      {isAnyFacetInvalid ?
      <div>
        You have applied an 'Any' facet with a count greater than the number of questions remaining after applying your other facets. 
        Please remove this facet and reapply with a lower question count.
      </div>
      :
      (categoryCounts.length > 0) ?
      categoryCounts.map(cc => cc.count).reduce((a,b) => a+b) <= 250 ?
      <React.Fragment><br/><br/><CreateAndBeginQuizButton categoryCounts={categoryCounts} groupIds={groupIds}/> <label>{facetCount} Total Questions</label></React.Fragment>
      :
      <div>You are over the question limit. Your current question total is {facetCount} and the limit is 250.</div>
      :
      <div>No filters added.</div>}
    </div>
  )
}

export default SamplingForm