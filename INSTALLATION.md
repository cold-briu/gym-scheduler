# Installation and Setup Guide

Follow these steps to set up the Gym Scheduler system in your Google Apps Script environment.

## 1. Google Form & Sheet Setup

The easiest way to set up the database is to create the **Google Forms** first and link them to a single spreadsheet. This ensures the column headers match the form questions exactly.

### Form 1: Registration (New Members)
1. Create a new Google Form.
2. Add the following questions (exact names are required):
   - **Nombre**: Short answer.
   - **Correo**: Short answer (or Email validation).
   - **Cumpleaños**: Date (Format: `DD/MM/YYYY`).
   - **Telefono**: Short answer.
3. Go to the **Responses** tab and click **Link to Sheets**.
4. Create a **New Spreadsheet** named **Gym Database**.
5. In the spreadsheet, rename the new tab (e.g., "Form Responses 1") to **`Usuarios`**.

### Form 2: Payments
1. Create a second Google Form.
2. Add the following questions (exact names are required):
   - **Nombre**: Dropdown or List (Note: This is automatically updated by the script from the `Usuarios` sheet).
   - **Valor**: Number (Short answer).
   - **Tipo de membresía**: Multiple choice. You must include these exact options:
       - `Día de Escalada`
       - `Clase Dirigida`
       - `Mensualidad`
       - `Mensualidad Dirigida`
       - `Trimestre Mensualidad`
       - `Semestre Mensualidad`
       - `Anualidad Mensualidad`
       - `Curso Básico`
       - `Curso Avanzado`
   - **Metodo**: Multiple choice. Include these options:
       - `Transferencia`
       - `Efectivo`
   - **Fecha de inicio**: Date.
3. Go to the **Responses** tab, click **Link to Sheets**, and select the **Existing Spreadsheet** (**Gym Database**) created in the previous step.
4. In the spreadsheet, rename the new tab (e.g., "Form Responses 2") to **`Pagos`**.

### Form 3: Attendance (Asistencia)
1. Create a third Google Form.
2. Add the following questions:
   - **Clase**: Dropdown. (Note: Automatically updated by script to include current class slots).
   - **Asistencia - [Instructor]**: Checkbox Grid. 
       - **Columns**: Exactly one column labeled `Asistió`.
       - **Rows**: List of student names (Automatically pre-filled by script based on enrollment).
3. Set up **Page Navigation**:
   - Configure the **Clase** dropdown to "Go to section based on answer".
   - Create sections for each class and add the corresponding instructor checkbox grids.
4. Link the form to the **same spreadsheet** (**Gym Database**).
5. In the spreadsheet, rename the new tab to **`Asistencia`**.

### Form 4: Initial Assignment (Asignación Inicial)
1. Create a fourth Google Form.
2. Add the following questions:
   - **Usuario**: Dropdown. (Note: Automatically updated by script from `Usuarios` sheet).
   - **Día**: Dropdown. Include options: `Lunes`, `Martes`, `Miércoles`, `Jueves`, `Viernes`, `Sábado`.
   - **Horario**: Dropdown.
   - **Instructor**: Dropdown.
3. Set up **Page Navigation**:
   - Configure the **Día** dropdown to "Go to section based on answer" to route to the correct time slots (Page 2+).
   - Configure the **Horario** dropdown (in each day's section) to "Go to section based on answer" to route to available instructors for that time slot (Page 3+).
4. Link the form to the **same spreadsheet** (**Gym Database**).
5. In the spreadsheet, rename the new tab to **`Asignacion Inicial`**.

> [!IMPORTANT]
> The script identifies data based on the **Tab Name** (`Usuarios`, `Pagos`, `Asistencia`, and `Asignacion Inicial`) and the **Column Headers** (which must match the question titles exactly). These field names are defined in the project's source of truth: [form-fields.yaml](specs/form-fields.yaml).

---

## 2. Build and Test the Project

Before deploying, ensure the code is bundled correctly.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   Ensure all logic is working as expected.
   ```bash
   npm test
   ```

3. **Build the Bundle**:
   Concatenate the modular source files into a single bundle for Google Apps Script.
   ```bash
   npm run build
   ```
   The bundled code will be generated at `out/bundles.js`.

---

## 3. Manual Deployment to Apps Script

1. **Open Apps Script Editor**:
   In your Google Sheet ("Gym Database"), go to **Extensions** > **Apps Script**.

2. **Paste the Code**:
   - Open `out/bundles.js` in your local editor.
   - Copy the entire content.
   - Delete any existing code in the Apps Script `Code.gs` file.
   - Paste the bundled code.

3. **Configure IDs**:
   Update the following constants at the top of the script (in the `CONFIG` object section):
   - `CALENDAR_ID`: The ID of your Google Calendar.
   - `PAYMENTS.FORM_ID`: The ID of your Payments Form.
   - `USERS.FORM_ID`: The ID of your Registration Form.

4. **Set Up Triggers**:
   - In the Apps Script sidebar, click the **Triggers** (clock icon).
   - Click **+ Add Trigger**.
   - Choose `masterFormRouter` as the function to run.
   - Choose **From spreadsheet** as the event source.
   - Choose **On form submit** as the event type.
   - Click **Save**.

5. **Authorization**:
   Run the `masterFormRouter` once manually or trigger a form submission to grant the necessary permissions for Calendar and Spreadsheet access.
