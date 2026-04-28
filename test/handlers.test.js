import { onMemberSignup } from '../src/handlers.js';
import { CONFIG } from '../src/config.js';
import { getFieldValue } from '../src/utils.js';
import { updateMemberDropdown } from '../src/functions.js';
import { setupGasMocks, CalendarAppMock, SpreadsheetAppMock, FormAppMock } from './utils/gas-mocks.js';
import { mockMemberSignupEvent } from './mock-data/data.js';
describe('onMemberSignup', () => {
    beforeEach(() => {
        setupGasMocks();
        global.CONFIG = CONFIG;
        global.getFieldValue = getFieldValue;
        global.updateMemberDropdown = updateMemberDropdown;
        
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
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

    it('processes user registration and creates calendar events', () => {
        onMemberSignup(mockMemberSignupEvent);

        // Verify updateMemberDropdown logic
        expect(SpreadsheetAppMock.getActiveSpreadsheet).toHaveBeenCalled();
        const activeSpreadsheet = SpreadsheetAppMock.getActiveSpreadsheet.mock.results[0].value;
        expect(activeSpreadsheet.getSheetByName).toHaveBeenCalledWith(CONFIG.USERS.SHEET_NAME);
        
        expect(FormAppMock.openById).toHaveBeenCalledWith(CONFIG.PAYMENTS.FORM_ID);
        const paymentForm = FormAppMock.openById.mock.results[0].value;
        const formItem = paymentForm.getItems.mock.results[0].value[0];
        const listItem = formItem.asListItem.mock.results[0].value;
        expect(listItem.setChoiceValues).toHaveBeenCalledWith(["Mock Member 1", "Mock Member 2"]);

        const calendarId = CONFIG.CALENDAR_ID;
        expect(CalendarAppMock.getCalendarById).toHaveBeenCalledWith(calendarId);

        // Get the specific calendar instance returned to the handler
        const mockCalendar = CalendarAppMock.getCalendarById.mock.results[0].value;
        
        // Verify Birthday Event
        expect(mockCalendar.createAllDayEventSeries).toHaveBeenCalled();
        const birthdayTitle = CONFIG.USERS.EVENTS.BIRTHDAY_TITLE({ name: 'Juan Perez' });
        expect(mockCalendar.createAllDayEventSeries.mock.calls[0][0]).toBe(birthdayTitle);

        // Verify Anniversary Event
        expect(mockCalendar.createAllDayEvent).toHaveBeenCalled();
        const anniversaryTitle = CONFIG.USERS.EVENTS.ANNIVERSARY_TITLE({ name: 'Juan Perez' });
        expect(mockCalendar.createAllDayEvent.mock.calls[0][0]).toBe(anniversaryTitle);
    });
});
