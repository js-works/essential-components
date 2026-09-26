// The design language first, so the demo's own CSS comes after it.
import "./ui/ui.css";
import { OverlaysDemo } from "./OverlaysDemo.js";

// The page around the demo: its global switch sets the color scheme for everything on the
// page. (No language switch: nothing in this demo follows `<html lang>`; the React i18n demo
// has its own switch, inside the dialog, since that is what it shows.)
const switches = document.querySelector<HTMLFormElement>("#page-switches");

function apply(): void {
  if (!switches) {
    return;
  }
  const data = new FormData(switches);
  document.documentElement.dataset.scheme = String(data.get("scheme") ?? "system");
}

switches?.addEventListener("change", apply);
apply();
customElements.define("overlays-demo", OverlaysDemo);
