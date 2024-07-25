import {Panel, initPanelsEvents} from "./panel.mjs";

type Canvas = Panel<"div">
type Textarea = Panel<"textarea">
type Palette = Panel<"div">

interface Color {
    value: string;
    code: number;
}

interface Cell {
    symbol: string;
    fg: Color;
    bg: Color;
}

const ESC = "\\x1b";

const CELL_WIDTH = 16;
const CELL_HEIGHT = CELL_WIDTH * 1.5;

const FG: Color = {value: "#d0d0d0", code: 9};
const BG: Color = {value: "#1c1c1c", code: 9};

const COLORS = [
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

function makeInput(prev: Cell[][], c: Canvas, ta: Textarea): Cell[][] {
    const cells: Cell[][] = [];

    const w = Math.round(parseInt(c.content.style.width) / CELL_WIDTH);
    const h = Math.round(parseInt(c.content.style.height) / CELL_HEIGHT);

    const lines = ta.content.value.split("\n");

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

    return cells;
}

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

function makeCanvasCells(c: Canvas, ta: Textarea, input: Cell[][]): void {
    while (c.content.firstChild) {
        c.content.firstChild.remove();
    }

    for (const row of input) {
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
                cell.symbol = brush.symbol;
                cell.fg = brush.fg;
                cell.bg = brush.bg;

                makeCanvasCells(c, ta, input);

                let buf = "";
                for (const row of input) {
                    let line = "";
                    for (const cell of row) {
                        line += cell.symbol;
                    }
                    buf += line.trimEnd() + "\n";
                }
                ta.content.value = buf.trimEnd();
            });

            div.appendChild(b);
        }
        c.content.appendChild(div);
    }

    console.log(input.length, input[0]?.length, c.content.querySelectorAll("button").length)
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

function makePalette(p: Palette): void {
    p.element.style.left = `${640 + 20}px`;
    p.element.style.top = "150px";

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
            console.log(brush);
        });
        b.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();

            brush.bg = color;
            console.log(brush);
        });

        p.content.appendChild(b);
    }

    document.body.appendChild(p.element);
}

const butt = new Panel("button");
butt.content.textContent = "press";
butt.element.style.top = "200px";
butt.content.addEventListener("click", () => {
    let buf = 'echo -e "$(cat << EOF\n';
    for (const row of input) {
        for (const cell of row) {
            buf += `${ESC}[${30 + cell.fg.code};${40 + cell.bg.code}m${cell.symbol}`;
        }
        buf += ESC + "[0m\n";
    }
    buf += 'EOF\n)"';

    console.log(buf);
});
document.body.appendChild(butt.element);

const canvas: Canvas = new Panel("div");
const textarea: Textarea = new Panel("textarea");
const palette: Palette = new Panel("div");

let input: Cell[][] = [];

const brush: Cell = {
    symbol: "█",
    fg: FG,
    bg: BG
};

makeCanvas(canvas);
makeTextarea(textarea);
makePalette(palette);

initPanelsEvents([canvas, textarea, palette, butt]);

new ResizeObserver(() => {
    input = makeInput(input, canvas, textarea);
    makeCanvasCells(canvas, textarea, input);
}).observe(canvas.content);

textarea.content.addEventListener("input", () => {
    const lines = textarea.content.value.split("\n");

    for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input[i]!.length; j++) {
            let sym = " ";
            if (i < lines.length && j < lines[i]!.length) {
                sym = lines[i]![j]!;
            }
            input[i]![j]!.symbol = sym;
            input[i]![j]!.fg = FG;
            input[i]![j]!.bg = BG;
        }
    }
    makeCanvasCells(canvas, textarea, input);
});

document.body.style.overflow = "hidden";
document.body.style.cursor = "auto";
document.body.style.font = "20px monospace";
