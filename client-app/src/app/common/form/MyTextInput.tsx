import { useField } from 'formik';
import React from 'react'
import { Form, Label } from 'semantic-ui-react';

interface Props {
    placeholder: string;
    name: string;
    label?: string;
    type?: string;
    icon?: string
    iconPosition?: "left"
    fluid?: boolean
}

export default function MyTextInput(props: Props) {
    const [field, meta] = useField(props.name);

    return (
        <Form.Field error={meta.touched && !!meta.error}>
            <label>{props.label}</label>
            <Form.Input {...field} {...props} />
            {meta.touched && meta.error ? (
                <Label basic color='red' style={{ border: 'none' }}>{meta.error}</Label>
            ) : null}
        </Form.Field>
    )
}