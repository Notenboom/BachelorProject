import React from 'react';
import { Modal, Button, Form, Input } from 'antd';
import { useMutation } from 'react-query';
import axios from 'axios';
import { HOST } from '../../Utils/config';

import './RegisterDevice.css';

const registerDevice = (newDevice) => {
    return axios.post(`${HOST}/api/device/register_device`, newDevice);
}

const RegisterDevice = (props) => {
    const [form] = Form.useForm();
    const mutation = useMutation(newDevice => registerDevice(newDevice));

    const handleCancel = () => {
        form.resetFields();
        props.toggleModal();
    };

    const onFinish = (value) => {
        props.toggleModal();
        form.resetFields();
        mutation.mutate({
            OwnerId: props.ownerId,
            Id: value.deviceId,
            Name: value.deviceName
        });
    };

    return (
        <Modal
            title="Register Device"
            visible={props.isModalVisible}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button
                    form="registerDevice"
                    htmlType="submit"
                    key="submit"
                    type="primary"
                >
                    Submit
                </Button >
            ]}
        >
            <Form
                name="registerDevice"
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Device Name"
                    name="deviceName"
                    rules={[{ required: true, message: 'Device Id is required' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Device Id"
                    name="deviceId"
                    rules={[{ required: true, message: 'Device Id is required' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal >
    );
}

export default RegisterDevice;