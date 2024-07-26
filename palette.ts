import {palette, brush, COLORS} from "./app.js";

const SYMS = `█ ▄ ▌ ▐ ▀ ■
░ ▒ ▓
│ ┤ ╡ ╢ ╖ ╕ ╣ ║ ╗ ╝ ╜ ╛ ┐ └ ┴ ┬ ├ ─ ┼ ╞ ╟ ╚ ╔ ╩ ╦ ╠ ═ ╬ ╧ ╨ ╤ ╥ ╙ ╘ ╒ ╓ ╫ ╪ ┘ ┌
☺ ☻ ♥ ♦ ♣ ♠ • ◘ ○ ◙ ♂ ♀ ♪ ♫ ☼ ► ◄ ↕ ‼ ¶ § ▬ ↨ ↑ ↓ → ← ∟ ↔ ▲ ▼ ⌂
! " # $ % & ' () * + , - . / : ; < = > ? @ ª º ¿ ⌐ ¬ ½ ¼ ¡ « » [ \ ] ^ _ \` { | } ~
ɑ ϐ ᴦ ᴨ ∑ ơ µ ᴛ ɸ ϴ Ω ẟ ∞ ∅ ∈ ∩ ≡ ± ≥ ≤ ⌠ ⌡ ÷ ≈ ° ∙ · √ ⁿ ²
0 1 2 3 4 5 6 7 8 9
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
a b c d e f g h i j k l m n o p q r s t u v w x y z`;

export function initPalette(): void {
    palette.element.style.left = `${640 + 20}px`;
    palette.element.style.top = "150px";

    for (const [i, color] of COLORS.entries()) {
        const b = document.createElement("button");

        b.style.width = b.style.height = "20px";
        b.style.background = color.value;

        if (i === 7) {
            b.style.marginRight = "5px";
        }

        b.addEventListener("click", () => {
            brush.fg = color;
        });

        // TODO(art): more user friendly controls
        b.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            brush.bg = color;
        });

        palette.content.appendChild(b);
    }

    const ta = palette.content.appendChild(document.createElement("textarea"));
    ta.style.display = "block";
    ta.style.width = "660px";
    ta.style.height = "175px";

    ta.value = SYMS;

    ta.addEventListener("select", () => {
        let sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
        if (sel.length > 0) {
            sel = sel[sel.length - 1]!;
        }
        brush.symbol = sel;
    });
}
