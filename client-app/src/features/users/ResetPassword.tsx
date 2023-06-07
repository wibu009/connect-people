import React, { useEffect, useState } from "react";
import useQuery from "../../app/util/hook";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from 'yup';
import { Button, Header, Image, Label, Segment } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { router } from "../../app/router/Routes";

export default function ResetPassword() {
    const email = useQuery().get("email") as string;
    const token = useQuery().get("token") as string;

    const [, setSubmitting] = useState(false);

    useEffect(() => {
        if (!email || !token) {
            toast.error("Invalid reset password link", { autoClose: 2000, theme: "light" });
            router.navigate("/not-found");
        }
    }, [email, token]);

    return (
        <Segment clearing size='massive' style={{ maxWidth: 500, margin: 'auto' }}>
            <Formik
                initialValues={{ newPassword: '', confirmPassword: '', error: null }}
                onSubmit={(values, { setErrors }) => {
                    setSubmitting(true);
                    agent.Account.resetPassword({ email, token, newPassword: values.newPassword, confirmPassword: values.confirmPassword })
                        .then(() => {
                            toast.success("Password reset successfully", { autoClose: 2000, theme: "light" });
                            setSubmitting(false);
                            new Promise<void>((resolve) => setTimeout(() => resolve(), 2000)).then(() => router.navigate("/login"));
                        }).catch((error) => setErrors({ error: error.response.data })).finally(() => setSubmitting(false));
                }}
                validationSchema={Yup.object({
                    newPassword: Yup.string().required().min(6),
                    confirmPassword: Yup.string().required().oneOf([Yup.ref('newPassword'), null])
                })}
            >
                {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                    <Form className='ui form error' onSubmit={handleSubmit}>
                        <Header as='h2' color='teal' style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Image src='https://cdn-icons-png.flaticon.com/512/1570/1570240.png' /> Reset Password
                        </Header>
                        <MyTextInput fluid icon='lock' iconPosition='left' placeholder="New Password" name='newPassword' type="password" />
                        <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Confirm Password" name='confirmPassword' type="password" />
                        <ErrorMessage name="error" render={() =>
                            <Label style={{ marginBottom: 10, border: 'none', backgroundColor: 'transparent' }} basic color='red' content={errors.error} />
                        } />
                        <Button
                            disabled={!isValid || !dirty || isSubmitting}
                            loading={isSubmitting}
                            positive content='Reset Password'
                            type='submit' fluid
                        />
                    </Form>
                )}
            </Formik>
        </Segment>
    );
}