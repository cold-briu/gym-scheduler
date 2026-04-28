/**
 * SHARED CALENDAR MOCK
 * Centralized to ensure consistent behavior across all handler tests.
 */
export const MockCalendar = {
    createAllDayEventSeries: jest.fn(),
    createAllDayEvent: jest.fn(),
};

export const CalendarAppMock = {
    getCalendarById: jest.fn().mockReturnValue(MockCalendar),
    newRecurrence: jest.fn().mockImplementation(() => ({
        addYearlyRule: jest.fn().mockReturnThis(),
    })),
};

export const UtilitiesMock = {
    formatDate: jest.fn().mockImplementation((date, timezone, format) => {
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
                getTitle: jest.fn().mockReturnValue("nombre"),
                asListItem: jest.fn().mockImplementation(() => ({
                    setChoiceValues: jest.fn(),
                })),
            }
        ]),
    })),
};

/**
 * SETUP GAS MOCKS
 * Resets all calls and injects mocks into the global scope.
 */
export const setupGasMocks = () => {
    jest.clearAllMocks();
    
    // Ensure default behavior is restored (in case a test used .mockReturnValueOnce)
    CalendarAppMock.getCalendarById.mockReturnValue(MockCalendar);

    global.CalendarApp = CalendarAppMock;
    global.Utilities = UtilitiesMock;
    global.SpreadsheetApp = SpreadsheetAppMock;
    global.FormApp = FormAppMock;
};
