import React from 'react';
import {
    VictoryChart,
    VictoryBar,
    VictoryTheme,
    VictoryAxis,
    VictoryStack,
    VictoryLabel,
    VictoryLegend
} from 'victory';

import { COLORS } from '../../Utils/config';
import './ViewHistoricalDataGraphView.css'

var months = [
    {
        id: 1,
        value: "Jan",
        long: "January",
        days: 31
    },
    {
        id: 2,
        value: "Feb",
        long: "February",
        days: 28
    }
    ,
    {
        id: 3,
        value: "Mar",
        long: "March",
        days: 31
    },
    {
        id: 4,
        value: "Apr",
        long: "April",
        days: 30
    },
    {
        id: 5,
        value: "May",
        long: "May",
        days: 31
    },
    {
        id: 6,
        value: "Jun",
        long: "June",
        days: 30
    },
    {
        id: 7,
        value: "Jul",
        long: "July",
        days: 31
    },
    {
        id: 8,
        value: "Aug",
        long: "August",
        days: 31
    },
    {
        id: 9,
        value: "Sep",
        long: "September",
        days: 30
    },
    {
        id: 10,
        value: "Oct",
        long: "October",
        days: 31
    },
    {
        id: 11,
        value: "Nov",
        long: "November",
        days: 30
    },
    {
        id: 12,
        value: "Dec",
        long: "December",
        days: 31
    }
]

const ViewHistoricalDataGraphView = (props) => {
    const dataKeys = [];

    for (var key in props.historicalData) {
        dataKeys.push(key);
    }

    var title = "";
    var tickValues = [];
    var tickFormat = []

    if (props.resolution === 0) {
        title = `${months.find(x => x.id === props.period.month).long} ${props.period.year}`;
        tickValues = [...Array(months.find(x => x.id === props.period.month).days).keys()].map(i => i + 1)
        tickFormat = [...Array(months.find(x => x.id === props.period.month).days).keys()].map(i => i + 1)

    } else if (props.resolution === 1) {
        title = `Year ${props.period.year}`;
        tickValues = months.map(item => item.id);
        tickFormat = months.map(item => item.value)
    }
    else {
        title = "Entire period"
        tickValues = [2021, 2022, 2023];
        tickFormat = [2021, 2022, 2023];
    }

    return (
        <VictoryChart
            height={300}
            width={700}
            theme={VictoryTheme.material}
            domainPadding={50}
        >
            <VictoryLegend x={200} y={280}
                orientation="horizontal"
                centerTitle
                gutter={20}
                colorScale={COLORS}
                data={props.selectedDevices.map(item => {return {name: item.Name}})}
            />
            <VictoryLabel text={title} x={350} y={30} textAnchor="middle" />
            <VictoryAxis
                dependentAxis
                axisLabelComponent={<VictoryLabel x={20} />}
                label="kWh"
            />
            <VictoryAxis
                tickValues={tickValues}
                tickFormat={tickFormat}
            />
            <VictoryStack
                colorScale={COLORS}
            >
                {
                    dataKeys.map((key, i) => (
                        <VictoryBar
                            key={i}
                            data={props.historicalData[key]}
                            barWidth={props.resolution === 0 ? 10 : 30}
                            events={[
                                {
                                    target: "data",
                                    eventHandlers: {
                                        onClick: () => {
                                            return [{
                                                mutation: (innerProps) => {
                                                    var period = null;

                                                    if (props.resolution === 1) {
                                                        period = {
                                                            year: props.period.year,
                                                            month: innerProps.datum.x
                                                        }
                                                    } else if (props.resolution === 2) {
                                                        period = {
                                                            year: innerProps.datum.x,
                                                            month: 1
                                                        }
                                                    }

                                                    props.resolutionCallback(false, period)
                                                }
                                            }];
                                        }
                                    }
                                }]}

                        />
                    ))
                }
            </VictoryStack>
        </VictoryChart>
    );
};

export default ViewHistoricalDataGraphView;