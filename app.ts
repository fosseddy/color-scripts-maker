import {Panel} from "./panel.js";

export type Canvas = Panel<"div">
export type Textarea = Panel<"textarea">
export type Palette = Panel<"div">

export interface Color {
    value: string;
    code: number;
}

export interface Cell {
    symbol: string;
    fg: Color;
    bg: Color;
}

interface Workspace {
    cells: Cell[][];
    brush: Cell;
}

export const CELL_WIDTH = 16;
export const CELL_HEIGHT = CELL_WIDTH * 1.5;

export const FG: Color = {value: "#d0d0d0", code: 9};
export const BG: Color = {value: "#1c1c1c", code: 9};

export const COLORS = [
    // normal
    {value: "#2f2e2d", code: 0},
    {value: "#a36666", code: 1},
    {value: "#90a57d", code: 2},
    {value: "#d7af87", code: 3},
    {value: "#7fa5bd", code: 4},
    {value: "#c79ec4", code: 5},
    {value: "#8adbb4", code: 6},
    {value: "#d0d0d0", code: 7},

    // bright
    {value: "#4a4845", code: 60},
    {value: "#d78787", code: 61},
    {value: "#afbea2", code: 62},
    {value: "#e4c9af", code: 63},
    {value: "#a1bdce", code: 64},
    {value: "#d7beda", code: 65},
    {value: "#b1e7dd", code: 66},
    {value: "#efefef", code: 67}
];

export const workspace: Workspace = {
    cells: [],
    brush: {
        symbol: "█",
        fg: FG,
        bg: BG
    }
};

export function makeCells(canvas: Canvas, textarea: Textarea): void {
    const cells: Cell[][] = [];
    const prev = workspace.cells;

    const w = Math.round(parseInt(canvas.content.style.width) / CELL_WIDTH);
    const h = Math.round(parseInt(canvas.content.style.height) / CELL_HEIGHT);

    const lines = textarea.content.value.split("\n");

    for (let i = 0; i < h; i++) {
        const row: Cell[] = [];

        for (let j = 0; j < w; j++) {
            let cell: Cell;

            if (i < prev.length && j < prev[i]!.length) {
                cell = prev[i]![j]!;
            } else {
                cell = {symbol: " ", fg: FG, bg: BG};
                if (i < lines.length && j < lines[i]!.length && lines[i]![j]! !== "") {
                    cell.symbol = lines[i]![j]!;
                }
            }

            row.push(cell);
        }

        cells.push(row);
    }

    workspace.cells = cells;
}

export function makeGrid(canvas: Canvas, textarea: Textarea): void {
    while (canvas.content.firstChild) {
        canvas.content.firstChild.remove();
    }

    for (const row of workspace.cells) {
        const div = document.createElement("div");
        div.style.display = "flex";

        for (const cell of row) {
            const b = document.createElement("button");

            b.style.border = "1px solid lightgray";
            b.style.width = `${CELL_WIDTH}px`;
            b.style.minWidth = `${CELL_WIDTH}px`;
            b.style.height = `${CELL_HEIGHT}px`;
            b.style.minHeight = `${CELL_HEIGHT}px`;

            b.style.color = cell.fg.value;
            b.style.background = cell.bg.value;
            b.textContent = cell.symbol;

            b.addEventListener("click", () => {
                cell.symbol = workspace.brush.symbol;
                cell.fg = workspace.brush.fg;
                cell.bg = workspace.brush.bg;

                makeGrid(canvas, textarea);

                let buf = "";
                for (const row of workspace.cells) {
                    let line = "";
                    for (const cell of row) {
                        line += cell.symbol;
                    }
                    buf += line.trimEnd() + "\n";
                }
                textarea.content.value = buf.trimEnd();
            });

            div.appendChild(b);
        }
        canvas.content.appendChild(div);
    }
}
