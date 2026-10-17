// The i18n binding on top of the DOM one. picolingo itself is a peer dependency and
// excluded; what is measured is the glue plus the bundled German and English tables.

export { germanTexts } from "../../dist/i18n/picolingo/german.js";
export { dialogTexts, toastTexts } from "../../dist/i18n/picolingo/index.js";
export { createDialogsController, createToastController } from "../../dist/index.js";
