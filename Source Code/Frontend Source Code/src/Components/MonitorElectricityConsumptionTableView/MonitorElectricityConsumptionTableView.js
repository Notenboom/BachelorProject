import React from 'react';
import {
    Table
} from 'antd';
import 'antd/dist/antd.css';

import { DATE_LOCALE, DATE_OPTIONS } from '../../Utils/config';

import './MonitorElectricityConsumptionTableView.css';

const columns = [
    {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: '20%'
    },
    {
        title: 'DeviceId',
        dataIndex: 'deviceId',
        key: 'deviceId',
        width: '20%'
    },
    {
        title: 'DeviceName',
        dataIndex: 'deviceName',
        key: 'deviceName',
        width: '20%'
    },
    {
        title: 'OwnerId',
        dataIndex: 'ownerId',
        key: 'ownerId',
        width: '25%'
    },
    {
        title: 'Consumption (kWh)',
        dataIndex: 'consumption',
        key: 'consumption',
        width: '15%'
    }
];

const TableView = (props) => {
    const tempArray = [];

    for (const [key, value] of Object.entries(props.consumptionData)) {
        tempArray.push(...props.consumptionData[key]);
    };

    var tableData = [];

    tempArray.map((message, index) => tableData.push({
        key: index,
        timestamp: new Date(message.Timestamp),
        deviceId: message.DeviceId,
        ownerId: message.OwnerId,
        consumption: message.Consumption,
        deviceName: props.selectedDevices.find(item => item.Id === message.DeviceId).Name
    }));

    tableData
        .sort((x, y) => {
            return x.timestamp - y.timestamp;
        })
        .reverse()
        .map(x => x.timestamp = x.timestamp.toLocaleString(DATE_LOCALE, DATE_OPTIONS));

    return (
        <div>
            <Table
                columns={columns}
                dataSource={tableData}
            />
        </div>
    );
}

export default TableView;