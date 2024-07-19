class Vec2 {
    constructor(
        public x: number,
        public y: number
    ) {}
}

interface Rect {
    pos: Vec2;
    size: Vec2;
    color: string;
}

class Mouse {
    pos = new Vec2(0, 0);
    posglob = new Vec2(0, 0);
    isClicked = false;
    isDown = false;
    isUp = false;

    constructor(canvas: HTMLCanvasElement) {
        window.addEventListener("mousemove", (e: MouseEvent) => {
            this.posglob.x = e.x;
            this.posglob.y = e.y;

            this.pos.x = e.x - canvas.offsetLeft;
            this.pos.y = e.y - canvas.offsetTop;
        });

        window.addEventListener("click", () => {
            this.isClicked = true;
        });

        window.addEventListener("mousedown", () => {
            this.isDown = true;
        });

        window.addEventListener("mouseup", () => {
            this.isUp = true;
        });
    }

    reset(): void {
        this.isClicked = false;
        this.isDown = false;
        this.isUp = false;
    }

    isInsideRect(r: Rect): boolean {
        return this.pos.x >= r.pos.x && this.pos.x <= r.pos.x + r.size.x &&
               this.pos.y >= r.pos.y && this.pos.y <= r.pos.y + r.size.y;
    }
}

const RESIZER_SIDE = 10;
const CELL_W = 15;
const CELL_H = CELL_W * 1.7;

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const mouse = new Mouse(canvas);

canvas.width = 24 * CELL_W + RESIZER_SIDE;
canvas.height = 8 * CELL_H + RESIZER_SIDE;
canvas.style.border = "1px solid black";

let activeResizer: Rect|null = null;
const cursorOffset = new Vec2(0, 0);

const rightResizer: Rect = {
    pos: new Vec2(canvas.width - RESIZER_SIDE, 0),
    size: new Vec2(RESIZER_SIDE, canvas.height - RESIZER_SIDE),
    color: "gray",
};

const bottomResizer: Rect = {
    pos: new Vec2(0, canvas.height - RESIZER_SIDE),
    size: new Vec2(canvas.width - RESIZER_SIDE, RESIZER_SIDE),
    color: "gray",
};

const cornerResizer: Rect = {
    pos: new Vec2(canvas.width - RESIZER_SIDE, canvas.height - RESIZER_SIDE),
    size: new Vec2(RESIZER_SIDE, RESIZER_SIDE),
    color: "gray",
};

const textarea: HTMLTextAreaElement = document.querySelector("textarea")!;
textarea.addEventListener("input", () => {
    for (const row of buf) {
        for (const cell of row) {
            cell.symbol = "";
        }
    }

    const lines = textarea.value.split("\n");

    for (let row = 0; row < buf.length; row++) {
        for (let cell = 0; cell < buf[row]!.length; cell++) {
            if (row < lines.length && cell < lines[row]!.length) {
                buf[row]![cell]!.symbol = lines[row]![cell]!;
            }
        }
    }
});

interface Cell {
    pos: Vec2;
    size: Vec2;
    symbol: string;
}

let buf: Cell[][] = makeCells();

function makeCells(): Cell[][] {
    const cx: Cell[][] = [];

    for (let y = 0; y < canvas.height - RESIZER_SIDE; y += CELL_H) {
        const c: Cell[] = [];

        for (let x = 0; x < canvas.width - RESIZER_SIDE; x += CELL_W) {
            c.push({
                pos: new Vec2(x, y),
                size: new Vec2(CELL_W, CELL_H),
                symbol: ""
            });
        }

        cx.push(c);
    }

    return cx;
}

let prevtime = 0;
function frames(time: number): void {
    const dt = (time - prevtime) / 1000;
    prevtime = time;

    if (mouse.isDown) {
        if (mouse.isInsideRect(rightResizer)) {
            activeResizer = rightResizer;
        } else if (mouse.isInsideRect(bottomResizer)) {
            activeResizer = bottomResizer;
        } else if (mouse.isInsideRect(cornerResizer)) {
            activeResizer = cornerResizer;
        }

        if (activeResizer) {
            cursorOffset.x = canvas.width - mouse.pos.x;
            cursorOffset.y = canvas.height - mouse.pos.y;
        }
    }

    if (mouse.isUp) {
        activeResizer = null;
    }

    if (activeResizer) {
        if (activeResizer === rightResizer) {
            canvas.width = mouse.pos.x + cursorOffset.x;
        } else if (activeResizer === bottomResizer) {
            canvas.height = mouse.pos.y + cursorOffset.y;
        } else if (activeResizer === cornerResizer) {
            canvas.width = mouse.pos.x + cursorOffset.x;
            canvas.height = mouse.pos.y + cursorOffset.y;
        }

        const w = canvas.width - RESIZER_SIDE;
        const h = canvas.height - RESIZER_SIDE;

        rightResizer.pos.x = w;
        rightResizer.size.y = h;

        bottomResizer.pos.y = h;
        bottomResizer.size.x = w;

        cornerResizer.pos.x = w;
        cornerResizer.pos.y = h;

        const newbuf: Cell[][] = makeCells();

        for (let i = 0; i < buf.length; i++) {
            for (let j = 0; j < buf[i]!.length; j++) {
                if (i < newbuf.length && j < newbuf[i]!.length) {
                    newbuf[i]![j]!.symbol = buf[i]![j]!.symbol;
                }
            }
        }

        buf = newbuf;
    }

    rightResizer.color = "lightgray";
    bottomResizer.color = "lightgray";
    cornerResizer.color = "lightgray";
    if (activeResizer) {
        activeResizer.color = "gray";
    } else {
        if (mouse.isInsideRect(rightResizer)) {
            rightResizer.color = "gray";
        } else if (mouse.isInsideRect(bottomResizer)) {
            bottomResizer.color = "gray";
        } else if (mouse.isInsideRect(cornerResizer)) {
            cornerResizer.color = "gray";
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "lightgray";
    for (const row of buf) {
        for (const cell of row) {
            ctx.strokeRect(cell.pos.x, cell.pos.y, cell.size.x, cell.size.y);
            if (cell.symbol) {
                const {x, y} = cell.pos;
                const w = cell.size.x;
                const h = cell.size.y;
                ctx.fillText(cell.symbol, x + w/2, y+h/2);
            }
        }
    }
    ctx.restore();

    ctx.save();
        ctx.fillStyle = rightResizer.color;
        ctx.fillRect(rightResizer.pos.x, rightResizer.pos.y, rightResizer.size.x, rightResizer.size.y);

        ctx.fillStyle = bottomResizer.color;
        ctx.fillRect(bottomResizer.pos.x, bottomResizer.pos.y, bottomResizer.size.x, bottomResizer.size.y);

        ctx.fillStyle = cornerResizer.color;
        ctx.fillRect(cornerResizer.pos.x, cornerResizer.pos.y, cornerResizer.size.x, cornerResizer.size.y);
    ctx.restore();

    mouse.reset();
    requestAnimationFrame(frames);
}

requestAnimationFrame((time) => {
    prevtime = time;
    requestAnimationFrame(frames);
});
