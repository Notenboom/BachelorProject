import React from 'react';
import { Tabs, Result } from 'antd';

import GenerateConsumptionReportCompareDevices from '../GenerateConsumptionReportCompareDevices/GenerateConsumptionReportCompareDevices';
import GenerateConsumptionReportComparePeriods from '../GenerateConsumptionReportComparePeriods/GenerateConsumptionReportComparePeriods';

import './GenerateConsumptionReport.css';

const { TabPane } = Tabs;

const tabViews = [
    {
        key: 0,
        tabName: "Compare Consumption Devices",
        component: (ownerId) => (
            <GenerateConsumptionReportCompareDevices
                ownerId={ownerId}
            />
        )
    },
    {
        key: 1,
        tabName: "Compare Consumption Periods",
        component: (ownerId) => (
            <GenerateConsumptionReportComparePeriods 
                ownerId={ownerId}
            />
        )
    },
    {
        key: 2,
        tabName: "Define Consumption Reports",
        component: (ownerId) => (
            <Result
                status="500"
                subTitle="Under construction, will be ready soon!"
          />
        )
    }
]

const GenerateConsumptionReport = (props) => {
    const [defaultTab, setDefaultTab] = React.useState(0);

    return (
        <div>
            <Tabs activeKey={`${defaultTab}`} onChange={(activeKey) => setDefaultTab(activeKey)}>
                {
                    tabViews.map(tabView => (
                        <TabPane tab={tabView.tabName} key={tabView.key}>
                            {tabView.component(props.ownerId)}
                        </TabPane>
                    ))
                }
            </Tabs>
        </div>
    );
};

export default GenerateConsumptionReport;