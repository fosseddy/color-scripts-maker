const CELL_W = 16;
const CELL_H = CELL_W * 1.5;
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

interface Vec2 {
    x: number;
    y: number;
}

interface Panel {
    element: HTMLDivElement;
    header: HTMLDivElement;
    content: HTMLElement;
    isDragged: boolean;
}

interface Char {
    symbol: string;
}

interface Brush {
    fgcolor: string;
    bgcolor: string;
    symbol: string
}

interface Workspace {
    panels: Panel[];
    input: Char[][];
    dragCursorOffset: Vec2;
    brush: Brush;
}

function createPanel(tag: keyof HTMLElementTagNameMap): Panel {
    const element = document.createElement("div");
    const header = element.appendChild(document.createElement("div"));
    const content = element.appendChild(document.createElement(tag));

    element.style.position = "absolute";
    element.style.border = "1px solid black";

    header.style.borderBottom = "1px solid black";
    header.style.background = "lightgray";
    header.style.height = "16px";

    return {
        element,
        header,
        content,
        isDragged: false
    }
}

function createCanvas(): Panel {
    const p = createPanel("div");

    p.content.style.width = `${40 * CELL_W}px`;
    p.content.style.height = `${12 * CELL_H}px`;
    p.content.style.resize = "both";
    p.content.style.overflow = "hidden";
    p.content.style.display = "flex";
    p.content.style.flexDirection = "column";
    p.content.style.background = "white";

    return p;
}

function createTextArea(): Panel {
    const p = createPanel("textarea");

    p.element.style.border = "none";
    p.element.style.left = `${640 + 20}px`;

    p.header.style.border = "1px solid black";
    p.header.style.borderBottom = "none";

    p.content.style.borderRadius = "0px";
    p.content.style.border= "1px solid black";

    // TODO(art): hard coded
    p.content.style.width = `${20 * CELL_W}px`;
    p.content.style.height = `${8 * CELL_H}px`;

    return p;
}

function createPalette(ws: Workspace): Panel {
    const p = createPanel("div");

    p.element.style.left = `${640 + 20}px`;
    p.element.style.top = `${208 + 20}px`;

    p.content.style.background = "white";
    p.content.style.width = "200px";
    p.content.style.height = "100px";

    let row = document.createElement("div");
    for (const [i, color] of COLORS.entries()) {
        const button = document.createElement("button");
        button.style.width = `20px`;
        button.style.height = `20px`;
        button.style.background = color;

        button.addEventListener("click", (event: MouseEvent) => {
            if (event.shiftKey) {
                ws.brush.bgcolor = color;
            } else {
                ws.brush.fgcolor = color;
            }
            console.log(ws.brush);
        });

        row.appendChild(button);

        if (i === 7 || i === 15) {
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            if (i === 7) {
                row.style.marginBottom = "5px";
            }
            p.content.appendChild(row);
            row = document.createElement("div");
        }
    }

    return p;
}

