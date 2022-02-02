import React from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';

import { HOST } from '../../Utils/config';
import './ViewHistoricalData.css';

import ViewHistoricalDataGraphView from '../ViewHistoricalDataGraphView/ViewHistoricalDataGraphView';
import SelectDevice from '../SelectDevice/SelectDevice';
import ViewHistoricalDataControlButtons from '../ViewHistoricalDataControlButtons/ViewHistoricalDataControlButtons';

const getUserDevices = async (ownerId) => {
    const result = await axios.get(`${HOST}/api/device/get_device?userId=${ownerId}`);
    return result.data;
};

const getConsumption = async (ownerId, deviceIds, period, resolution) => {

    var selectedDeviceApiString = deviceIds.reduce((previous, current) => `${previous}&deviceIds=${current}`, '');

    var request = "";

    if(resolution === 0) {
        request = `month=${period.month}&year=${period.year}`;
    } else if(resolution === 1) {
        request = `year=${period.year}`
    }

    const result = await axios.get(`${HOST}/api/data/get_aggregated_${resolution}?ownerId=${ownerId}&${request}${selectedDeviceApiString}`);
    return result.data;
};

const ViewHistoricalData = (props) => {
    const [selectedDevices, setSelectedDevices] = React.useState([]);
    const [period, setPeriod] = React.useState({
        year: 2021,
        month: 11
    })
    const [resolution, setResolution] = React.useState(2);

    const { status: statusDevices, data: devicesData, error: errorData } = useQuery(
        'userDevicesHistorical',
        () => getUserDevices(props.ownerId),
        {
            enabled: (props.ownerId == null ? false : true),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
        }
    );

    const { status: statusConsumption, data: dataConsumption, error: errorConsumption } = useQuery(
        ['consumptionDataAggregatedHistorical', selectedDevices, resolution, period],
        () => getConsumption(props.ownerId, selectedDevices.map(device => device.Id), period, resolution),
        {
            enabled: (props.ownerId == null ? false : true) && (selectedDevices.length > 0 ? true : false),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        }
    );

    const resolutionCallback = (flag, newPeriod) =>{
        if(flag && resolution >= 0 && resolution < 2) {
            setResolution(resolution + 1);
            
        } else if (!flag && resolution <= 2 && resolution > 0){
            setResolution(resolution - 1);
        }

        if(newPeriod) {
            setPeriod(newPeriod);
        }
    }

    const periodCallback = (flag) => {
        if(resolution === 0) {
            if(flag) {
                if (period.month >= 12)
                {
                    setPeriod({
                        year: period.year + 1,
                        month: 1
                    });
                } else {
                    setPeriod({
                        year: period.year,
                        month: period.month + 1
                    });
                }
            } else {
                if (period.month <= 1)
                {
                    setPeriod({
                        year: period.year - 1,
                        month: 12
                    });
                } else {
                    setPeriod({
                        year: period.year,
                        month: period.month - 1
                    });
                }
            }
        } else if ( resolution === 1) {
            if (flag) {
                setPeriod({
                    month: period.month,
                    year: period.year + 1
                });
            } else {
                setPeriod({
                    month: period.month,
                    year: period.year - 1
                });
            }
        }
    }

    const selectedDevicesChange = (devices) => {
        var selectedDevicesFiltered = [];
        devices.map(deviceName => selectedDevicesFiltered.push(devicesData.filter(device => device.Name === deviceName)[0]));
        setSelectedDevices(selectedDevicesFiltered);
    }

    return (
        <div>
            {
                statusDevices === 'success' ?
                    <div>
                        <div>
                            <SelectDevice
                                devices={devicesData}
                                callback={selectedDevicesChange}
                                selectedDevices={selectedDevices}
                            />
                        </div>
                        <div>
                            <ViewHistoricalDataControlButtons 
                                periodCallback={periodCallback}
                                resolutionCallback={resolutionCallback}
                            />
                        </div>
                        <div>
                            {
                                statusConsumption === 'success' ?
                                    <ViewHistoricalDataGraphView
                                        historicalData={dataConsumption}
                                        period={period}
                                        resolution={resolution}
                                        resolutionCallback={resolutionCallback}
                                        selectedDevices={selectedDevices}
                                    />
                                    : ''
                            }
                        </div>
                    </div>
                    : ''
            }
        </div>
    );
};

export default ViewHistoricalData;