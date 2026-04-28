import { onPaymentSubmit } from '../src/handlers.js';
import { CONFIG } from '../src/config.js';
import { getFieldValue, toSlug } from '../src/utils.js';
import { setupGasMocks, CalendarAppMock, MockCalendar } from './utils/gas-mocks.js';
import { mockPaymentEvent } from './mock-data/data.js';

describe('onPaymentSubmit', () => {
    let mockCalendar;

    beforeEach(() => {
        setupGasMocks();
        global.CONFIG = CONFIG;
        global.getFieldValue = getFieldValue;
        global.toSlug = toSlug;
        
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Use the centralized mock calendar
        mockCalendar = MockCalendar;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.CONFIG;
        delete global.getFieldValue;
        delete global.toSlug;
        delete global.CalendarApp;
        delete global.Utilities;
    });

    it('initializes the correct calendar', () => {
        onPaymentSubmit(mockPaymentEvent);
        expect(CalendarAppMock.getCalendarById).toHaveBeenCalledWith(CONFIG.CALENDAR_ID);
    });

    it('creates an expiry event and a reminder event with correct dates', () => {
        onPaymentSubmit(mockPaymentEvent);

        const name = mockPaymentEvent.namedValues['Nombre'][0];
        const startDateStr = mockPaymentEvent.namedValues['Fecha de inicio'][0];
        const membershipType = mockPaymentEvent.namedValues['Tipo de membresía'][0];
        
        // Parse logic from handler
        const dateParts = startDateStr.split(/[-/.]/);
        const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        
        const monthDuration = CONFIG.MEMBERSHIP_TYPE_MONTHS[membershipType];
        const expectedExpiryDate = new Date(startDate);
        expectedExpiryDate.setMonth(expectedExpiryDate.getMonth() + monthDuration);

        const expectedReminderDate = new Date(expectedExpiryDate);
        expectedReminderDate.setDate(expectedReminderDate.getDate() - CONFIG.PAYMENTS.REMINDER_DAYS);

        // Check if two events were created
        expect(mockCalendar.createAllDayEvent).toHaveBeenCalledTimes(2);

        // 1. Expiry Event
        const expiryCall = mockCalendar.createAllDayEvent.mock.calls.find(call => 
            call[0].includes('Renovar')
        );
        expect(expiryCall).toBeDefined();
        expect(expiryCall[0]).toBe(CONFIG.PAYMENTS.EVENTS.EXPIRY_TITLE({ name }));
        expect(expiryCall[1]).toEqual(expectedExpiryDate);
        expect(expiryCall[2].description).toBe(CONFIG.PAYMENTS.EVENTS.EXPIRY_DESC({ 
            name, 
            startDate: startDateStr, 
            membershipType 
        }));

        // 2. Reminder Event
        const reminderCall = mockCalendar.createAllDayEvent.mock.calls.find(call => 
            call[0].includes('Vence en 7 días')
        );
        expect(reminderCall).toBeDefined();
        expect(reminderCall[0]).toBe(CONFIG.PAYMENTS.EVENTS.REMINDER_TITLE({ name }));
        expect(reminderCall[1]).toEqual(expectedReminderDate);
        expect(reminderCall[2].description).toBe(CONFIG.PAYMENTS.EVENTS.REMINDER_DESC({ 
            name, 
            startDate: startDateStr, 
            membershipType 
        }));
    });

    it('does not create calendar events if membership type has no duration', () => {
        const eventNoDuration = JSON.parse(JSON.stringify(mockPaymentEvent));
        eventNoDuration.namedValues['Tipo de membresía'] = ['visitante_diario']; // Not in MEMBERSHIP_TYPE_MONTHS
        
        onPaymentSubmit(eventNoDuration);
        
        expect(mockCalendar.createAllDayEvent).not.toHaveBeenCalled();
    });

    it('logs an error if calendar access fails', () => {
        CalendarAppMock.getCalendarById.mockReturnValue(null);
        
        onPaymentSubmit(mockPaymentEvent);
        
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Could not access calendar')
        );
    });
});
