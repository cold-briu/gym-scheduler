export const CalendarAppMock = {
    getCalendarById: jest.fn().mockImplementation(() => ({
        createAllDayEventSeries: jest.fn(),
        createAllDayEvent: jest.fn(),
    })),
    newRecurrence: jest.fn().mockImplementation(() => ({
        addYearlyRule: jest.fn().mockReturnThis(),
    })),
};

export const UtilitiesMock = {
    formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        // Return a mock date string
        return "01/01/2026";
    }),
};

export const SpreadsheetAppMock = {
    getActiveSpreadsheet: jest.fn().mockImplementation(() => ({
        getSheetByName: jest.fn().mockImplementation((name) => ({
            getLastRow: jest.fn().mockReturnValue(2),
            getRange: jest.fn().mockImplementation((row, col, numRows, numCols) => ({
                getValues: jest.fn().mockReturnValue([["Mock Member 1"], ["Mock Member 2"]]),
            })),
        })),
    })),
};

export const FormAppMock = {
    openById: jest.fn().mockImplementation((id) => ({
        getItems: jest.fn().mockReturnValue([
            {
                getTitle: jest.fn().mockReturnValue("nombre"), // Matches CONFIG.PAYMENTS.DROPDOWN_TITLE typically
                asListItem: jest.fn().mockImplementation(() => ({
                    setChoiceValues: jest.fn(),
                })),
            }
        ]),
    })),
};

// Also good practice to provide a setup function to inject these into global scope
export const setupGasMocks = () => {
    global.CalendarApp = CalendarAppMock;
    global.Utilities = UtilitiesMock;
    global.SpreadsheetApp = SpreadsheetAppMock;
    global.FormApp = FormAppMock;
};
