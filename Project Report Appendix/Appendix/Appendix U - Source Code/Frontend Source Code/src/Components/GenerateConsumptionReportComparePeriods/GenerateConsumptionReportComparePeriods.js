import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { DatePicker, Row, Col, Table, Button, Card, Statistic } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined } from '@ant-design/icons';
import {
    VictoryPie,
    VictoryLegend,
    VictoryLabel
} from 'victory';
import moment from 'moment';

import { HOST, COLORS } from '../../Utils/config';
import SelectDevice from '../SelectDevice/SelectDevice';

import './GenerateConsumptionReportComparePeriods.css';

const getUserDevices = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/device/get_device?userId=${ownerId}`);
    return result.data;
};

const getStatistics = async (ownerId, periods, deviceIds) => {
    var periodsFiltered = periods.filter(item => item.Value !== null);
    var periodsFormated = '';

    if (periodsFiltered.length <= 1) {
        periodsFormated = `&periods=${periodsFiltered[0].Value[0].unix()}_${periodsFiltered[0].Value[1].unix()}`
    }
    else {
        periodsFormated = periodsFiltered.reduce((previous, current) => `${previous}&periods=${current.Value[0].unix()}_${current.Value[1].unix()}`, '');
    }

    var selectedDeviceApiString = deviceIds.reduce((previous, current) => `${previous}&deviceIds=${current}`, '');
    const result = await axios.get(`${HOST}/api/data/get_period_comparation?ownerId=${ownerId}${periodsFormated}${selectedDeviceApiString}`);
    return result.data;
};

const GenerateConsumptionReportComparePeriods = (props) => {
    const [selectedDevices, setSelectedDevices] = React.useState([]);
    const [periods, setPeriods] = React.useState([{
        Id: Math.floor(Math.random() * 10000),
        Value: null,
    }]);

    const { RangePicker } = DatePicker;
    const { Column } = Table;

    const { status: statusDevices, data: devicesData, error: errorData } = useQuery(
        'userDevicesPeriods',
        () => getUserDevices(props.ownerId),
        {
            enabled: props.ownerId == null ? false : true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    )

    const { status: statusStatistics, data: dataStatistics, error: errorStatistics } = useQuery(
        ['statisticsComparePeriods', selectedDevices, periods],
        () => getStatistics(props.ownerId, periods, selectedDevices.map(device => device.Id)),
        {
            enabled: (props.ownerId == null ? false : true) && (selectedDevices.length > 0 ? true : false),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        }
    );

    if (statusStatistics === "success") {
        console.log(dataStatistics);
        var victoryData = dataStatistics.totalPeriodsProportional.map((item, i) => { return { x: i, y: (Math.round((item + Number.EPSILON) * 100)) } })

    }


    const selectedDevicesChange = (devices) => {
        var selectedDevicesFiltered = [];
        devices.map(deviceName => selectedDevicesFiltered.push(devicesData.filter(device => device.Name === deviceName)[0]));
        setSelectedDevices(selectedDevicesFiltered);
    }

    const handleDateTimeChange = (item, value) => {
        var tempPeriods = periods.filter(date => date.Id !== item)
        setPeriods([...tempPeriods, { Id: item, Value: value }])
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
                        <Row>
                            <Col span={10}>
                                <div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div>
                                            {
                                                periods.map((item, i) => (
                                                    <div key={i}>
                                                        <span style={{marginRight: "10px"}}>{String.fromCodePoint(65 + i)}:</span>
                                                        <RangePicker
                                                            value={item.Value}
                                                            showTime
                                                            ranges={{
                                                                Today: [moment().startOf('day'), moment().endOf('day')],
                                                                'Current Month': [moment().startOf('month'), moment().endOf('month')],
                                                                'Current Quarter': [moment().startOf('quarter'), moment().endOf('quarter')],
                                                                'Current Year': [moment().startOf('year'), moment().endOf('year')]
                                                            }}
                                                            onChange={(e) => handleDateTimeChange(item.Id, e)}
                                                            style={{ margin: "20px 20px 5px 0px" }}
                                                        />
                                                        {periods.length === 1 ? "" : <Button type="danger" icon={<DeleteOutlined />} onClick={() => setPeriods(periods.filter(date => date.Id !== item.Id))} />}
                                                    </div>))
                                            }

                                        </div>
                                        <div>
                                            <Button
                                                style={{ margin: "5px 20px 20px 0px" }}
                                                disabled={periods.length >= 4 ? true : false}
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => setPeriods([...periods, { Id: Math.floor(Math.random() * 100), Value: null }])}
                                            >Add Another Period</Button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={14}>
                                {
                                    statusStatistics === "success" ?
                                        <Row>
                                            <Col span={10}>
                                                <svg width={300} height={400}>
                                                    <VictoryLabel
                                                        textAnchor="middle"
                                                        style={{ fontSize: 20 }}
                                                        x={200} y={200}
                                                    />
                                                    <VictoryLegend
                                                        standalone={false}
                                                        orientation="horizontal"
                                                        colorScale={COLORS}
                                                        x={60} y={320}
                                                        gutter={20}
                                                        centerTitle
                                                        style={{ border: { stroke: "black" } }}
                                                        data={periods.map((item, i) => { return { name: String.fromCodePoint(65 + i)} })}
                                                    />
                                                    <VictoryPie
                                                        standalone={false}
                                                        width={300} height={300}
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
                                            <Col span={14}>
                                                <Row>
                                                    <Col span={12}>
                                                        {
                                                            dataStatistics.dayAveragePeriods.map((item, i) =>
                                                                <Card style={{ marginTop: "10px", marginBot: "10px", marginRight: "10px" }}>
                                                                    <Statistic
                                                                        title={`Period ${String.fromCharCode(65 + i)} Average Day`}
                                                                        value={item}
                                                                        precision={2}
                                                                        suffix="kWh"
                                                                    />
                                                                </Card>
                                                            )
                                                        }
                                                    </Col>
                                                    <Col span={12}>
                                                        {
                                                            dataStatistics.hourAveragePeriods.map((item, i) =>
                                                                <Card style={{ marginTop: "10px", marginBot: "10px", marginRight: "10px" }}>
                                                                    <Statistic
                                                                        title={`Period ${String.fromCharCode(65 + i)} Average Hour`}
                                                                        value={item}
                                                                        precision={2}
                                                                        suffix="kWh"
                                                                    />
                                                                </Card>
                                                            )
                                                        }
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row> : ""
                                }
                            </Col>
                        </Row>
                    </div> : ""
            }
        </div >
    );
}

export default GenerateConsumptionReportComparePeriods;