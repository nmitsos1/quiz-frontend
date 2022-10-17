import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import { uploadQuestionPdf } from './UploadModel';

function QuestionsPage() {

    const [file, setFile] = useState<File>();

    const uploadQuestionFileMutation = useMutation(uploadQuestionPdf, {
        onSuccess: () => {
            
        }
    });

    const fileSetter = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            console.log(event.target.files[0]);
            setFile(event.target.files[0]);
        } else {
            setFile(undefined);
        }
    }

    const handleSubmit = () => {
        if (file) {
            uploadQuestionFileMutation.mutate(file);
            setFile(undefined);
        }
    }

    return (
        <div>
            <Input type='file' name='file' onChange={fileSetter}/>
            <Button color='primary' disabled={!file} onClick={handleSubmit}>Upload Questions</Button>
        </div>
    )
}
export default QuestionsPage