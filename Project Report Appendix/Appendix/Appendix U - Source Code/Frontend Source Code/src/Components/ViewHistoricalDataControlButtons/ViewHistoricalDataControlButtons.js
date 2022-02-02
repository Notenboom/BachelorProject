import React from 'react';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';

import './ViewHistoricalDataControlButtons.css';


const ViewHistoricalDataControlButtons = (props) => {
    return (
        <div>
            <ArrowLeftOutlined className={"icons left-icon"} onClick={() => props.periodCallback(false)} />
            <ArrowRightOutlined className={"icons right-icon"} onClick={() => props.periodCallback(true)} />
            <ArrowUpOutlined className={"icons up-icon"} onClick={() => props.resolutionCallback(true, null)}/>
        </div>
    );
}

export default ViewHistoricalDataControlButtons;