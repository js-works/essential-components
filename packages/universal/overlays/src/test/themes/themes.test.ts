import { describe, expect, it } from "vitest";

import { createDialogTheme } from "../../main/dialogs/theme.js";
import { createWebawesomeDialogTheme, createWebawesomeToastTheme } from "../../main/themes/webawesome.js";
import { createToastTheme } from "../../main/toasts/theme.js";

// The ready themes are functions: the variant's values with the given tokens on top, a new object each call.
describe("the ready themes", () => {
  it("the given tokens on top; an undefined one hides nothing", () => {
    const theme = createToastTheme({ radius: "0px", text: undefined });

    expect(theme.radius).toBe("0px");
    expect(theme.text).toBe(createToastTheme().text);
    expect(createDialogTheme({ spinner: "red" }).spinner).toBe("red");
  });

  it("a new object each call", () => {
    expect(createToastTheme()).not.toBe(createToastTheme());
    expect(createWebawesomeDialogTheme()).not.toBe(createWebawesomeDialogTheme());
  });

  it("Web Awesome's themes: its variables, the given tokens on top", () => {
    expect(createWebawesomeToastTheme().background).toContain("var(--wa-");
    expect(createWebawesomeToastTheme({ background: "white" }).background).toBe("white");
  });
});
