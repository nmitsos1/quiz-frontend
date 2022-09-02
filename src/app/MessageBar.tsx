import React from 'react';
import { Alert } from 'reactstrap';
import _ from 'lodash';

interface MessageBarProps {
  message: string,
  color: string,
  setMessage: Function,
}

function MessageBar({message, color, setMessage}: MessageBarProps) {

  return (
    <Alert hidden={message==''} color={color} isOpen={message!==''} onClick={(_.debounce(() => setMessage(''), 0))}>
      {message.split(' AT ')[0]}
    </Alert>
  );
}

export default MessageBar