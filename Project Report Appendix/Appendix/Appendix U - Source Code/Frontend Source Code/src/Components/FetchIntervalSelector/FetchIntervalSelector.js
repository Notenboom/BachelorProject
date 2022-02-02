import React from 'react';

import {
    Button,
    Dropdown,
    Menu
} from 'antd';

import {
    DownOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

import './FetchIntervalSelector.css';


const FetchIntervalSelector = (props) => {
    const handleMenuClick = (e) => {
        var selectedItem = props.menuItems.find(item => item.key === parseInt(e.key));
        props.callBack(selectedItem);
    };

    const menuInterval = (
        <Menu onClick={handleMenuClick}>
            {
                props.menuItems.map(item => (
                    <Menu.Item key={item.key}>
                        {item.text}
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    return (
        <Dropdown
            overlay={menuInterval}>
            <Button>
                <ClockCircleOutlined />
                {props.selectedItem.text}
                <DownOutlined />
            </Button>
        </Dropdown>
    );
}

export default FetchIntervalSelector;