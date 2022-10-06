import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button, Input } from "reactstrap";
import { CategoryCount, getAvailableQuestionCount } from './CategoryModel'
import { AxiosError } from "axios";

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
    setCategoryCounts(list);
    setCategory(undefined);
  }
  
  return (
    <React.Fragment>
      <label>How many questions? There are {category==='Any' ? (availableCount - categoryCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount}
      {' '}{category==='Any' ? '' : category} questions available in this category</label>

      <Input type="number" value={count} onChange={(event) => setCount(parseInt(event.target.value))}/>
      <br />
      <Button disabled={!count || (count <= 0 || count > (category==='Any' ? (availableCount - categoryCounts.reduce((a, b) => {return a+b.count}, 0)) : availableCount))}
      onClick={addCategoryCount} color='dark'>Add Filter</Button>
    </React.Fragment>
  )
}

export default CategoryCountForm