import { Message } from "semantic-ui-react";

interface Props {
    errors: any;
}

export default function ValidationError({errors}: Props){
    return (
        <Message error>
            {errors.map((err: any, i: any) => (
                <Message.Item key={i}>{err}</Message.Item>
            ))}
        </Message>
    )
}
