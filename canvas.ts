import {canvas, setCells, Cell, textarea, cells, brush, CELL_WIDTH, CELL_HEIGHT} from "./app.js";

export function initCanvas(): void {
    canvas.content.style.width = `${5 * CELL_WIDTH}px`;
    canvas.content.style.height = `${3 * CELL_HEIGHT}px`;
    canvas.content.style.resize = "both";
    canvas.content.style.overflow = "hidden";
    canvas.content.style.display = "flex";
    canvas.content.style.flexDirection = "column";

    new ResizeObserver(() => {
        makeCells();
        makeGrid();
    }).observe(canvas.content);
}

function makeCells(): void {
    const newcells: Cell[][] = [];
    const lines = textarea.content.value.split("\n");
    const w = Math.round(parseInt(canvas.content.style.width) / CELL_WIDTH);
    const h = Math.round(parseInt(canvas.content.style.height) / CELL_HEIGHT);

    for (let i = 0; i < h; i++) {
        const row: Cell[] = [];

        for (let j = 0; j < w; j++) {
            let cell: Cell;

            if (i < cells.length && j < cells[i]!.length) {
                cell = cells[i]![j]!;
            } else {
                cell = new Cell();
                if (i < lines.length && j < lines[i]!.length && lines[i]![j]! !== "") {
                    cell.setSymbol(lines[i]![j]!);
                }
            }

            row.push(cell);
        }

        newcells.push(row);
    }

    setCells(newcells);
}

function makeGrid(): void {
    while (canvas.content.firstChild) {
        canvas.content.firstChild.remove();
    }

    const cw = `${CELL_WIDTH}px`;
    const ch = `${CELL_HEIGHT}px`;

    for (let i = 0; i < cells.length; i++) {
        const div = document.createElement("div");
        div.style.display = "flex";

        for (let j = 0; j < cells[i]!.length; j++) {
            const cell = cells[i]![j]!;

            cell.element.style.border = "1px solid lightgray";
            cell.element.style.width = cell.element.style.minWidth = cw;
            cell.element.style.height = cell.element.style.minHeight = ch;

            cell.element.addEventListener("click", () => {
                cell.setSymbol(brush.symbol);
                cell.setFG(brush.fg);
                cell.setBG(brush.bg);

                let buf = "";
                for (const row of cells) {
                    let line = "";
                    for (const cell of row) {
                        line += cell.symbol;
                    }
                    buf += line.trimEnd() + "\n";
                }
                textarea.content.value = buf.trimEnd();
            });

            div.appendChild(cell.element);
        }

        canvas.content.appendChild(div);
    }
}
