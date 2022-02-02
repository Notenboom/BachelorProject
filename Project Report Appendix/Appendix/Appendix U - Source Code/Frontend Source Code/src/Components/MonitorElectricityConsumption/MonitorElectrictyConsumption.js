import React from 'react';
import { Tabs, Space } from 'antd';
import axios from 'axios';
import { useQuery } from 'react-query';

import { HOST } from '../../Utils/config';


import SelectDevice from '../SelectDevice/SelectDevice';
import FetchIntervalSelector from '../FetchIntervalSelector/FetchIntervalSelector';
import RefetchFrequencySelector from '../RefetchFrequencySelector/RefetchFrequencySelector';
import MonitorElectrictyConsumptionGraphView from '../MonitorElectrictyConsumptionGraphView/MonitorElectricityConsumptionGraphView';
import MonitorElectricityConsumptionTableView from '../MonitorElectricityConsumptionTableView/MonitorElectricityConsumptionTableView';

import './MonitorElectrictyConsumption.css';

const { TabPane } = Tabs;

const tabViews = [
    {
        key: 0,
        tabName: "Graph View",
        component: (data, selectedDevices) => (
            <MonitorElectrictyConsumptionGraphView
                consumptionData={data}
                selectedDevices={selectedDevices}
            />
        )
    },
    {
        key: 1,
        tabName: "Table View",
        component: (data, selectedDevices) => (
            <MonitorElectricityConsumptionTableView
                consumptionData={data}
                selectedDevices={selectedDevices}
            />
        )
    }
]

const menuItemsRefetchFrequency = [
    {
        key: 1,
        text: 'none',
        values: 0
    },
    {
        key: 2,
        text: '1s',
        values: 1000
    },
    {
        key: 3,
        text: '5s',
        values: 5 * 1000
    },
    {
        key: 4,
        text: '10s',
        values: 10 * 1000
    },
    {
        key: 5,
        text: '1m',
        values: 60 * 1000
    },
    {
        key: 6,
        text: '5m',
        values: 5 * 60 * 1000
    },
    {
        key: 7,
        text: '15m',
        values: 15 * 60 * 1000
    }
]

const menuItemsFetchInterval = [
    {
        key: 1,
        text: 'Last 1 hour',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60] }
    },
    {
        key: 2,
        text: 'Last 3 hours',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 3] }
    },
    {
        key: 3,
        text: 'Last 6 hours',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 6] }
    },
    {
        key: 4,
        text: 'Last 12 hours',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 12] }
    },
    {
        key: 5,
        text: 'Last 24 hours',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 24] }
    },
    {
        key: 6,
        text: 'Last 2 days',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 2] }
    },
    {
        key: 7,
        text: 'Last 7 days',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7] }
    },
    {
        key: 8,
        text: 'Last 2 weeks',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 14] }
    },
    {
        key: 9,
        text: 'Last 1 month',
        values: () => { return [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30] }
    }
];

const getUserDevices = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/device/get_device?userId=${ownerId}`);
    return result.data;
};

const getConsumption = async (ownerId, from, to, deviceIds) => {
    var selectedDeviceApiString = deviceIds.reduce((previous, current) => `${previous}&deviceIds=${current}`, '');
    const result = await axios.get(`${HOST}/api/data/get_data?ownerId=${ownerId}&from=${from}&to=${to}${selectedDeviceApiString}`);
    return result.data;
};

const MonitorElectrictyConsumption = (props) => {
    const [refetchFrequency, setRefetchFrequency] = React.useState(menuItemsRefetchFrequency[0]);
    const [fetchInterval, setFetchInterval] = React.useState(menuItemsFetchInterval[3]);
    const [defaultTab, setDefaultTab] = React.useState(0);
    const [selectedDevices, setSelectedDevices] = React.useState([]);

    const handleRefetchFrequency = (newRefetchFrequency) => {
        setRefetchFrequency(newRefetchFrequency);
    }

    const handleFetchInterval = (newFetchInterval) => {
        setFetchInterval(newFetchInterval);
    }

    const { status: statusDevices, data: devicesData, error: errorData } = useQuery(
        'userDevicesMonitoring',
        () => getUserDevices(props.ownerId),
        {
            enabled: props.ownerId == null ? false : true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    )

    const { status, data, error } = useQuery(
        ['consumptionData', fetchInterval, selectedDevices],
        () => {
            var interval = fetchInterval.values();
            return getConsumption(props.ownerId, interval[1], interval[0], selectedDevices.map(device => device.Id));
        },
        {
            enabled: (props.ownerId == null ? false : true) && (selectedDevices.length > 0 ? true : false),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchInterval: refetchFrequency.values
        }
    );

    const selectedDevicesChange = (devices) => {
        var selectedDevicesFiltered = [];
        devices.map(deviceName => selectedDevicesFiltered.push(devicesData.filter(device => device.Name === deviceName)[0]));
        setSelectedDevices(selectedDevicesFiltered);
    }

    if (status === 'error') {
        return (
            <span>Error: {error.message}</span>
        );
    }

    return (
        <div>
            {
                statusDevices === 'success' ?
                    <div>
                        <SelectDevice
                            devices={devicesData}
                            callback={selectedDevicesChange}
                            selectedDevices={selectedDevices}
                        />
                        <Tabs activeKey={`${defaultTab}`} onChange={(activeKey) => setDefaultTab(activeKey)}>
                            {
                                status === 'success' ?
                                    tabViews.map(tabView => (
                                        <TabPane tab={tabView.tabName} key={tabView.key}>
                                            <Space style={{ paddingBottom: "10px" }}>
                                                <RefetchFrequencySelector
                                                    menuItems={menuItemsRefetchFrequency}
                                                    selectedItem={refetchFrequency}
                                                    callBack={handleRefetchFrequency}
                                                />
                                                <FetchIntervalSelector
                                                    menuItems={menuItemsFetchInterval}
                                                    selectedItem={fetchInterval}
                                                    callBack={handleFetchInterval}
                                                />
                                            </Space>
                                            {tabView.component(data, selectedDevices)}
                                        </TabPane>
                                    ))
                                    : ""
                            }
                        </Tabs>
                    </div>
                    : ""
            }
        </div>
    );
}

export default MonitorElectrictyConsumption;