import React from 'react';
import { Card } from 'antd';
import { PlusOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useQuery } from 'react-query';
import {
    Table,
    Button
} from 'antd';
import 'antd/dist/antd.css';

import { DATE_LOCALE, DATE_OPTIONS } from '../../Utils/config';
import { HOST } from '../../Utils/config';
import './ManageDevices.css';
import RegisterDevice from '../RegisterDevice/RegisterDevice';

const columns = [
    {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: '15%'
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '25%'
    },
    {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: '25%'
    },
    {
        title: 'Last State Time',
        dataIndex: 'lastStateTime',
        key: 'lastStateTime',
        width: '40%'
    }
];


const deviceCard = (device, i) => (
    <div key={i}>
        <Card
            title={device.Name}
            hoverable
            style={{ width: 300, justifyContent: "center", marginTop: "5px" }}
            actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />
            ]}>
            <div>
                <p><b>Device Id:</b>{" "}{device.Id}</p>
                <p><b>Status:</b>{" "}{device.State === 0 ? "Connected" : (device.State === 1 ? "Disconnected" : "Unknown")}</p>
                <p><b>Last status change:</b>{" "}{new Date(device.LastStateTime).toLocaleDateString(DATE_LOCALE, DATE_OPTIONS)}</p>
            </div>
        </Card>
    </div>
)

const getDevices = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/device/get_device?userId=${ownerId}`);
    return result.data;
}

const ManageDevices = (props) => {
    const { status, data, error } = useQuery(
        'devices',
        () => {
            return getDevices(props.ownerId)
        },
        {
            enabled: props.ownerId == null ? false : true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    );
    const [isModalVisible, setIsModalVisible] = React.useState(props.isModalVisible);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const newDeviceCard = () => (
        <div style={{ padding: "25px" }}>
            <Card title="Add new device" hoverable style={{ width: 300, justifyContent: "center" }} onClick={toggleModal}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "3rem", padding: "50px" }}>
                    <PlusOutlined />
                </div>
            </Card>
        </div>
    );

    var tableData = [];

    if (status === 'error') {
        return (
            <span>Error: {error.message}</span>
        );
    } else if (status === 'loading') {
        return (
            <span>Loading...</span>
        );
    }

    if (data.length > 5) {
        data.map((device, index) => tableData.push({
            key: index,
            id: device.Id,
            name: device.Name,
            state: device.State === 0 ? "Connected" : (device.State === 1 ? "Disconnected" : "Unknown"),
            lastStateTime: new Date(device.LastStateTime).toLocaleDateString(DATE_LOCALE, DATE_OPTIONS)
        }));
    }

    return (
        <div>
            <RegisterDevice
                isModalVisible={isModalVisible}
                toggleModal={toggleModal}
                ownerId={props.ownerId}
            />
            {
                data.length <= 5 ?
                    <div style={{ display: "flex", flexWrap: "wrap", width: "100%", justifyContent: "space-around", alignItems: "center" }}>
                        {
                            data.map((device, i) => deviceCard(device, i))
                        }
                        {
                            newDeviceCard()
                        }
                    </div> :
                    <div>
                        <Table
                            columns={columns}
                            dataSource={tableData}
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={toggleModal}
                        >
                            Add Device
                        </Button>
                    </div>
            }
        </div>
    );
}

export default ManageDevices;