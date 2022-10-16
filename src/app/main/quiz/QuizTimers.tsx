import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Badge } from "reactstrap";
import { Answer } from "./QuestionModel";

interface QuizTimerProps {
    startTime: Date,
    endTime?: Date,
    answerCurrentQuestionMutation?: UseMutationResult<Boolean, unknown, Answer, unknown>
}
export function DefaultTimer({startTime, endTime}: QuizTimerProps) {

    const [time, setTime] = useState((endTime ? new Date(endTime).getTime() : Date.now()) - new Date(startTime).getTime());
    
    useEffect(() => {
        if (!endTime) {
            const intervalTimer = setInterval(() => setTime(Date.now() - new Date(startTime).getTime()), 100);
            return () => clearInterval(intervalTimer);
        } else {
            return () => clearInterval(undefined);
        }
    }, [endTime]);

    const seconds = Math.floor(time/1000);

    return (
        <h3>
            <Badge color={seconds < 7 ? 'success' : seconds < 15 ? 'dark' : seconds < 30 ? 'warning' : 'danger'}>
                {seconds}
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
    }, [endTime]);

    useEffect(() => {
        if (!endTime && seconds <= 0 && answerCurrentQuestionMutation) {
            answerCurrentQuestionMutation.mutate({answerId: 0, answerText: 'Out of time'});
            return () => clearInterval(undefined);
        }
    }, [seconds])

    return (
        <h3>
            <Badge color={seconds > 0 ? 'success' : 'danger'}>
                {seconds}
            </Badge>
        </h3>
    );
}
