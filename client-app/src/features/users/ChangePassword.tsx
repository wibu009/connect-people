import { Button, Form, Label, Segment } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { ErrorMessage, Formik } from "formik";
import * as Yup from 'yup';
import MyTextInput from "../../app/common/form/MyTextInput";
import { observer } from "mobx-react-lite";

export default observer(function ChangePassword() {
    const {userStore} = useStore();

    return (
        <Segment clearing size='massive' style={{ maxWidth: 500, margin: 'auto' }}>
            <Formik
                initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '', error: null }}
                onSubmit={(values, { setErrors, setSubmitting }) => {
                    userStore.changePassword(values)
                    .catch((error) => setErrors({ error: error.response.data }))
                    .finally(() => setSubmitting(false));
                }}
                validationSchema={Yup.object({
                    currentPassword: Yup.string().required('Current Password is required'),
                    newPassword: Yup.string().required('Password is required').min(6),
                    confirmPassword: Yup.string().required('Confirm Password is required').oneOf([Yup.ref('newPassword'), null], 'Passwords do not match')
                })}
            >
                {({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
                    <Form className='ui form error' onSubmit={handleSubmit}>
                        <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Current Password" name='currentPassword' type="password" />
                        <MyTextInput fluid icon='lock' iconPosition='left' placeholder="New Password" name='newPassword' type="password" />
                        <MyTextInput fluid icon='lock' iconPosition='left' placeholder="Confirm Password" name='confirmPassword' type="password" />
                        <ErrorMessage name="error" render={() =>
                            <Label style={{ marginBottom: 10, border: 'none', backgroundColor: 'transparent' }} basic color='red' content={errors.error} />
                        } />
                        <Button
                            disabled={!isValid || !dirty || isSubmitting}
                            loading={isSubmitting}
                            positive content='Change Password'
                            type='submit' fluid
                        />
                    </Form>
                )}
            </Formik>
        </Segment>
    );
});