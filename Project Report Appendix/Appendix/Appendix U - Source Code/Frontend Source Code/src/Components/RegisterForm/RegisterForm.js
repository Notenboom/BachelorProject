import React from 'react';
import {
    Form,
    Input,
    Select,
    Checkbox,
    Button
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from 'react-query';
import axios from 'axios';
import { useHistory } from 'react-router';
import './RegisterForm.css';

import { auth } from '../../Utils/utilities';
import { HOST } from '../../Utils/config';

const { Option } = Select;

const registerUser = (newUser) => {
    return axios.post(`${HOST}/api/user/add_user`, newUser);
}

const RegisterForm = () => {
    const { push } = useHistory();
    const [form] = Form.useForm();
    const mutation = useMutation(newUser => registerUser(newUser));

    const onFinish = (values) => {
        auth.createUserWithEmailAndPassword(values.email, values.password)
            .then((authUser) => {
                mutation.mutate({
                    UserId: authUser.user._delegate.uid,
                    FirstName: values.firstname,
                    LastName: values.lastname,
                    Email: values.email,
                    Gender: parseInt(values.gender)
                });
                push(`/`);
                form.resetFields();
            })
            .catch((error) => {
                if (error.code === "auth/email-already-in-use") {
                    alert("Email already in use. Please sign in to your account, or use another email address.");
                }
            });
    };

    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 12,
                offset: 0,
            },
        },
    };

    return (
        <React.Fragment>
            <Form
                className="register-form"
                form={form}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
                size={"large"}
            >
                <Form.Item
                    name="firstname"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your first name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input
                        placeholder={"First Name"}
                        prefix={<UserOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>
                <Form.Item
                    name="lastname"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your last name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input
                        placeholder="Last Name"
                        prefix={<UserOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: 'The input is not valid E-mail!',
                        },
                        {
                            required: true,
                            message: 'Please input your E-mail!',
                        },
                    ]}
                >
                    <Input
                        placeholder={"E-mail"}
                        prefix={<MailOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>

                <Form.Item
                    name="password"

                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                        () => ({
                            validator(_, value) {
                                if (!value || value.length >= 8) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(new Error('The password must be 8 characters or longer'));
                            },
                        })
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder={"Password"}
                    />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        })
                    ]}
                >
                    <Input.Password
                        placeholder={"Confirm Password"}
                        prefix={<LockOutlined className="site-form-item-icon" />}
                    />
                </Form.Item>

                <Form.Item
                    name="gender"
                    rules={[
                        {
                            required: true,
                            message: 'Please select gender!',
                        },
                    ]}
                >
                    <Select placeholder="Select your gender">
                        <Option value="0">Female</Option>
                        <Option value="1">Male</Option>
                        <Option value="2">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    {...tailFormItemLayout}
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
                        },
                    ]}
                >
                    <Checkbox>
                        I have read the <a href="">agreement</a>
                    </Checkbox>
                </Form.Item>
                <Form.Item >
                    <Button type="primary" htmlType="submit" className="register-form-button">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </React.Fragment>
    );
}

export default RegisterForm;