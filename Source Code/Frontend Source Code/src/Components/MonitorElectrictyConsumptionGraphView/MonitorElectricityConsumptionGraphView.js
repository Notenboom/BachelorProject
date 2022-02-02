import React from 'react';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    createContainer,
    VictoryLegend
} from 'victory';

import { COLORS } from '../../Utils/config';

import './MonitorElectricityConsumptionGraphView.css';

const MonitorElectrictyConsumptionGraphView = (props) => {
    var victoryData = {};
    var dataKeys = [];

    for (const [key, value] of Object.entries(props.consumptionData)) {
        victoryData[key] = [];
        dataKeys.push(key);
        props.consumptionData[key].map(message => victoryData[key].push({
            x: new Date(message.Timestamp),
            y: message.Consumption
        }));
    }

    const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");
    return (
        <div style={{ margin: "auto" }}>
            <VictoryChart
                containerComponent={
                    <VictoryZoomVoronoiContainer
                        voronoiDimension="x"
                    />
                }
                height={300}
                width={700}
                scale={{ x: "time" }}
                theme={VictoryTheme.material}
            >
                <VictoryLegend x={200} y={280}
                    orientation="horizontal"
                    centerTitle
                    gutter={20}
                    colorScale={COLORS}
                    data={props.selectedDevices.map(item => { return { name: item.Name } })}
                />
                {
                    dataKeys.map((key, i) => (
                        <VictoryLine
                            key={key}
                            style={{
                                parent: { border: "1px solid #ccc" },
                                data: { stroke: COLORS[i] }
                            }}
                            data={victoryData[key]}
                        />
                    ))
                }
            </VictoryChart>
        </div>
    );
}


export default MonitorElectrictyConsumptionGraphView;