import {textarea, cells} from "./app.js";

// TODO(art): use display block for textarea
export function initTextarea(): void {
    textarea.element.style.border = "none";
    textarea.element.style.left = `${640 + 20}px`;

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
}
