import { masterFormRouter } from '../src/routers.js';
import { mockMemberSignupEvent } from './mock-data/data.js';

describe('masterFormRouter', () => {
    beforeEach(() => {
        // Setup global dependencies expected by Google Apps Script environment
        global.CONFIG = {
            USERS: { SHEET_NAME: 'Usuarios' },
            PAYMENTS: { SHEET_NAME: 'Pagos' }
        };
        global.onMemberSignup = jest.fn();
        global.onPaymentSubmit = jest.fn();
        
        // Mock console.log to keep test output clean
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.CONFIG;
        delete global.onMemberSignup;
        delete global.onPaymentSubmit;
    });

    it('triggers member signup logic when sheet name matches USERS sheet', () => {
        masterFormRouter(mockMemberSignupEvent);
        
        expect(global.onMemberSignup).toHaveBeenCalledWith(mockMemberSignupEvent);
        expect(global.onPaymentSubmit).not.toHaveBeenCalled();
    });
});
