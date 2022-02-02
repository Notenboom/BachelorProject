import React from 'react';
import {
    Row,
    Col
} from 'antd';

import './SignUp.css'

import LoginForm from '../LoginForm/LoginForm';
import RegisterForm from '../RegisterForm/RegisterForm';

const Login_Register = () => {
    return (
        <React.Fragment>
            <Row
                className="login_register"
            >
                <Col
                    className="left_side"
                    span={12}
                >
                    <Row>
                        <Col
                            span={20}
                            className="text"
                        >
                            <h1>Login to your account</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col
                            span={24}
                            className="item"
                        >
                            <LoginForm />
                        </Col>
                    </Row>
                </Col>
                <Col
                    className="right_side"
                    span={12}
                >
                    <Row>
                        <Col
                            span={24}
                            className="text"
                        >
                            <h1>or create an account if you haven't yet</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col
                            span={24}
                            className="item"
                        >
                            <RegisterForm />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </React.Fragment>
    );
}

export default Login_Register;