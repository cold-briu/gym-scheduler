import { onMemberSignup } from '../src/handlers.js';
import { CONFIG } from '../src/config.js';
import { getFieldValue } from '../src/utils.js';
import { setupGasMocks, CalendarAppMock } from './utils/gas-mocks.js';
import { mockMemberSignupEvent } from './mock-data/data.js';

describe('onMemberSignup', () => {
    let mockCalendar;

    beforeEach(() => {
        setupGasMocks();
        global.CONFIG = CONFIG;
        global.getFieldValue = getFieldValue;
        
        // Fix "Accidental Integration Testing": Mock updateMemberDropdown
        global.updateMemberDropdown = jest.fn();
        
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Pre-fetch the mock calendar that will be returned
        mockCalendar = CalendarAppMock.getCalendarById.mock.results[0].value;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.CONFIG;
        delete global.getFieldValue;
        delete global.updateMemberDropdown;
        delete global.CalendarApp;
        delete global.Utilities;
        delete global.SpreadsheetApp;
        delete global.FormApp;
    });

    it('triggers updateMemberDropdown and initializes calendar', () => {
        onMemberSignup(mockMemberSignupEvent);
        
        expect(global.updateMemberDropdown).toHaveBeenCalled();
        expect(CalendarAppMock.getCalendarById).toHaveBeenCalledWith(CONFIG.CALENDAR_ID);
    });

    it('creates a yearly recurring birthday event with correct parameters', () => {
        onMemberSignup(mockMemberSignupEvent);

        // Fix "Hardcoded 'Magic' Data": Use values from mock event
        const expectedName = mockMemberSignupEvent.namedValues['Nombre'][0];
        const birthdayString = mockMemberSignupEvent.namedValues['Cumpleaños'][0];
        const birthdayParts = birthdayString.split(/[-/.]/);
        const currentYear = new Date().getFullYear();
        const expectedDate = new Date(currentYear, birthdayParts[1] - 1, birthdayParts[0]);

        // Fix "Missing Date & Parameter Assertions" & "Brittle Mock Traversal"
        expect(mockCalendar.createAllDayEventSeries).toHaveBeenCalled();
        const createCall = mockCalendar.createAllDayEventSeries.mock.calls[0];
        
        // 1. Title
        expect(createCall[0]).toBe(CONFIG.USERS.EVENTS.BIRTHDAY_TITLE({ name: expectedName }));
        
        // 2. Date
        expect(createCall[1]).toEqual(expectedDate);
        
        // 3. Recurrence Rule
        expect(CalendarAppMock.newRecurrence).toHaveBeenCalled();
        const recurrenceMock = CalendarAppMock.newRecurrence.mock.results[0].value;
        const yearlyRule = recurrenceMock.addYearlyRule.mock.results[0].value;
        expect(createCall[2]).toBe(yearlyRule);
        
        // 4. Options (Description)
        expect(createCall[3]).toEqual({
            description: CONFIG.USERS.EVENTS.BIRTHDAY_DESC({ name: expectedName })
        });
    });

    it('creates a signup anniversary event for 1 year in the future', () => {
        onMemberSignup(mockMemberSignupEvent);

        const expectedName = mockMemberSignupEvent.namedValues['Nombre'][0];
        const expectedDate = new Date();
        expectedDate.setFullYear(expectedDate.getFullYear() + 1);

        expect(mockCalendar.createAllDayEvent).toHaveBeenCalled();
        const createCall = mockCalendar.createAllDayEvent.mock.calls[0];
        
        // 1. Title
        expect(createCall[0]).toBe(CONFIG.USERS.EVENTS.ANNIVERSARY_TITLE({ name: expectedName }));
        
        // 2. Date (compare Y/M/D to avoid millisecond drift)
        const actualDate = createCall[1];
        expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
        expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
        expect(actualDate.getDate()).toBe(expectedDate.getDate());

        // 3. Options (Description)
        expect(createCall[2]).toEqual({
            description: CONFIG.USERS.EVENTS.ANNIVERSARY_DESC({ name: expectedName })
        });
    });

    it('handles missing birthday gracefully', () => {
        const eventWithoutBirthday = JSON.parse(JSON.stringify(mockMemberSignupEvent));
        eventWithoutBirthday.namedValues['Cumpleaños'] = [];
        
        onMemberSignup(eventWithoutBirthday);
        
        expect(mockCalendar.createAllDayEventSeries).not.toHaveBeenCalled();
        // Anniversary should still be created
        expect(mockCalendar.createAllDayEvent).toHaveBeenCalled();
    });
});
