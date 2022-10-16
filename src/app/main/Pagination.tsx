import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAnglesLeft, faAngleLeft, faAngleRight, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

export interface Sort {
    empty: boolean,
    sorted: boolean,
    unsorted: boolean
}

export interface Pageable {
    sort: Sort,
    offset: number,
    pageSize: number,
    pageNumber: number,
    paged: boolean,
    unpaged: boolean
}

export interface Page<Type> {
    content: Array<Type>,
    pageable: Pageable,
    last: boolean,
    totalElements: number,
    totalPages: number,
    size: number,
    sort: Sort,
    first: boolean,
    numberOfElements: number,
    empty: boolean
}

interface PaginationProps<Type> {
    page: Page<Type>,
    setPage: Function,
    setCount: Function,
    isLoading?: boolean
}
export default function Pagination<Type>({page, setPage, setCount, isLoading}: PaginationProps<Type>) {

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
  
    const recordsPerPageOptions = [1,3,5,10];

    return (
        <div className="pagination-bar">
            <Button outline color="dark" disabled={page.first || isLoading} onClick={() => setPage(1)}>
                <FontAwesomeIcon icon={faAnglesLeft as IconProp} size='sm' />
            </Button>
            <Button outline color="dark" disabled={page.first || isLoading} onClick={() => setPage(page.pageable.pageNumber)}>
                <FontAwesomeIcon icon={faAngleLeft as IconProp} size='sm' />
            </Button>
            <Button color="dark" disabled={isLoading}>{page.pageable.pageNumber+1}</Button>
            <Button outline color="dark" disabled={page.last || isLoading} onClick={() => setPage((page.pageable.pageNumber+2))}>
                <FontAwesomeIcon icon={faAngleRight as IconProp} size='sm' />
            </Button>
            <Button outline color="dark" disabled={page.last || isLoading} onClick={() => setPage(page.totalPages)}>
                <FontAwesomeIcon icon={faAnglesRight as IconProp} size='sm' />
            </Button>{' '}
            <div className="inline-block-class">
                <Dropdown isOpen={isOpen} toggle={toggle} disabled={isLoading}>
                    <DropdownToggle color="primary" outline caret disabled={isLoading}>{page.pageable.pageSize} records per page</DropdownToggle>
                    <DropdownMenu>
                        {recordsPerPageOptions.map(count => {
                            return <DropdownItem key={count} onClick={() => {setPage(1); setCount(count); }}>{count}</DropdownItem>
                        })}
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}
