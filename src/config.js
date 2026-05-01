/**
 * CONFIGURATION
 * Organized by form type for clarity.
 * Event Titles and Descriptions are now composed via functions.
 */
export const CONFIG = {
    CALENDAR_ID: 'demo@group.calendar.google.com',
    TIMEZONE: 'GMT-5',

    DB_MAPPING: {
        'nombre': 'name',
        'valor': 'value',
        'metodo': 'method',
        'tipo de membresía': 'membershipType',
        'fechaInicio': 'startDate',
        'correo': 'email',
        'telefono': 'phone',
        'cumpleaños': 'birthdayString',
        'usuario': 'user_id',
        'día': 'day',
        'horario': 'timeSlot',
        'instructor': 'instructor',
        'cupos totales': 'maxCapacity',
        'cupos disponibles': 'availableSpots',
        'inscritos': 'enrolledUsers',
        'clase actual': 'old_class_info',
        'nueva fecha': 'new_class_date',
        'nuevo horario': 'new_class_time',
        'nuevo instructor': 'new_class_instructor'
    },

    MEMBERSHIP_TYPE_MONTHS: {
        'mensualidad': 1,
        'mensualidad_dirigida': 1,
        'trimestre_mensualidad': 3,
        'semestre_mensualidad': 6,
        'anualidad_mensualidad': 12
    },

    PAYMENTS: {
        FORM_ID: 'form-id',
        SHEET_NAME: 'Pagos',
        DROPDOWN_TITLE: 'nombre',
        REMINDER_DAYS: 7,
        FIELDS: {
            NAME: 'Nombre',
            VALUE: 'Valor',
            MEMBERSHIP_TYPE: 'Tipo de membresía',
            METHOD: 'Metodo',
            START_DATE: 'Fecha de inicio'
        },
        // Composition functions for Payment events
        EVENTS: {
            EXPIRY_TITLE: (data) => `📞 Renovar: ${data.name}`,
            EXPIRY_DESC: (data) => `Inicio: ${data.startDate} | Tipo: ${data.membershipType}`,
            REMINDER_TITLE: (data) => `⏰ Vence en 7 días: ${data.name}`,
            REMINDER_DESC: (data) => `Inicio: ${data.startDate} | Tipo: ${data.membershipType}`
        }
    },

    // 2. USERS FORM SETTINGS
    USERS: {
        FORM_ID: 'form-id-2',
        SHEET_NAME: 'Usuarios',
        FIELDS: {
            NAME: 'Nombre',
            EMAIL: 'Correo',
            BIRTHDAY: 'Cumpleaños',
            PHONE: 'Telefono'
        },
        // Composition functions for User events
        EVENTS: {
            BIRTHDAY_TITLE: (data) => `🎈 Cumpleaños: ${data.name}`,
            BIRTHDAY_DESC: () => ``,
            ANNIVERSARY_TITLE: (data) => `🎊 Aniversario en 3M: ${data.name}`,
            ANNIVERSARY_DESC: () => ``
        }
    },

    // 3. SCHEDULE SETTINGS (Reference Sheet)
    SCHEDULE: {
        SHEET_NAME: 'Horarios',
        FIELDS: {
            DAY: 'Día',
            TIME_SLOT: 'Horario',
            INSTRUCTOR: 'Instructor',
            MAX_CAPACITY: 'Cupos Totales',
            AVAILABLE_SPOTS: 'Cupos Disponibles',
            ENROLLED: 'Inscritos'
        }
    },
    // 4. ASIGNACION FORM SETTINGS
    ASIGNACION: {
        SHEET_NAME: 'Asignacion Inicial',
        FIELDS: {
            USER: 'Usuario',
            DAY: 'Día',
            TIME_SLOT: 'Horario',
            INSTRUCTOR: 'Instructor'
        }
    },
    // 4. ATTENDANCE FORM SETTINGS
    ATTENDANCE: {
        SHEET_NAME: 'Asistencia',
        FIELDS: {
            CLASS: 'Clase',
            // Note: Instructor fields are dynamic and prefixed with "Asistencia - "
            INSTRUCTOR_PREFIX: 'Asistencia - '
        }
    },
    // 5. MODIFY SCHEDULE SETTINGS
    MODIFY: {
        SHEET_NAME: 'Cambios',
        FIELDS: {
            USER: 'Nombre',
            OLD_CLASS: 'Clase Actual',
            NEW_DATE: 'Nueva Fecha',
            NEW_TIME: 'Nuevo Horario',
            NEW_INSTRUCTOR: 'Nuevo Instructor'
        }
    }
};
