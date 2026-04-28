const mockMemberSignupEvent = {
  authMode: 'FULL',
  range: {
    getRow: () => 2,
    getLastColumn: () => 5,
    getSheet: () => ({
      getName: () => 'Usuarios'
    })
  },
  source: {},
  values: [
    "2026-04-28 10:00:00",
    "Juan Perez",
    "juan.perez@example.com",
    "1990-05-15",
    "3001234567"
  ],
  namedValues: {
    "Marca temporal": ["2026-04-28 10:00:00"],
    "Nombre": ["Juan Perez"],
    "Correo": ["juan.perez@example.com"],
    "Cumpleaños": ["1990-05-15"],
    "Telefono": ["3001234567"]
  },
  triggerUid: "12345abcde"
};

const mockPaymentEvent = {
  authMode: 'FULL',
  range: {
    getRow: () => 2,
    getLastColumn: () => 6,
    getSheet: () => ({
      getName: () => 'Pagos'
    })
  },
  source: {},
  values: [
    "2026-04-28 10:30:00",
    "Juan Perez",
    "150000",
    "trimestre_mensualidad",
    "Transferencia",
    "2026-04-28"
  ],
  namedValues: {
    "Marca temporal": ["2026-04-28 10:30:00"],
    "Nombre": ["Juan Perez"],
    "Valor": ["150000"],
    "Tipo de membresía": ["trimestre_mensualidad"],
    "Metodo": ["Transferencia"],
    "Fecha de inicio": ["2026-04-28"]
  },
  triggerUid: "67890fghij"
};

export {
  mockMemberSignupEvent,
  mockPaymentEvent
};
