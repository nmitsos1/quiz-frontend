import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UseMutationResult } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge } from "reactstrap";

interface QuizTimerProps {
    startTime: Date,
    endTime?: Date,
    answerCurrentQuestionMutation?: UseMutationResult<Boolean, unknown, String, unknown>
}
export function ClassicTimer({startTime, endTime}: QuizTimerProps) {

    const [time, setTime] = useState((endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime());
    
    useEffect(() => {
        if (!endTime) {
            const intervalTimer = setInterval(() => setTime(Date.now() - new Date(startTime).getTime()), 100);
            return () => clearInterval(intervalTimer);
        } else {
            return () => clearInterval(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime]);

    const seconds = Math.floor(time/1000);

    return (
        <h3>
            <Badge color={seconds < 7 ? 'success' : seconds < 15 ? 'dark' : seconds < 30 ? 'warning' : 'danger'}>
                {seconds} <FontAwesomeIcon icon={faStopwatch as IconProp}/>
            </Badge>
        </h3>
    );
}

export function RelayTimer({startTime, endTime, answerCurrentQuestionMutation}: QuizTimerProps) {

    const [time, setTime] = useState(Math.max(10000 - ((endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime()), 0));
    const seconds = Math.ceil(time/1000);

    useEffect(() => {
        if (!endTime) {
            const intervalTimer = setInterval(() => setTime(Math.max(10000 - (Date.now() - new Date(startTime).getTime()), 0)), 100);
            return () => clearInterval(intervalTimer);
        } else {
            return () => clearInterval(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime]);

    useEffect(() => {
        if (!endTime && seconds <= 0 && answerCurrentQuestionMutation) {
            answerCurrentQuestionMutation.mutate('!!Out of time!!');
            return () => clearInterval(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seconds])

    return (
        <h3>
            <Badge color={seconds > 0 ? 'success' : 'danger'}>
                {seconds} <FontAwesomeIcon icon={faStopwatch as IconProp}/>
            </Badge>
        </h3>
    );
}

interface OfficialTimerProps {
    startTime: Date,
    endTime?: Date,
    timeRemaining: number,
    answerCurrentQuestionMutation: UseMutationResult<Boolean, unknown, String, unknown>
}
export function OfficialTimer({startTime, endTime, timeRemaining, answerCurrentQuestionMutation}: OfficialTimerProps) {

    const [time, setTime] = useState(Math.max(timeRemaining - ((endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime()), 0));

    useEffect(() => {
        if (!endTime) {
            const intervalTimer = setInterval(() => setTime(Math.max(timeRemaining - ((endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime()), 0)), 100);
            return () => clearInterval(intervalTimer);
        } else {
            return () => clearInterval(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime]);

    const seconds = Math.ceil(time/1000);
    const clockHours = Math.floor(seconds/3600).toLocaleString(undefined, { minimumIntegerDigits: 2 });
    const clockMinutes = Math.floor((seconds % 3600)/60).toLocaleString(undefined, { minimumIntegerDigits: 2 });
    const clockSeconds = Math.floor((seconds % 60)).toLocaleString(undefined, { minimumIntegerDigits: 2 });

    useEffect(() => {
        if (seconds <= 0) {
            answerCurrentQuestionMutation.mutate('!!Out of time!!');
            return () => clearInterval(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seconds])

    return (
        <h3>
            <Badge color={endTime ? 'secondary' : seconds > 600 ? 'dark' : seconds > 120 ? 'warning' : 'danger'}>
                {`${endTime ? 'PAUSED ' : ''}`}{`${clockHours}:${clockMinutes}:${clockSeconds}`} <FontAwesomeIcon icon={faStopwatch as IconProp}/>
            </Badge>
        </h3>
    );
}
