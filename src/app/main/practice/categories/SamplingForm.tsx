import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { CategoryCount, getCategories } from './CategoryModel'
import { AxiosError } from "axios";
import { addSet } from "../questionGroups/GroupModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import CategoryCountForm from "./CategoryCountForm";
import { beginAttempt } from "../../quiz/attempt/AttemptModel";
import { useNavigate } from "react-router-dom";
import { startNextQuestion } from "../../quiz/QuestionModel";

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

  useEffect(() => {
    setCategoryCounts([]);
  }, [groupIds])

  const addSetMutation = useMutation(addSet, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['groups']);
      beginAttemptMutation.mutate(data.questionGroupId);
    }
  });

  const beginAttemptMutation = useMutation(beginAttempt, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['attempts']);
      startNextQuestionMutation.mutate();
    }
  });

  const startNextQuestionMutation = useMutation(startNextQuestion, {
    onSuccess: (data) => {
      navigate(`/quiz`);
    }
  });


  const navigate = useNavigate();

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
      <Button color="primary" onClick={() => addSetMutation.mutate({ categoryCounts: categoryCounts, groupIds: groupIds})}>
        Begin Quiz
      </Button> : <React.Fragment/>}
    </div>
  )
}

export default SamplingForm