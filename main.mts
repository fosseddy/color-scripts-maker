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

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
const mouse = new Mouse(canvas);

canvas.width = 500;
canvas.height = 300;
canvas.style.border = "1px solid black";

const RESIZER_SIDE = 10;

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
    }

    rightResizer.color = "gray";
    bottomResizer.color = "gray";
    cornerResizer.color = "gray";
    if (activeResizer) {
        activeResizer.color = "lightgray";
    } else {
        if (mouse.isInsideRect(rightResizer)) {
            rightResizer.color = "lightgray";
        } else if (mouse.isInsideRect(bottomResizer)) {
            bottomResizer.color = "lightgray";
        } else if (mouse.isInsideRect(cornerResizer)) {
            cornerResizer.color = "lightgray";
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
