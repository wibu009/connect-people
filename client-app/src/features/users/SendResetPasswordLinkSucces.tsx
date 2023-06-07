import React from "react";
import useQuery from "../../app/util/hook";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import { Button, Header, Icon, Segment } from "semantic-ui-react";

export default function SendResetPasswordLinkSuccess() {
    const email = useQuery().get("email") as string;

    function handleConfirmEmailResend() {
        agent.Account.sendEmailResetPassword(email).then(() => {
            toast.success("Email reset password resent - please check your email", { autoClose: 2000, theme: "light" });
        }).catch(error => {
            console.log(error);
        });
    }

    return (
        <Segment placeholder textAlign='center'>
            <Header icon color='teal'>
                <Icon name="mail outline" />
                Check Your Email!
            </Header>
            <p>Please check your email (including spam folder) for instructions to reset your password.</p>
            {email && (
                <>
                    <p>Didn't receive an email? Click the button below to resend the reset password email</p>
                    <Button basic color='teal' onClick={handleConfirmEmailResend} content='Resend email' size='huge' />
                </>
            )}
        </Segment>
    )
}