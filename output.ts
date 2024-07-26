import {output, cells} from "./app.js";

const ESC = "\\x1b";

export function initOutput(): void {
    output.element.style.top = "200px";

    const btn = output.content.appendChild(document.createElement("button"));
    const ta = output.content.appendChild(document.createElement("textarea"));

    btn.style.display = "block";
    btn.textContent = "generate output";

    ta.style.borderRadius = "0px";
    ta.style.display = "block";
    ta.style.border = "none";
    ta.style.borderTop = "1px solid black";

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
        ta.value = buf;
    });
}
