import {Panel} from "./panel.js";
import {COLORS, Cell, Palette} from "./app.js";

export const palette: Palette = new Panel("div");

palette.element.style.left = `${640 + 20}px`;
palette.element.style.top = "150px";

document.body.appendChild(palette.element);

export function initPaletteEvents(brush: Cell): void {
    for (const [i, color] of COLORS.entries()) {
        const b = document.createElement("button");

        b.style.width = "20px";
        b.style.height = "20px";
        b.style.background = color.value;

        if (i === 7) {
            b.style.marginRight = "5px";
        }

        b.addEventListener("click", () => {
            brush.fg = color;
        });
        b.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            brush.bg = color;
        });

        palette.content.appendChild(b);
    }
}
