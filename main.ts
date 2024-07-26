import {initPanels} from "./panel.js";
import {canvas, textarea, palette, output} from "./app.js";
import {initCanvas} from "./canvas.js";
import {initTextarea} from "./textarea.js";
import {initPalette} from "./palette.js";
import {initOutput} from "./output.js";

document.body.style.overflow = "hidden";
document.body.style.font = "20px monospace";

initCanvas();
initTextarea();
initPalette();
initOutput();

initPanels([canvas, textarea, palette, output]);
