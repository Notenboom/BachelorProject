import React from 'react';
import { Result, Button } from 'antd';
import { useHistory } from 'react-router';

const NotFound = () => {
    const { push } = useHistory();

    const onBackHome = () =>
    {
        push('/');
    }

    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary" onClick={onBackHome}>Back Home</Button>}
        />
    );
}

export default NotFound;