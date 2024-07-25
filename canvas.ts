import {Panel} from "./panel.js";
import {Canvas, Textarea, makeCells, makeGrid, CELL_WIDTH, CELL_HEIGHT} from "./app.js";

export const canvas: Canvas = new Panel("div");

canvas.content.style.width = `${5 * CELL_WIDTH}px`;
canvas.content.style.height = `${3 * CELL_HEIGHT}px`;
canvas.content.style.resize = "both";
canvas.content.style.overflow = "hidden";
canvas.content.style.display = "flex";
canvas.content.style.flexDirection = "column";

document.body.appendChild(canvas.element);

export function initCanvasEvents(textarea: Textarea): void {
    new ResizeObserver(() => {
        makeCells(canvas, textarea);
        makeGrid(canvas, textarea);
    }).observe(canvas.content);
}
