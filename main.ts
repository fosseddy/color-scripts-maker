type HTMLTag = keyof HTMLElementTagNameMap;

interface Color {
    value: string;
    code: number;
}

const ESC = "\\x1b";
const SYMS = `█ ▄ ■ ▀ ▌ ▐ ░ ▒ ▓

│ ┤ ╡ ╢ ╖ ╕ ╣ ║ ╗ ╝ ╜ ╛ ┐ └ ┴ ┬ ├ ─ ┼ ╞
╟ ╚ ╔ ╩ ╦ ╠ ═ ╬ ╧ ╨ ╤ ╥ ╙ ╘ ╒ ╓ ╫ ╪ ┘ ┌

♥ ♦ ♣ ♠ • ◘ ○ ♂ ♀ ♪ ♫ ► ◄ ↕
‼ ¶ § ▬ ↨ ↑ ↓ → ← ∟ ↔ ▲ ▼ ⌂

! " # $ % & ' ( ) * + , - . / : ; < = > ?
@ ª º ¿ ⌐ ¬ ½ ¼ ¡ « » [ \\ ] ^ _ \` { | } ~

ɑ ϐ ᴦ ᴨ ∑ ơ µ ᴛ ɸ ϴ Ω ẟ ∞ ∈
∩ ≡ ± ≥ ≤ ⌠ ⌡ ÷ ≈ ° ∙ · √ ⁿ ²

0 1 2 3 4 5 6 7 8 9

A B C D E F G H I J K L M
N O P Q R S T U V W X Y Z

a b c d e f g h i j k l m
n o p q r s t u v w x y z`;

const CELL_WIDTH = 16;
const CELL_HEIGHT = CELL_WIDTH * 1.5;

const FG: Color = {value: "#d0d0d0", code: 9};
const BG: Color = {value: "#1c1c1c", code: 9};

const COLORS: Color[] = [
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

class Panel<T extends HTMLTag = HTMLTag> {
    element = document.createElement("div");
    header = this.element.appendChild(document.createElement("div"));
    isDragged = false;
    dragOffset = {x: 0, y: 0};

    content: HTMLElementTagNameMap[T];

    constructor(tag: T) {
        this.element.style.position = "absolute";
        this.element.style.border = "1px solid black";

        this.header.style.borderBottom = "1px solid black";
        this.header.style.background = "lightgray";
        this.header.style.height = "16px";

        this.content = this.element.appendChild(document.createElement(tag));
        this.content.style.background = "white";
    }
}

class Cell {
    symbol = " ";
    fg = FG;
    bg = BG;
    element = document.createElement("button");

    constructor() {
        this.element.textContent = this.symbol;
        this.element.style.color = this.fg.value;
        this.element.style.background = this.bg.value;
    }

    setSymbol(v: string): void {
        this.symbol = v;
        this.element.textContent = v;
    }

    setFG(v: Color): void {
        this.fg = v;
        this.element.style.color = v.value;
    }

    setBG(v: Color): void {
        this.bg = v;
        this.element.style.background = v.value;
    }
}

const panels: Panel[] = [];

let cells: Cell[][] = [];
let brush = {
    symbol: "█",
    fg: FG,
    bg: BG,
    isClearing: false,
    isUsingSymbol: false,
    isUsingForeground: false,
    isUsingBackground: false
};

const canvas: Panel<"div"> = (() => {
    const canvas = new Panel("div");
    panels.push(canvas);

    canvas.content.style.width = `${20 * CELL_WIDTH}px`;
    canvas.content.style.height = `${10 * CELL_HEIGHT}px`;
    canvas.content.style.resize = "both";
    canvas.content.style.overflow = "hidden";
    canvas.content.style.display = "flex";
    canvas.content.style.flexDirection = "column";

    new ResizeObserver(() => {
        makeCells();
        makeCellsHTML();
    }).observe(canvas.content);

    return canvas;
})();

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
    cells = newcells;
}

