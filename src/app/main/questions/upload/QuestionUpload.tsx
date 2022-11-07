import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, ButtonGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { uploadMultipleChoiceCsv, uploadShortAnswerCsv } from './UploadModel';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faUpload, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fileDownload from 'js-file-download';

function QuestionsUpload() {

    const queryClient = useQueryClient();

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [isMc, setIsMc] = useState(true);
    const [file, setFile] = useState<File>();

    const uploadMcFileMutation = useMutation(uploadMultipleChoiceCsv, {
        onSuccess: (data) => {
            fileDownload(data, 'MalformedMultipleChoice.csv');
            queryClient.invalidateQueries(['questions'])
        },
        mutationKey: ['upload-file']
    });

    const uploadSaFileMutation = useMutation(uploadShortAnswerCsv, {
        onSuccess: (data) => {
            fileDownload(data, 'MalformedShortAnswer.csv');
            queryClient.invalidateQueries(['questions'])
        },
        mutationKey: ['upload-file']
    });

    const fileSetter = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            //console.log(event.target.files[0]);
            setFile(event.target.files[0]);
        } else {
            setFile(undefined);
        }
    }

    const handleSubmit = () => {
        if (file) {
            if (isMc) {
                uploadMcFileMutation.mutate(file);
            } else {
                uploadSaFileMutation.mutate(file);
            }
            setFile(undefined);
        }
    }

    return (
        <React.Fragment>
          <Button onClick={toggle} color="primary" outline className='left-margin-class'>
            Upload Questions <FontAwesomeIcon icon={faUpload as IconProp}/>
          </Button>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Upload Questions</ModalHeader>
            <ModalBody>
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
                </ButtonGroup>
                <br /><br />
                <label>Choose a document</label><br />
                <Input type='file' name='file' onChange={fileSetter}/>
            </ModalBody>
            <ModalFooter>
                <Button color='primary' disabled={!file} onClick={handleSubmit}>Upload Questions <FontAwesomeIcon icon={faCloudArrowUp as IconProp}/></Button>
                <Button outline color="secondary" onClick={toggle}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>
            </ModalFooter>
          </Modal>
        </React.Fragment>
    )
}
export default QuestionsUpload