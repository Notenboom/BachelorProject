import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { DatePicker, Row, Col, Table } from 'antd';
import {
    VictoryPie,
    VictoryLegend,
    VictoryLabel
} from 'victory';
import moment from 'moment';
import { HOST, COLORS } from '../../Utils/config';
import SelectDevice from '../SelectDevice/SelectDevice';

import './GenerateConsumptionReportCompareDevices.css';

const getUserDevices = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/device/get_device?userId=${ownerId}`);
    return result.data;
};

const getStatistics = async (ownerId, fromTo, deviceIds) => {
    var from = fromTo[0].unix();
    var to = fromTo[1].unix();
    var selectedDeviceApiString = deviceIds.reduce((previous, current) => `${previous}&deviceIds=${current}`, '');

    const result = await axios.get(`${HOST}/api/data/get_device_comparation?ownerId=${ownerId}&from=${from}&to=${to}${selectedDeviceApiString}`);
    return result.data;
};

const createTableData = (dataStatistics, selectedDevices) => {
    var data = [];

    var totalObjectTemplate = {
        key: "1",
        name: "Total Consumption"
    }

    var maxDayObjectTemplate = {
        key: "2",
        name: "Highest Consumption Day"
    }

    var minDayObjectTemplate = {
        key: "3",
        name: "Lowest Consumption Day"
    }

    var avgDayObjectTemplate = {
        key: "4",
        name: "Avgerage Consumption Day"
    }

    var maxHourObjectTemplate = {
        key: "5",
        name: "Highest Consumption Hour"
    }

    var minHourObjectTemplate = {
        key: "6",
        name: "Lowest Consumption Hour"
    }

    var avgHourObjectTemplate = {
        key: "7",
        name: "Avgerage Consumption Hour"
    }

    selectedDevices.map(device => {
        totalObjectTemplate[device.Id] = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .Total;

        var tempMaxDay = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .MaxDay;

        var tempMaxDayDate = new Date(tempMaxDay.Date);
        maxDayObjectTemplate[device.Id] = `${tempMaxDay.Value} on ${tempMaxDayDate.getDate()}.${tempMaxDayDate.getMonth() + 1}`;

        avgDayObjectTemplate[device.Id] = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .AverageDay;

        var tempMinDay = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .MinDay;

        var tempMinDayDate = new Date(tempMinDay.Date);
        minDayObjectTemplate[device.Id] = `${tempMinDay.Value} on ${tempMinDayDate.getDate()}.${tempMinDayDate.getMonth() + 1}`;

        var tempMaxHour = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .MaxHour;

        var tempMaxHourDate = new Date(tempMaxHour.Date);
        maxHourObjectTemplate[device.Id] = `${tempMaxHour.Value} Hour: ${tempMaxHourDate.getHours()} on ${tempMaxHourDate.getDate()}.${tempMaxHourDate.getMonth() + 1}`;

        avgHourObjectTemplate[device.Id] = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .AverageHour;


        var tempMinHour = dataStatistics
            .DevicesTotal
            .find(item => item.DeviceId === device.Id)
            .MinHour;

        var tempMinHourDate = new Date(tempMinHour.Date);
        minHourObjectTemplate[device.Id] = `${tempMinHour.Value} Hour: ${tempMinHourDate.getHours()} on ${tempMinHourDate.getDate()}.${tempMinHourDate.getMonth() + 1}`;
    })

    data.push(
        totalObjectTemplate,
        maxDayObjectTemplate,
        minDayObjectTemplate,
        avgDayObjectTemplate,
        maxHourObjectTemplate,
        minHourObjectTemplate,
        avgHourObjectTemplate
    );
    return data;
}

const GenerateConsumptionReportCompareDevices = (props) => {

    const [selectedDevices, setSelectedDevicesFirst] = React.useState([]);
    const [selectedTime, setSelectedTimeFirst] = React.useState([]);

    const { status: statusDevices, data: devicesData, error: errorData } = useQuery(
        'userDevicesConsumption',
        () => getUserDevices(props.ownerId),
        {
            enabled: props.ownerId == null ? false : true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    )

    const { status: statusStatistics, data: dataStatistics, error: errorStatistics } = useQuery(
        ['statisticsCompareDevices', selectedDevices, selectedTime],
        () => getStatistics(props.ownerId, selectedTime, selectedDevices.map(device => device.Id)),
        {
            enabled: (props.ownerId == null ? false : true) && (selectedDevices.length > 0 ? true : false) && (selectedTime.length > 0 ? true : false),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        }
    );

    if (statusStatistics === 'success') {
        var dataFirstDevice = createTableData(dataStatistics, selectedDevices);
        var victoryData = dataStatistics.DevicesProportions.map(item => { return { ...item, x: selectedDevices.find(device => device.Id === item.x).Name } })
    }

    const { RangePicker } = DatePicker;
    const { Column } = Table;

    const selectedDevicesChange = (devices) => {
        var selectedDevicesFiltered = [];
        devices.map(deviceName => selectedDevicesFiltered.push(devicesData.filter(device => device.Name === deviceName)[0]));
        setSelectedDevicesFirst(selectedDevicesFiltered);
    }

    const handleDateTimeChange = (value) => {
        setSelectedTimeFirst(value);
    }

    return (
        <div>
            {
                statusDevices === 'success' ?
                    <div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <SelectDevice
                                devices={devicesData}
                                callback={selectedDevicesChange}
                                selectedDevices={selectedDevices}
                                style={{ margin: "20px 60px 0px 0px" }}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <RangePicker
                                showTime
                                ranges={{
                                    Today: [moment().startOf('day'), moment().endOf('day')],
                                    'Current Month': [moment().startOf('month'), moment().endOf('month')],
                                    'Current Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
                                    'Current Year': [moment().startOf('year'), moment().endOf('year')]
                                  }}
                                onChange={handleDateTimeChange}
                                style={{ margin: "20px 20px 20px 0px" }}
                            />
                        </div>
                        {
                            statusStatistics === 'success' ?
                                <div>
                                    <Row>
                                        <Col span={16}>

                                            <Table dataSource={dataFirstDevice} pagination={false}>
                                                <Column title="Name" dataIndex="name" key="name" />
                                                {
                                                    selectedDevices.map(device => (
                                                        <Column
                                                            title={`${device.Name} (kWh)`}
                                                            dataIndex={device.Id}
                                                            key={`value_${device.DeviceId}`}
                                                        />
                                                    ))
                                                }
                                            </Table>


                                        </Col>
                                        <Col span={8} style={{ padding: "10px" }}>
                                            <svg style={{ border: "1px solid #ccc" }} width={400} height={450}>
                                                <VictoryLabel
                                                    textAnchor="middle"
                                                    style={{ fontSize: 20 }}
                                                    x={200} y={200}
                                                />
                                                <VictoryLegend standalone={false}
                                                    colorScale={COLORS}
                                                    x={140} y={320}
                                                    gutter={20}
                                                    centerTitle
                                                    style={{ border: { stroke: "black" } }}
                                                    data={selectedDevices.map(item => { return { name: item.Name } })}
                                                />
                                                <VictoryPie
                                                    standalone={false}
                                                    width={400} height={300}
                                                    padding={{
                                                        left: 10, bottom: 10, top: 10, right: 10
                                                    }}
                                                    colorScale={COLORS}
                                                    data={victoryData}
                                                    labels={({ datum }) => `${datum.y}%`}
                                                    labelRadius={90}
                                                    style={{ labels: { fontSize: 15, fill: "white" } }}
                                                />

                                            </svg>
                                        </Col>
                                    </Row>
                                </div> : ""
                        }
                    </div>
                    : ""
            }
        </div>
    );
}

export default GenerateConsumptionReportCompareDevices;