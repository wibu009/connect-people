import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header, Image } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import ValidationError from "../errors/ValidationError";

export default observer(function RegisterForm() {
    const { userStore } = useStore();

    return (
        <Formik
            initialValues={{ displayName: '', email: '', password: '', error: null }}
            onSubmit={(values, { setErrors, setSubmitting }) => userStore.register(values).catch(error => setErrors({ error })).finally(() => setSubmitting(false))}
            validationSchema={Yup.object({
                displayName: Yup.string().required('Display Name is required').min(6),
                username: Yup.string().required('Username is required').min(6),
                email: Yup.string().required('Email is required').email('Invalid email address'),
                password: Yup.string().required('Password is required').min(6)
            })}
        >
            {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                <Form className='ui form error' onSubmit={handleSubmit}>
                    <Header as='h2' color='teal'>
                        <Image src='/assets/logo_teal.png' /> Join the Community
                    </Header>
                    <MyTextInput fluid icon='info' iconPosition='left' placeholder="Display Name" name='displayName' />
                    <MyTextInput fluid icon='user' iconPosition='left' placeholder="Username" name='username' />
                    <MyTextInput fluid icon='envelope' iconPosition='left' placeholder="Email" name='email' />
                    <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Password" name='password' type="password" />
                    <ErrorMessage name="error" render={() =>
                        <ValidationError errors={errors.error} />
                    } />
                    <Button
                        disabled={!isValid || !dirty || isSubmitting}
                        loading={isSubmitting}
                        positive content='Register'
                        type='submit' fluid
                    />
                </Form>
            )}
        </Formik>
    )
});