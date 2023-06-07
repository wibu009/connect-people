import { observer } from "mobx-react-lite";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../app/common/form/MyTextInput";
import { Button, Header, Label, Image } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";

export default observer(function SendResetPasswordLinkForm() {
    const { userStore } = useStore();

    return (
        <Formik
            initialValues={{ email: '', error: null }}
            onSubmit={(values, { setErrors }) => userStore.forgotPassword(values.email).catch(error => setErrors({ error: error.response.data }))}
            validationSchema={Yup.object({
                email: Yup.string().required().email()
            })}
        >
            {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                <Form className='ui form' onSubmit={handleSubmit}>
                    <Header as='h2' color='teal' fluid='true' >
                        <Image src='/assets/logo_teal.png' /> Reset your password
                    </Header>
                    <p style={{ marginBottom: 20, textAlign: 'center', fontWeight: 'bold', fontSize: 13 }}>Enter your email address and we will send you instructions to reset your password.</p>
                    <MyTextInput fluid icon='mail' iconPosition='left' placeholder="Enter your email" name='email' />
                    <ErrorMessage name="error" render={() => <Label style={{ marginBottom: 10, border: 'none' }} basic color='red' content={errors.error} />} />
                    <Button disabled={!isValid || !dirty || isSubmitting} loading={isSubmitting} positive content='Continue' type='submit' fluid ></Button>
                </Form>
            )}
            
        </Formik>
    )
});