function initWorkspace(ws: Workspace): void {
    const canvas = createCanvas();
    const textarea = createTextArea();
    const palette = createPalette(ws);

    ws.panels = [canvas, textarea, palette];

    const ta = textarea.content as HTMLTextAreaElement;

    // make input and grid
    {
        const w = Math.round(parseInt(canvas.content.style.width) / CELL_W);
        const h = Math.round(parseInt(canvas.content.style.height) / CELL_H);
        const cw = `${CELL_W}px`;
        const ch = `${CELL_H}px`;

        for (let i = 0; i < h; i++) {
            const line: Char[] = [];
            const row = document.createElement("div");
            row.style.display = "flex";

            for (let j = 0; j < w; j++) {
                const cell = document.createElement("button");

                cell.style.border = "1px solid lightgray";
                cell.style.background = "white";
                cell.style.minWidth = cw;
                cell.style.minHeight = ch;
                cell.style.width = cw;
                cell.style.height = ch;
                cell.style.display = "flex";
                cell.style.alignItems = "center";
                cell.style.justifyContent = "center";
                cell.style.fontSize = "16px";
                cell.textContent = " ";

                cell.addEventListener("click", () => {
                    workspace.input[i]![j]!.symbol = workspace.brush.symbol;
                    cell.textContent = workspace.brush.symbol;

                    let buf = "";
                    for (const line of workspace.input) {
                        for (const char of line) {
                            buf += char.symbol;
                        }
                        buf = buf.trimEnd();
                        buf += "\n";
                    }
                    ta.value = buf.trimEnd();
                });

                line.push({symbol: " "});
                row.appendChild(cell);
            }

            ws.input.push(line);
            canvas.content.appendChild(row);
        }
    }

    ta.addEventListener("input", () => {
        const lines = ta.value.split("\n");

        for (let i = 0; i < workspace.input.length; i++) {
            for (let j = 0; j < workspace.input[i]!.length; j++) {
                workspace.input[i]![j]!.symbol = " ";
                if (i < lines.length && j < lines[i]!.length) {
                    workspace.input[i]![j]!.symbol = lines[i]![j]!;
                }
            }
        }

        const rows = canvas.content.querySelectorAll("div");

        for (const [i, line] of workspace.input.entries()) {
            const row = rows[i];

            if (!row) {
                console.error("canvas row does not exist", i, rows);
                continue;
            }

            const cells = row.querySelectorAll("button");

            for (const [j, char] of line.entries()) {
                const cell = cells[j];

                if (!cell) {
                    console.error("canvas cell does not exist", j, row);
                    continue;
                }

                cell.textContent = char.symbol;
            }
        }
    });

    //new ResizeObserver(() => {
    //    makeGrid(ws, canvas);
    //}).observe(canvas.content);
}

const workspace: Workspace = {
    panels: [],
    input: [],
    brush: {
        fgcolor: COLORS[0]!,
        bgcolor: COLORS[7]!,
        symbol: "█"
    },
    dragCursorOffset: {x: 0, y: 0}
};

initWorkspace(workspace);

document.body.style.overflow = "hidden";
document.body.style.cursor = "auto";
document.body.style.font = "20px monospace";

for (const p of workspace.panels) {
    document.body.appendChild(p.element);

    p.header.addEventListener("mouseover", () => {
        if (!p.isDragged) {
            document.body.style.cursor = "grab";
        }
    });

    p.header.addEventListener("mouseout", () => {
        if (!p.isDragged) {
            document.body.style.cursor = "auto";
        }
    });

    p.header.addEventListener("mousedown", (event: MouseEvent) => {
        event.preventDefault();

        p.isDragged = true;
        workspace.dragCursorOffset = {x: p.element.offsetLeft - event.x, y: p.element.offsetTop - event.y};

        document.body.style.cursor = "grabbing";
        p.header.style.background = "black";

        for (const pp of workspace.panels) {
            pp.element.style.zIndex = "0";
        }
        p.element.style.zIndex = "1";
    });
}

window.addEventListener("mouseup", () => {
    for (const p of workspace.panels) {
        if (p.isDragged) {
            document.body.style.cursor = "grab";
            p.header.style.background = "lightgray";
            p.isDragged = false;

            if (p.element.offsetTop < 0) {
                p.element.style.top = "0px";
            } else if (p.element.offsetTop + CELL_H > window.innerHeight) {
                p.element.style.top = `${window.innerHeight - CELL_H}px`;
            }

            if (p.element.offsetLeft + p.element.offsetWidth < CELL_W*2) {
                p.element.style.left = `-${p.element.offsetWidth - CELL_W*2}px`;
            } else if (p.element.offsetLeft + CELL_W*2 > window.innerWidth) {
                p.element.style.left = `${window.innerWidth - CELL_W*2}px`;
            }
        }
    }
});

window.addEventListener("mousemove", (event: MouseEvent) => {
    for (const p of workspace.panels) {
        if (p.isDragged) {
            p.element.style.left = `${event.x + workspace.dragCursorOffset.x}px`;
            p.element.style.top = `${event.y + workspace.dragCursorOffset.y}px`;
        }
    }
});