function makeCellsHTML(): void {
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
                let sym = brush.symbol;
                let fg = brush.fg;
                let bg = brush.bg;

                if (brush.isClearing) {
                    sym = " ";
                    fg = FG;
                    bg = BG;
                }

                if (brush.isUsingSymbol) {
                    cell.setSymbol(sym);
                }
                if (brush.isUsingForeground) {
                    cell.setFG(fg);
                }
                if (brush.isUsingBackground) {
                    cell.setBG(bg);
                }

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

const textarea: Panel<"textarea"> = (() => {
    const textarea = new Panel("textarea");
    panels.push(textarea);

    textarea.element.style.border = "none";
    textarea.element.style.left = `${parseInt(canvas.content.style.width) + 20}px`;

    textarea.header.style.border = "1px solid black";
    textarea.header.style.borderBottom = "none";

    textarea.content.style.borderRadius = "0px";
    textarea.content.style.border= "1px solid black";
    textarea.content.style.width = "200px";
    textarea.content.style.height = "100px";

    textarea.content.addEventListener("input", () => {
        const lines = textarea.content.value.split("\n");
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i]!.length; j++) {
                let sym = " ";
                if (i < lines.length && j < lines[i]!.length) {
                    sym = lines[i]![j]!;
                }
                cells[i]![j]!.setSymbol(sym);
            }
        }
    });

    return textarea;
})();

const palette: Panel<"div"> = (() => {
    const palette = new Panel("div");
    panels.push(palette);

    palette.element.style.left = textarea.element.style.left;
    palette.element.style.top = `${parseInt(textarea.content.style.height) + 36}px`;

    const selectedBrush = palette.content.appendChild(document.createElement("div"));
    selectedBrush.style.width = "fit-content";
    selectedBrush.style.marginBottom = "10px";
    selectedBrush.style.color = brush.fg.value;
    selectedBrush.style.background = brush.bg.value;
    selectedBrush.textContent = brush.symbol;

    const options = palette.content.appendChild(document.createElement("div"));
    options.style.display = "flex";
    options.style.flexDirection = "column";
    options.style.gap = "5px";

    const clearBrushColors = options.appendChild(document.createElement("button"));
    clearBrushColors.textContent = "reset to default colors";
    clearBrushColors.addEventListener("click", () => {
        brush.fg = FG;
        brush.bg = BG;
        selectedBrush.style.color = FG.value;
        selectedBrush.style.background = BG.value;
    });

    function createCheckbox(container: HTMLElement, labelText: string): HTMLInputElement {
        const input = document.createElement("input");
        input.type = "checkbox";

        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.gap = "10px";
        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));

        container.appendChild(label);
        return input;
    }

    const useSymbol = createCheckbox(options, "use symbol");
    useSymbol.checked = brush.isUsingSymbol = true;
    useSymbol.addEventListener("change", () => {
        brush.isUsingSymbol = useSymbol.checked;
    });

    const useForeground = createCheckbox(options, "use foreground");
    useForeground.checked = brush.isUsingForeground = true;
    useForeground.addEventListener("change", () => {
        brush.isUsingForeground = useForeground.checked;
    });

    const useBackground = createCheckbox(options, "use background");
    useBackground.checked = brush.isUsingBackground = true;
    useBackground.addEventListener("change", () => {
        brush.isUsingBackground = useBackground.checked;
    });

    const clearCell = createCheckbox(options, "clear cell");
    clearCell.addEventListener("change", () => {
        brush.isClearing = clearCell.checked;
    });

    const colorPicker = options.appendChild(document.createElement("div"));
    colorPicker.style.display = "flex";
    colorPicker.style.flexDirection = "column";
    colorPicker.style.gap = "1px";
    colorPicker.style.marginBottom = "10px";

    for (const row of [COLORS.slice(0, 8), COLORS.slice(8)]) {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.gap = "1px";

        for (const color of row) {
            const b = document.createElement("button");
            b.style.width = b.style.height = "20px";
            b.style.background = color.value;
            b.style.border = "1px solid black";
            b.addEventListener("click", () => {
                brush.fg = color;
                selectedBrush.style.color = color.value;
            });
            // TODO(art), 09.09.24: more user friendly controls
            b.addEventListener("contextmenu", (event: MouseEvent) => {
                event.preventDefault();
                brush.bg = color;
                selectedBrush.style.background = color.value;
            });

            div.appendChild(b);
        }
        colorPicker.appendChild(div);
    }

    const symbolPicker = palette.content.appendChild(document.createElement("textarea"));
    symbolPicker.style.display = "block";
    symbolPicker.style.width = "350px";
    symbolPicker.style.height = "390px";
    symbolPicker.value = SYMS;
    symbolPicker.addEventListener("select", () => {
        let sel = symbolPicker.value
            .slice(symbolPicker.selectionStart, symbolPicker.selectionEnd)
            .trim();

        if (sel === "") {
            return;
        }

        if (sel.length > 1) {
            sel = sel[sel.length - 1]!;
        }

        brush.symbol = sel;
        selectedBrush.textContent = sel;
    });

    return palette;
})();

