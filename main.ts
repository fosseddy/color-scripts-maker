import {Panel, initPanelsEvents} from "./panel.js";
import {workspace} from "./app.js";
import {canvas, initCanvasEvents} from "./canvas.js";
import {textarea, initTextareaEvents} from "./textarea.js";
import {palette, initPaletteEvents} from "./palette.js";

const ESC = "\\x1b";

const butt = new Panel("button");
butt.content.textContent = "press";
butt.element.style.top = "200px";
butt.content.addEventListener("click", () => {
    let buf = 'echo -e "$(cat << EOF\n';
    for (const row of workspace.cells) {
        for (const cell of row) {
            buf += `${ESC}[${30 + cell.fg.code};${40 + cell.bg.code}m${cell.symbol}`;
        }
        buf += ESC + "[0m\n";
    }
    buf += 'EOF\n)"';

    // TODO(art): draw in ui
    console.log(buf);
});
document.body.appendChild(butt.element);

initCanvasEvents(textarea);
initTextareaEvents(workspace.cells, canvas);
initPaletteEvents(workspace.brush);

initPanelsEvents([canvas, textarea, palette, butt]);

document.body.style.overflow = "hidden";
document.body.style.cursor = "auto";
document.body.style.font = "20px monospace";
