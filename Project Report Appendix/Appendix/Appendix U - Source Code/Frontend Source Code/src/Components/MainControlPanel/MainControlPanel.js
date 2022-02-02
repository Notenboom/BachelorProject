import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
    BulbOutlined,
    UsbOutlined,
    AreaChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useHistory } from 'react-router';

import MonitorElectrictyConsumption from '../MonitorElectricityConsumption/MonitorElectrictyConsumption';
import ManageDevices from '../ManageDevices/ManageDevices';
import ViewHistoricalData from '../ViewHistoricalData/ViewHistoricalData';
import GenerateConsumptionReport from '../GenerateConsumptionReport/GenerateConsumptionReport';
import UserProfile from '../UserProfile/UserProfile';

import { auth } from '../../Utils/utilities';

import './MainControlPanel.css';

const { Header, Content, Sider } = Layout;

const { Title } = Typography;

const siderMenuItems = [
    {
        key: 0,
        icon: <BulbOutlined />,
        textValue: "Monitor Electricity Consumption",
        component: (ownerId) => (<MonitorElectrictyConsumption ownerId={ownerId}/>)
    },
    {
        key: 1,
        icon: <UsbOutlined />,
        textValue: "Manage Devices",
        component: (ownerId) => (<ManageDevices ownerId={ownerId}/>)
    },
    {
        key: 2,
        icon: <AreaChartOutlined />,
        textValue: "View Historical Data",
        component: (ownerId) => (<ViewHistoricalData ownerId={ownerId}/>)
    },
    {
        key: 3,
        icon: <FileTextOutlined />,
        textValue: "Consumption Reports",
        component: (ownerId) => (<GenerateConsumptionReport ownerId={ownerId}/>)
    },
    {
        key: 4,
        icon: <UserOutlined />,
        textValue: "User Profile",
        component: (ownerId) => (<UserProfile ownerId={ownerId}/>)
    },
    {
        key: -1, 
        icon: <LogoutOutlined />,
        textValue: "Sign out",
        component: () => (<div>21</div>)
    }
];

const MainControlPanel = () => {
    const { push } = useHistory();
    const [user, loading, error] = useAuthState(auth);
    const [collapsed, setCollapsed] = React.useState(false);
    const [selectedView, setSelectedView] = React.useState(siderMenuItems[0]);

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    const handleClick = (e) => {
        if(parseInt(e.key) === -1)
        {
            auth.signOut();
            push('/signup');
            return;
        }

        setSelectedView(siderMenuItems.find(item => item.key === parseInt(e.key)));
    }

    return (
        <Layout style={{ height: "100vh" }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
            >
                <div className="logo">
                    Electricity Monitoring Assistant
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={selectedView}
                    onClick={handleClick}
                >
                    {
                        siderMenuItems.map(item => (
                            <Menu.Item key={item.key} icon={item.icon}>
                                {item.textValue}
                            </Menu.Item>
                        ))
                    }
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0, display: "flex", flexDirection: "row" }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggle,
                    })}
                    <div style={{ display: "flex", justifyContent: "center", width: "100%"}}>
                        <Title style={{marginTop: 0, margin: "auto"}}>
                            {selectedView.textValue}
                        </Title>
                    </div>
                </Header>
                <Content className="site-layout-background site-content">
                    {selectedView.component(user ? user._delegate.uid : null)}
                </Content>
            </Layout>
        </Layout>
    );
}

export default MainControlPanel;