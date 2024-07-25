import {Panel} from "./panel.js";
import {FG, BG, makeGrid, Cell, Canvas, Textarea} from "./app.js";

export const textarea: Textarea = new Panel("textarea");

textarea.element.style.border = "none";
textarea.element.style.left = `${640 + 20}px`;

textarea.header.style.border = "1px solid black";
textarea.header.style.borderBottom = "none";

textarea.content.style.borderRadius = "0px";
textarea.content.style.border= "1px solid black";
textarea.content.style.width = "200px";
textarea.content.style.height = "100px";

document.body.appendChild(textarea.element);

export function initTextareaEvents(cells: Cell[][], canvas: Canvas): void {
    textarea.content.addEventListener("input", () => {
        const lines = textarea.content.value.split("\n");

        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i]!.length; j++) {
                let sym = " ";
                if (i < lines.length && j < lines[i]!.length) {
                    sym = lines[i]![j]!;
                }
                cells[i]![j]!.symbol = sym;
                cells[i]![j]!.fg = FG;
                cells[i]![j]!.bg = BG;
            }
        }
        makeGrid(canvas, textarea);
    });
}