const output: Panel<"div"> = (() => {
    const output = new Panel("div");
    panels.push(output);

    output.element.style.top = `${parseInt(canvas.content.style.height) + 36}px`;

    const btn = output.content.appendChild(document.createElement("button"));
    btn.style.display = "block";
    btn.textContent = "generate output";

    btn.addEventListener("click", () => {
        let buf = `#!/bin/bash\n\necho -e "$(cat << 'EOF'\n`;

        for (const row of cells) {
            for (const cell of row) {
                let sym = cell.symbol;
                if (["\\"].includes(sym)) {
                    sym += "\\";
                }
                buf += `${ESC}[${30 + cell.fg.code};${40 + cell.bg.code}m${sym}`;
            }

            buf += `${ESC}[0m\n`;
        }

        buf += 'EOF\n)"';
        result.value = buf;
    });

    const result = output.content.appendChild(document.createElement("textarea"));
    result.style.borderRadius = "0px";
    result.style.display = "block";
    result.style.border = "none";
    result.style.borderTop = "1px solid black";

    return output;
})();

document.body.style.cursor = "auto";

for (const panel of panels) {
    document.body.appendChild(panel.element);

    panel.header.addEventListener("mouseover", () => {
        if (!panel.isDragged) {
            document.body.style.cursor = "grab";
        }
    });

    panel.header.addEventListener("mouseout", () => {
        if (!panel.isDragged) {
            document.body.style.cursor = "auto";
        }
    });

    panel.header.addEventListener("mousedown", (event: MouseEvent) => {
        event.preventDefault();

        panel.isDragged = true;
        panel.dragOffset = {
            x: panel.element.offsetLeft - event.x,
            y: panel.element.offsetTop - event.y
        };

        document.body.style.cursor = "grabbing";
        panel.header.style.background = "gray";

        // art, 10.09.24: zIndex should be panel variable, because resetting
        // to 0 breaks the order of panels that user made
        for (const p of panels) {
            p.element.style.zIndex = "0";
        }
        panel.element.style.zIndex = "1";
    });
}

window.addEventListener("mouseup", () => {
    for (const panel of panels) {
        if (panel.isDragged) {
            document.body.style.cursor = "grab";
            panel.header.style.background = "lightgray";
            panel.isDragged = false;

            // make panel visible if outside the screen
            const pad = 20;
            if (panel.element.offsetLeft + panel.element.offsetWidth < pad) {
                panel.element.style.left = `${pad - panel.element.offsetWidth}px`;
            } else if (panel.element.offsetLeft + pad > window.innerWidth) {
                panel.element.style.left = `${window.innerWidth - pad}px`;
            }

            if (panel.element.offsetTop < 0) {
                panel.element.style.top = "0px";
            } else if (panel.element.offsetTop + pad > window.innerHeight) {
                panel.element.style.top = `${window.innerHeight - pad}px`;
            }
        }
    }
});

window.addEventListener("mousemove", (event: MouseEvent) => {
    for (const panel of panels) {
        if (panel.isDragged) {
            panel.element.style.left = `${event.x + panel.dragOffset.x}px`;
            panel.element.style.top = `${event.y + panel.dragOffset.y}px`;
        }
    }
});
