class Vec2 {
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
            this.isUp = false;
        });

        window.addEventListener("mouseup", () => {
            this.isUp = true;
            this.isDown = false;
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

const SIDEBAR_SIZE = 10;

interface Sidebar {
    pos: Vec2;
    size: Vec2;
    color: string;
    isDragging: boolean;
    cursorOffset: Vec2;
};

const bottomSidebar: Sidebar = {
    pos: new Vec2(0, canvas.height - SIDEBAR_SIZE),
    size: new Vec2(canvas.width - SIDEBAR_SIZE, SIDEBAR_SIZE),
    color: "gray",
    isDragging: false,
    cursorOffset: new Vec2(0, 0)
};

const rightSidebar: Sidebar = {
    pos: new Vec2(canvas.width - SIDEBAR_SIZE, 0),
    size: new Vec2(SIDEBAR_SIZE, canvas.height - SIDEBAR_SIZE),
    color: "gray",
    isDragging: false,
    cursorOffset: new Vec2(0, 0)
};

const cornerSidebar: Sidebar = {
    pos: new Vec2(canvas.width - SIDEBAR_SIZE, canvas.height - SIDEBAR_SIZE),
    size: new Vec2(SIDEBAR_SIZE, SIDEBAR_SIZE),
    color: "gray",
    isDragging: false,
    cursorOffset: new Vec2(0, 0)
};

function drawSidebar(sb: Sidebar): void {
    const {pos, size, color} = sb;

    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, size.x, size.y);
    ctx.restore();
}

let prevtime = 0;
function frames(time: number): void {
    const dt = (time - prevtime) / 1000;
    prevtime = time;

    if (mouse.isDown) {
        if (!rightSidebar.isDragging && !bottomSidebar.isDragging && !cornerSidebar.isDragging) {
            if (mouse.isInsideRect(rightSidebar)) {
                rightSidebar.isDragging = true;
                rightSidebar.cursorOffset.x = canvas.width - mouse.posglob.x;
            } else if (mouse.isInsideRect(bottomSidebar)) {
                bottomSidebar.isDragging = true;
                bottomSidebar.cursorOffset.y = canvas.height - mouse.posglob.y;
            } else if (mouse.isInsideRect(cornerSidebar)) {
                cornerSidebar.isDragging = true;
                cornerSidebar.cursorOffset.x = canvas.width - mouse.posglob.x;
                cornerSidebar.cursorOffset.y = canvas.height - mouse.posglob.y;
            }
        }
    } else {
        rightSidebar.isDragging = false;
        bottomSidebar.isDragging = false;
        cornerSidebar.isDragging = false;
    }

    if (rightSidebar.isDragging) {
        canvas.width = mouse.posglob.x + rightSidebar.cursorOffset.x;
        rightSidebar.pos.x = canvas.width - SIDEBAR_SIZE;
        bottomSidebar.size.x = canvas.width - SIDEBAR_SIZE;
        cornerSidebar.pos.x = canvas.width - SIDEBAR_SIZE;
    } else if (bottomSidebar.isDragging) {
        canvas.height = mouse.posglob.y + bottomSidebar.cursorOffset.y;
        bottomSidebar.pos.y = canvas.height - SIDEBAR_SIZE;
        rightSidebar.size.y = canvas.height - SIDEBAR_SIZE;
        cornerSidebar.pos.y = canvas.height - SIDEBAR_SIZE;
    } else if (cornerSidebar.isDragging) {
        canvas.width = mouse.posglob.x + cornerSidebar.cursorOffset.x;
        canvas.height = mouse.posglob.y + cornerSidebar.cursorOffset.y;

        rightSidebar.pos.x = canvas.width - SIDEBAR_SIZE;
        bottomSidebar.size.x = canvas.width - SIDEBAR_SIZE;
        cornerSidebar.pos.x = canvas.width - SIDEBAR_SIZE;

        bottomSidebar.pos.y = canvas.height - SIDEBAR_SIZE;
        rightSidebar.size.y = canvas.height - SIDEBAR_SIZE;
        cornerSidebar.pos.y = canvas.height - SIDEBAR_SIZE;

    }

    rightSidebar.color = "gray";
    bottomSidebar.color = "gray";
    cornerSidebar.color = "gray";
    if (rightSidebar.isDragging || mouse.isInsideRect(rightSidebar)) {
        rightSidebar.color = "lightgray";
    } else if (bottomSidebar.isDragging || mouse.isInsideRect(bottomSidebar)) {
        bottomSidebar.color = "lightgray";
    } else if (cornerSidebar.isDragging || mouse.isInsideRect(cornerSidebar)) {
        cornerSidebar.color = "lightgray";
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSidebar(rightSidebar);
    drawSidebar(bottomSidebar);
    drawSidebar(cornerSidebar);

    mouse.reset();
    requestAnimationFrame(frames);
}

requestAnimationFrame((time) => {
    prevtime = time;
    requestAnimationFrame(frames);
});
