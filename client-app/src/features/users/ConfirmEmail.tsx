import React, { useEffect, useState } from "react";
import { useStore } from "../../app/stores/store";
import useQuery from "../../app/util/hook";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import LoginForm from "./LoginForm";

export default function ConfirmEmail() {
    const {modalStore} = useStore();
    const email = useQuery().get("email") as string;
    const token = useQuery().get("token") as string;

    const Status = {
        Verifying: "Verifying",
        Failed: "Failed",
        Success: "Success"
    }

    const [status, setStatus] = useState(Status.Verifying);

    function handleConfirmEmailResend() {
        agent.Account.resendEmailConfirmation(email).then(() => {
            toast.success("Email confirmation resent - please check your email", { autoClose: 2000, theme: "light" });
        }).catch(error => {
            console.log(error);
        });
    }

    useEffect(() => {
        agent.Account.verifyEmail(token, email).then(() => {
            setStatus(Status.Success);
        }).catch(error => {
            setStatus(Status.Failed);
        });
    }, [token, email, Status.Success, Status.Failed, Status.Verifying]);

    function getBody() {
        switch (status) {
            case Status.Verifying:
                return <p>Verifying email...</p>
            case Status.Failed:
                return (
                    <div>
                        <p>Verification failed. You can try resending the verify link yo your email address.</p>
                        <Button primary onClick={handleConfirmEmailResend} size='huge' content='Resend email' />
                    </div>
                );
            case Status.Success:
                return (
                    <div>
                        <p>Email verified successfully! - you can now close this window</p>
                        <Button primary onClick={() => modalStore.openModal(<LoginForm />)} size='huge' content='Login' />
                    </div>
                );
        }
    }
    
    return (
        <Segment placeholder textAlign="center">
            <Header icon>
                <Icon name='envelope' />
                Email Verification
            </Header>
            <Segment.Inline>
                {getBody()}
            </Segment.Inline>
        </Segment>
    );
}