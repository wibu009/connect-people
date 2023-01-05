import { Message } from "semantic-ui-react";

interface Props {
    errors: string[];
}

export default function ValidationError({errors}: Props){
    return (
        <Message error>
            {errors.map((err, i) => (
                <Message.Item key={i}>{err}</Message.Item>
            ))}
        </Message>
    )
}
