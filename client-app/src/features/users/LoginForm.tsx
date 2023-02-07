import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import { Button, Header, Label, Image } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';

export default observer(function LoginForm() {
    const { userStore } = useStore();

    return (
        <Formik
            initialValues={{ email: '', password: '', error: null }}
            onSubmit={(values, { setErrors }) => userStore.login(values).catch(error => setErrors({ error: 'Invalid email or password' }))}
            validationSchema={Yup.object({
                email: Yup.string().required().email(),
                password: Yup.string().required()
            })}
        >
            {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off' >
                    <Header as='h2' color='teal' fluid >
                        <Image src='/assets/logo_teal.png' /> Connect People Now
                    </Header>
                    <MyTextInput fluid icon='user' iconPosition='left' placeholder="Email" name='email' />
                    <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Password" name='password' type="password" />
                    <ErrorMessage name="error" render={() => <Label style={{ marginBottom: 10, border: 'none' }} basic color='red' content={errors.error} />} />
                    <Button disabled={!isValid || !dirty || isSubmitting} loading={isSubmitting} positive content='Login' type='submit' fluid ></Button>
                </Form>
            )}
        </Formik>
    )
});