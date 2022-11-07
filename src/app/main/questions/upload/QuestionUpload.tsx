import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { uploadQuestionPdf } from './UploadModel';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBan, faUpload, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fileDownload from 'js-file-download';

function QuestionsUpload() {

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);

    const [file, setFile] = useState<File>();

    const uploadQuestionFileMutation = useMutation(uploadQuestionPdf, {
        onSuccess: (data) => {
            fileDownload(data, 'malformed.csv')
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
            uploadQuestionFileMutation.mutate(file);
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