import type { TemplateResult } from "lit-html";

export type { LitContent };

/** The content of the Lit toast adapter: a lit `TemplateResult` or a plain string. */
type LitContent = string | TemplateResult;
