import React from 'react';

import {
    Button,
    Dropdown,
    Menu
} from 'antd';

import {
    DownOutlined,
    SyncOutlined
} from '@ant-design/icons';

import './RefetchFrequencySelector.js';


const RefetchFrequencySelector = (props) => {
    const handleMenuClick = (e) => {
        var selectedItem = props.menuItems.find(item => item.key === parseInt(e.key));
        props.callBack(selectedItem);
    };

    const menuRefresh = (
        <Menu onClick={handleMenuClick}>
            {
                props.menuItems.map(item => (
                    <Menu.Item key={`${item.key}`}>
                        {item.text}
                    </Menu.Item>
                ))
            }
        </Menu>
    );
    
    return (
        <Dropdown overlay={menuRefresh}>
            <Button>
                <SyncOutlined/> 
                {props.selectedItem.text} 
                <DownOutlined />
            </Button>
        </Dropdown>
    );
}

export default RefetchFrequencySelector;
