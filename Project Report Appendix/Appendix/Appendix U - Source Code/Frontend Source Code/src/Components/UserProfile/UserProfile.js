import React from 'react';
import {
    Form,
    Input,
    Button,
    Descriptions,
    Divider
} from 'antd';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LockOutlined } from '@ant-design/icons';

import { HOST } from '../../Utils/config';
import { auth } from '../../Utils/utilities';
import './UserProfile.css';

const getUsers = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/user/get_user?userId=${ownerId}`);
    return result.data;
}

const UserProfile = (props) => {
    const [user, loading, error] = useAuthState(auth);
    const [passwordForm] = Form.useForm();
    const { status, data, error: dataError } = useQuery(
        'user_profile',
        () => {
            return getUsers(props.ownerId)
        },
        {
            enabled: props.ownerId == null ? false : true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    );

    const onFinish = (values) => {
        auth.signInWithEmailAndPassword(user.email, values.oldPassword)
            .then((authUser) => {
                user.updatePassword(values.newPassword)
                    .then(() => console.log("Password Updated"))
                    .catch((error) => console.log(error));
                passwordForm.resetFields();
            })
            .catch((error) => {
                console.log(error.code);
                passwordForm.validateFields();
            });
    }

    if (status === 'error') {
        return (
            <span>Error: {error.message}</span>
        );
    } else if (status === 'loading') {
        return (
            <span>Loading...</span>
        );
    }

    return (
        <div>
            <Divider orientation="left">General Info</Divider>
            <Descriptions
                extra={<Button type="primary">Edit</Button>}>
                <Descriptions.Item label="First Name">{data[0].FirstName}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{data[0].LastName}</Descriptions.Item>
                <Descriptions.Item label="Gender">{data[0].Gender === 1 ? "Male" : "Female"}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Account Info</Divider>
            <Descriptions>
                <Descriptions.Item label="Email">{data[0].Email}</Descriptions.Item>
                <Descriptions.Item label="User ID">{data[0].UserID}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Password</Divider>
            <Form
                className="register-form"
                form={passwordForm}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
            >
                <Form.Item
                    name="oldPassword"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your old password!',
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder="Old Password"
                    />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    dependencies={['oldPassword']}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your new password!',
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
                        placeholder={"New Password"}
                    />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
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

                <Form.Item>
                    <Button disabled={false} type="primary" htmlType="submit" style={{ marginTop: "10px" }}>
                        Change Password
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserProfile;