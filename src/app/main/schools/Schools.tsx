import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getSchools } from "./SchoolModel";

function Schools() {

    const [name, setName] = useState('');
    const { isLoading, isError, data: schools, error } = useQuery(['schools', name], () => getSchools(name));

    return (
        <div className="schools-page">
            
        </div>
    )
}

export default Schools