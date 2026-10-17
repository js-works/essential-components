import { defineForm } from '@local/micro-app';

export { useForm };

// The app's form hook (`@local/micro-app`): form-validation's `useForm` with `DialogForm` for a form dialog; the
// message of an invalid field as a popover, a refusal of the server (its `Error`'s message) as the dialog's note.
const useForm = defineForm();
