import React from "react";

import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";

import FetchIntervalSelector from './FetchIntervalSelector';

//Arrange
var menuItems = [
    {
        key: "1",
        text: "Interval 1"
    },
    {
        key: "1",
        text: "Interval 2"
    },
    {
        key: "999",
        text: "Interval Selected"
    }
];

var selectedItem = {
    key: "999",
    text: "Interval Selected"
}

describe(
    "<FetchIntervalSelector />",
    () => {
        test(
            "Renders the interval selector component, with the selected item",
            () => {
                //Act
                render(
                    <FetchIntervalSelector
                        menuItems={menuItems}
                        selectedItem={selectedItem}
                        callback={() => { }}
                    />);

                //Assert
                expect(
                    screen
                        .getByText(/Interval Selected/i))
                        .toBeInTheDocument();
            }
        );
    }
);