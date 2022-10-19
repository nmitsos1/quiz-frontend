import { useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

export const STATES = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];

interface StateDropdownProps {
    selectedState: string,
    setSelectedState: Function
}
export function StateDropdown({selectedState, setSelectedState}:StateDropdownProps) {

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
        <Dropdown direction="up" isOpen={isOpen} toggle={toggle}>
            <DropdownToggle color="dark" outline caret>{selectedState || '  '}</DropdownToggle>
            <DropdownMenu>
                {STATES.map(state => {
                    return <DropdownItem key={state} onClick={() => setSelectedState(state)}>{state}</DropdownItem>
                })}
            </DropdownMenu>
        </Dropdown>
    )
}

export const letters = ['A. ', 'B. ', 'C. ', 'D. ', 'E. ', 'F. '];
