import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header, Label, Image, Divider } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import SendResetPasswordLinkForm from "./SendResetPasswordLinkForm";
import FacebookLogin from "@greatsumini/react-facebook-login";

export default observer(function LoginForm() {
    const { userStore, modalStore } = useStore();

    return (
        <Formik
            initialValues={{ email: '', password: '', error: null }}
            onSubmit={(values, { setErrors }) => userStore.login(values).catch(error => setErrors({ error: error.response.data }))}
            validationSchema={Yup.object({
                email: Yup.string().required().email(),
                password: Yup.string().required()
            })}
        >
            {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                <Form className='ui form' onSubmit={handleSubmit}>
                    <Header as='h2' color='teal' fluid='true' >
                        <Image src='/assets/logo_teal.png' /> Connect People Now
                    </Header>
                    <MyTextInput fluid icon='user' iconPosition='left' placeholder="Email" name='email' />
                    <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Password" name='password' type="password" />
                    <ErrorMessage name="error" render={() => <Label style={{ marginBottom: 10, border: 'none' }} basic color='red' content={errors.error} />} />
                    <Button disabled={!isValid || !dirty || isSubmitting} loading={isSubmitting} positive content='Login' type='submit' fluid ></Button>
                    <Label as='a' style={{ marginTop: 10, marginBottom: 0, display: 'flex', justifyContent: 'center', border: 'none', fontSize: 14 }} basic color='teal' content='Forgot Password?' onClick={() => modalStore.openModal(<SendResetPasswordLinkForm />)} />
                    <Divider horizontal style={{color: 'teal'}} >Or</Divider>
                    <Button
                        as={FacebookLogin}
                        appId='120699144314450'
                        icon='facebook'
                        fluid
                        loading={userStore.fbLoading}
                        color='facebook'
                        content='Continue with Facebook'
                        onSuccess={(response: any) => {
                            userStore.facebookLogin(response.accessToken);
                        }}
                        onFailure={(response: any) => console.log("Login Failed", response)}
                    />
                </Form>
            )}
        </Formik>
    )
});