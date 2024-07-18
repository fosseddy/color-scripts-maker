export class Vec2 {
    constructor(
        public x: number,
        public y: number
    ) {}
}

interface Rect {
    pos: Vec2;
    size: Vec2;
}

class Mouse {
    pos = new Vec2(0, 0);
    posglob = new Vec2(0, 0);
    isClicked = false;
    isMouseDown = false;
    isMouseUp = false;

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
            this.isMouseDown = true;
            this.isMouseUp = false;
        });

        window.addEventListener("mouseup", () => {
            this.isMouseUp = true;
            this.isMouseDown = false;
        });
    }

    reset(): void {
        this.isClicked = false;
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

let drag = false;
let dragoff = 0;

let prevtime = 0;
function frames(time: number): void {
    const dt = (time - prevtime) / 1000;
    prevtime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.style.cursor = "default";
    if (mouse.pos.x > canvas.width - 20 && mouse.pos.x < canvas.width) {
        canvas.style.cursor = "pointer";
        drag = mouse.isMouseDown;
        if (drag) {
            if (dragoff === 0) {
                dragoff = canvas.width - mouse.posglob.x;
            }
        } else {
            if (dragoff !== 0) {
                dragoff = 0;
            }
        }
    }

    if (drag) {
        canvas.width = mouse.posglob.x + dragoff;
    }

    mouse.reset();
    requestAnimationFrame(frames);
}

requestAnimationFrame((time) => {
    prevtime = time;
    requestAnimationFrame(frames);
});
