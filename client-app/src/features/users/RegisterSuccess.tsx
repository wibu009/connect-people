import React from "react";
import useQuery from "../../app/util/hook";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function RegisterSuccess() {
    const email = useQuery().get("email") as string;

    function handleConfirmEmailResend() {
        agent.Account.resendEmailConfirmation(email).then(() => {
            toast.success("Email confirmation resent - please check your email", { autoClose: 2000, theme: "light" });
        }).catch(error => {
            console.log(error);
        });
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header icon color='green' style={{ marginBottom: 20 }}>
                <Icon name="check" />
                Successfully registered!
            </Header>
            <p>Please check your email (including spam folder) to confirm your email address</p>
            {email && (
                <>
                    <p>Didn't receive an email? Click the button below to resend the confirmation email</p>
                    <Button basic color='teal' onClick={handleConfirmEmailResend} content='Resend email' size='huge' />
                </>
            )}
        </Segment>
    )
}