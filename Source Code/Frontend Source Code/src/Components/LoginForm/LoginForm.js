import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useHistory } from 'react-router';
import "antd/dist/antd.css";

import "./LoginForm.css";

import { auth } from '../../Utils/utilities';

const LoginForm = () => {
    const { push } = useHistory();
    const [form] = Form.useForm();

    const onFinish = (values) => {
        auth.signInWithEmailAndPassword(values.email, values.password)
            .then((authUser) => {
                form.resetFields();
                push(`/`);
            })
            .catch((error) => {
                console.log(error.code);
                if (error.code === "auth/wrong-password") {
                    form.resetFields(["password"]);
                    alert("Password was incorrect, please try again, and if it persits reset your password.");
                }
                else if (error.code === "auth/user-not-found") {
                    alert("User could not be found, please try again, and if it persits conntact support.");
                    form.resetFields();
                }
                else {
                    alert("An error has occured, please try again, and if it persits conntact support.");
                }

                form.validateFields();
            });
    };

    return (
        <>
            <Form
                form={form}
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                size={"large"}
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your E-mail!',
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="site-form-item-icon" />}
                        placeholder="E-mail"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <a className="login-form-forgot" href="">
                        Forgot password
                    </a>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default LoginForm;
