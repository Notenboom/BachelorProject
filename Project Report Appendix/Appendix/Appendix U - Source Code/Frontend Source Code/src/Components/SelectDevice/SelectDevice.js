import React from 'react';
import { Select } from 'antd';

import './SelectDevice.css';

const SelectDevice = (props) => {

    var selectedDevicesId = []
    props.selectedDevices.map(device => selectedDevicesId.push(device.Id))

    const handleChange = (e) => {
        props.callback(e);
    };
    
    const filteredOptions = props.devices.filter(device => !selectedDevicesId.includes(device.Id));

    return (
        <Select 
        mode="multiple" 
        style={{...props.style, width: '100%' }} 
        placeholder="Select Device" 
        onChange={handleChange}>
            {filteredOptions.map(item => (
          <Select.Option key={item.Id} value={item.Name}>
            {item.Name}
          </Select.Option>
        ))}
        </Select>
    );
};

export default SelectDevice;
