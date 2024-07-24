import {Panel, initPanelsEvents} from "./panel.mjs";

type Canvas = Panel<"div">
type Textarea = Panel<"textarea">

const CELL_WIDTH = 16;
const CELL_HEIGHT = CELL_WIDTH * 1.5;

const COLORS = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#ffff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ffffff",

    "#555555",
    "#ffaaaa",
    "#aaffaa",
    "#ffffaa",
    "#aaaaff",
    "#ffaaff",
    "#aaffff",
    "#cccccc",
];

function makeCanvas(c: Canvas): void {
    c.content.style.width = `${5 * CELL_WIDTH}px`;
    c.content.style.height = `${3 * CELL_HEIGHT}px`;
    c.content.style.resize = "both";
    c.content.style.overflow = "hidden";
    c.content.style.background = "white";
    c.content.style.display = "flex";
    c.content.style.flexDirection = "column";

    document.body.appendChild(c.element);
}

function makeCanvasCells(c: Canvas, ta: Textarea): void {
    const w = Math.round(parseInt(c.content.style.width) / CELL_WIDTH);
    const h = Math.round(parseInt(c.content.style.height) / CELL_HEIGHT);

    const cells: HTMLButtonElement[][] = [];
    c.content.querySelectorAll("div").forEach((row) => {
        cells.push(Array.from(row.querySelectorAll("button")));
        row.remove();
    });

    const lines = ta.content.value.split("\n");

    for (let i = 0; i < h; i++) {
        const row = document.createElement("div");

        row.style.display = "flex";

        for (let j = 0; j < w; j++) {
            let b: HTMLButtonElement;

            if (i < cells.length && j < cells[i]!.length) {
                b = cells[i]![j]!;
            } else {
                b = document.createElement("button");

                b.style.width = `${CELL_WIDTH}px`;
                b.style.minWidth = `${CELL_WIDTH}px`;
                b.style.height = `${CELL_HEIGHT}px`;
                b.style.minHeight = `${CELL_HEIGHT}px`;

                b.textContent = " ";
                if (i < lines.length && j < lines[i]!.length && lines[i]![j]! !== "") {
                    b.textContent = lines[i]![j]!;
                }

                b.addEventListener("click", () => {
                    b.textContent = "█";

                    const cells: HTMLButtonElement[][] = [];
                    c.content.querySelectorAll("div").forEach((row) => {
                        cells.push(Array.from(row.querySelectorAll("button")));
                    });

                    let buf = "";
                    for (const row of cells) {
                        let line = "";
                        for (const cell of row) {
                            line += cell.textContent;
                        }
                        buf += line.trimEnd() + "\n";
                    }
                    ta.content.value = buf.trimEnd();
                });
            }

            row.appendChild(b);
        }

        c.content.appendChild(row);
    }
}

function makeTextarea(ta: Textarea): void {
    ta.element.style.border = "none";
    ta.element.style.left = `${640 + 20}px`;

    ta.header.style.border = "1px solid black";
    ta.header.style.borderBottom = "none";

    ta.content.style.borderRadius = "0px";
    ta.content.style.border= "1px solid black";

    ta.content.style.width = "200px";
    ta.content.style.height = "100px";

    document.body.appendChild(ta.element);
}

const canvas: Canvas = new Panel("div");
const textarea: Textarea = new Panel("textarea");

makeCanvas(canvas);
makeTextarea(textarea);

initPanelsEvents([canvas, textarea]);

new ResizeObserver(() => {
    makeCanvasCells(canvas, textarea);
}).observe(canvas.content);

textarea.content.addEventListener("input", () => {
    const lines = textarea.content.value.split("\n");
    const cells: HTMLButtonElement[][] = [];

    canvas.content.querySelectorAll("div").forEach((row) => {
        cells.push(Array.from(row.querySelectorAll("button")));
    });

    for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i]!.length; j++) {
            let sym = " ";
            if (i < lines.length && j < lines[i]!.length) {
                sym = lines[i]![j]!;
            }
            cells[i]![j]!.textContent = sym;
        }
    }
});

document.body.style.overflow = "hidden";
document.body.style.cursor = "auto";
document.body.style.font = "20px monospace";
