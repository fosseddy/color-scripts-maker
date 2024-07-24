type Tag = keyof HTMLElementTagNameMap

export class Panel<T extends Tag = Tag> {
    element = document.createElement("div");
    header = this.element.appendChild(document.createElement("div"));
    isDragged = false;
    dragOffset = {x: 0, y: 0};

    content: HTMLElementTagNameMap[T];

    constructor(tag: T) {
        this.content = this.element.appendChild(document.createElement(tag));

        this.element.style.position = "absolute";
        this.element.style.border = "1px solid black";

        this.header.style.borderBottom = "1px solid black";
        this.header.style.background = "lightgray";
        this.header.style.height = "16px";
    }
}

export function initPanelsEvents(panels: Panel<Tag>[]): void {
    for (const p of panels) {
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
            p.dragOffset = {
                x: p.element.offsetLeft - event.x,
                y: p.element.offsetTop - event.y
            };

            document.body.style.cursor = "grabbing";
            p.header.style.background = "black";

            for (const pp of panels) {
                pp.element.style.zIndex = "0";
            }
            p.element.style.zIndex = "1";
        });
    }

    window.addEventListener("mouseup", () => {
        for (const p of panels) {
            if (p.isDragged) {
                document.body.style.cursor = "grab";
                p.header.style.background = "lightgray";
                p.isDragged = false;

                const pad = 20;
                if (p.element.offsetLeft + p.element.offsetWidth < pad * 2) {
                    p.element.style.left = `${pad * 2 - p.element.offsetWidth}px`;
                } else if (p.element.offsetLeft + pad * 2 > window.innerWidth) {
                    p.element.style.left = `${window.innerWidth - pad * 2}px`;
                }
                if (p.element.offsetTop < 0) {
                    p.element.style.top = "0px";
                } else if (p.element.offsetTop + pad > window.innerHeight) {
                    p.element.style.top = `${window.innerHeight - pad}px`;
                }
            }
        }
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
        for (const p of panels) {
            if (p.isDragged) {
                p.element.style.left = `${event.x + p.dragOffset.x}px`;
                p.element.style.top = `${event.y + p.dragOffset.y}px`;
            }
        }
    });
}
