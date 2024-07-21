const CELL_W = 16;
const CELL_H = CELL_W * 1.8;

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

interface Workspace {
    panels: Panel[];
    input: Char[][];
    dragCursorOffset: Vec2;
}

function createPanel(tag: keyof HTMLElementTagNameMap): Panel {
    const element = document.createElement("div");
    const header = element.appendChild(document.createElement("div"));
    const content = element.appendChild(document.createElement(tag));

    element.style.position = "absolute";
    element.style.border = "1px solid black";

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

    p.header.style.borderBottom = "1px solid black";

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
    p.element.style.left = `${330 + 20 * CELL_W}px`;

    p.header.style.border = "1px solid black";
    p.header.style.borderBottom = "none";

    p.content.style.borderRadius = "0px";
    p.content.style.border= "1px solid black";
    // TODO(art): hard coded
    p.content.style.width = `${20 * CELL_W}px`;
    p.content.style.height = `${8 * CELL_H}px`;


    return p;
}

function makeGrid(ws: Workspace, canvas: Panel): void {
    let w = Math.round(parseInt(canvas.content.style.width) / CELL_W);
    let h = Math.round(parseInt(canvas.content.style.height) / CELL_H);

    while (canvas.content.firstChild) {
        canvas.content.removeChild(canvas.content.firstChild);
    }

    for (let i = 0; i < h; i++) {
        const row = document.createElement("div");
        row.style.display = "flex";

        for (let j = 0; j < w; j++) {
            const cell = document.createElement("div");

            cell.style.border = "1px solid lightgray";
            cell.style.minWidth = `${CELL_W}px`;
            cell.style.minHeight = `${CELL_H}px`;
            cell.style.width = `${CELL_W}px`;
            cell.style.height = `${CELL_H}px`;
            cell.style.display = "flex";
            cell.style.alignItems = "center";
            cell.style.justifyContent = "center";

            cell.textContent = "";
            if (i < ws.input.length && j < ws.input[i]!.length) {
                cell.textContent = ws.input[i]![j]!.symbol;
            }

            row.appendChild(cell);
        }

        canvas.content.appendChild(row);
    }
}

function initWorkspace(ws: Workspace): void {
    const canvas = createCanvas();
    const textarea = createTextArea();

    ws.panels.push(canvas, textarea);

    makeGrid(ws, canvas);

    const ta = textarea.content as HTMLTextAreaElement;

    ta.addEventListener("input", () => {
        ws.input = [];

        const lines = ta.value.split("\n");

        for (const line of lines) {
            const cx: Char[] = [];
            for (const c of line) {
                cx.push({symbol: c});
            }
            ws.input.push(cx);
        }

        makeGrid(ws, canvas);
    });

    new ResizeObserver(() => {
        makeGrid(ws, canvas);
    }).observe(canvas.content);
}

const workspace: Workspace = {
    panels: [],
    input: [],
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

window.addEventListener("mouseup", (event: MouseEvent) => {
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
