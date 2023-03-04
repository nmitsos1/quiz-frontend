import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faDownload, faFilePdf, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@tanstack/react-query";
import fileDownload from "js-file-download";
import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ButtonGroup, Input, ModalFooter } from "reactstrap";
import { GroupModalProps } from "./GroupCard";
import { downloadGroupPdf, downloadMyGroupPdf, downloadGroupAnswersPdf, downloadMyGroupAnswersPdf } from "./GroupModel";

function DownloadPdfModal({group, isAdminPage}: GroupModalProps) {

    const [modal, setModal] = useState<boolean>(false);
    const toggle = () => setModal(!modal);
  
    const [isCustom, setIsCustom] = useState(false);
    const [numberOfRounds, setNumberOfRounds] = useState<number>(1);
    const [isMax, setIsMax] = useState(true);
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
    const [hasBonus, setHasBonus] = useState(false);
  
    const [hasPassword, setHasPassword] = useState(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
  
    const [hasAnswerPassword, setHasAnswerPassword] = useState(false);
    const [answerPassword, setAnswerPassword] = useState<string>('');
    const [confirmAnswerPassword, setConfirmAnswerPassword] = useState<string>('');
  
    const downloadGroupMutation = useMutation(isAdminPage ? downloadGroupPdf : downloadMyGroupPdf, {
      onSuccess: (data) => {
        fileDownload(data, `${group.questionGroupName}.pdf`);
        downloadGroupAnswersMutation.mutate({
          groupId: group.questionGroupId,
          isCustom: isCustom,
          numberOfRounds: numberOfRounds,
          isMax: isMax,
          numberOfQuestions: numberOfQuestions,
          hasBonus: hasBonus,
          hasPassword: hasAnswerPassword,
          password: answerPassword
        });
      },
      onError: () => {
        closeDownloadModal();
      },
      mutationKey: ['downloaded a question group pdf']
    });
  
    const downloadGroupAnswersMutation = useMutation(isAdminPage ? downloadGroupAnswersPdf : downloadMyGroupAnswersPdf, {
      onSuccess: (data) => {
        fileDownload(data, `${group.questionGroupName} - Answers.pdf`);
        closeDownloadModal();
      },
      mutationKey: ['downloaded a question group pdf']
    });
  
    useEffect(() => {
      if (!isCustom) {
        setNumberOfRounds(1);
        setIsMax(true);
        setHasBonus(false);
      }
    }, [isCustom]);
    
    useEffect(() => {
      if (isMax) {
        setNumberOfQuestions(1);
      }
    }, [isMax]);
  
    useEffect(() => {
      if (!hasPassword) {
        setPassword('');
        setConfirmPassword('');
      }
    }, [hasPassword]);
  
    useEffect(() => {
      if (!hasAnswerPassword) {
        setAnswerPassword('');
        setConfirmAnswerPassword('');
      }
    }, [hasAnswerPassword]);
  
    const handleSubmit = () => {
      downloadGroupMutation.mutate({
        groupId: group.questionGroupId,
        isCustom: isCustom,
        numberOfRounds: numberOfRounds,
        isMax: isMax,
        numberOfQuestions: numberOfQuestions,
        hasBonus: hasBonus,
        hasPassword: hasPassword,
        password: password
      });
    };
  
    const closeDownloadModal = () => {
      toggle();
      setIsCustom(false);
      setHasPassword(false);
      setHasAnswerPassword(false);
    }
  
    return (
      <React.Fragment>
        <Button onClick={(e) => {e.stopPropagation(); toggle();}} color="info" outline size='sm'>
          <FontAwesomeIcon icon={faDownload as IconProp} size='sm'/>
        </Button>
        <Modal isOpen={modal} toggle={closeDownloadModal}>
          <ModalHeader toggle={closeDownloadModal}>Download PDF</ModalHeader>
          <ModalBody>
            <label>Would you like to customize your download?</label><br/>
            <ButtonGroup>
                <Button color='primary' onClick={() => setIsCustom(true)} 
                active={isCustom} outline={!isCustom}>
                Yes
                </Button>
                <Button color='primary' onClick={() => setIsCustom(false)} 
                active={!isCustom} outline={isCustom}>
                No
                </Button>
            </ButtonGroup>
            {isCustom ?
            <div>
              <label>How many rounds?<span className="asterisk">*</span></label><br/>
              <Input type="number" value={numberOfRounds} onChange={(event) => setNumberOfRounds(parseInt(event.target.value))}/>
              <label>How many questions per round?</label><br/>
              <ButtonGroup>
                <Button color='primary' onClick={() => setIsMax(true)} 
                active={isMax} outline={!isMax}>
                Maximum amount
                </Button>
                <Button color='primary' onClick={() => setIsMax(false)} 
                active={!isMax} outline={isMax}>
                Custom
                </Button>
              </ButtonGroup>
              {!isMax ?
              <div>
                <label>Questions per round<span className="asterisk">*</span></label>
                <Input type="number" value={numberOfQuestions} onChange={(event) => setNumberOfQuestions(parseInt(event.target.value))}/>
              </div>
              : <React.Fragment />}
              <label>Bonus questions for each round?</label><br/>
              <ButtonGroup>
                <Button color='primary' onClick={() => setHasBonus(true)} 
                active={hasBonus} outline={!hasBonus}>
                Yes
                </Button>
                <Button color='primary' onClick={() => setHasBonus(false)} 
                active={!hasBonus} outline={hasBonus}>
                No
                </Button>
              </ButtonGroup>
            </div> : <br />}
            <label>Encrypt questions file with password?</label><br/>
              <ButtonGroup>
                <Button color='primary' onClick={() => setHasPassword(true)} 
                active={hasPassword} outline={!hasPassword}>
                Yes
                </Button>
                <Button color='primary' onClick={() => setHasPassword(false)} 
                active={!hasPassword} outline={hasPassword}>
                No
                </Button>
              </ButtonGroup>
              {hasPassword ?
              <div>
                <label>Enter Question Document Password<span className="asterisk">*</span></label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
                <label>Confirm Question Document Password<span className="asterisk">*</span></label>
                <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}/>
              </div>
              : <br />}
              <label>Encrypt answers file with password?</label><br/>
              <ButtonGroup>
                <Button color='primary' onClick={() => setHasAnswerPassword(true)} 
                active={hasAnswerPassword} outline={!hasAnswerPassword}>
                Yes
                </Button>
                <Button color='primary' onClick={() => setHasAnswerPassword(false)} 
                active={!hasAnswerPassword} outline={hasAnswerPassword}>
                No
                </Button>
              </ButtonGroup>
              {hasAnswerPassword ?
              <div>
                <label>Enter Answer Document Password<span className="asterisk">*</span></label>
                <Input type="password" value={answerPassword} onChange={(event) => setAnswerPassword(event.target.value)}/>
                <label>Confirm Answer Document Password<span className="asterisk">*</span></label>
                <Input type="password" value={confirmAnswerPassword} onChange={(event) => setConfirmAnswerPassword(event.target.value)}/>
              </div>
              : <React.Fragment />}
  
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSubmit} 
            disabled={(isCustom && (!(numberOfRounds > 0) || (!isMax && !(numberOfQuestions > 0))) || (hasPassword && ((password !== confirmPassword) || !password || !confirmPassword))
            || (hasAnswerPassword && ((answerPassword !== confirmAnswerPassword) || !answerPassword || !confirmAnswerPassword)))}>
              Download PDF <FontAwesomeIcon icon={faFilePdf as IconProp}/>
            </Button>
            <Button color="secondary" outline onClick={closeDownloadModal}>Cancel <FontAwesomeIcon icon={faBan as IconProp}/></Button>{' '}
          </ModalFooter>
        </Modal>
      </React.Fragment>
    );
  }

  export default DownloadPdfModal;
