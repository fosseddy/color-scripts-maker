import {Panel} from "./panel.js";

interface Brush {
    symbol: string;
    fg: Color;
    bg: Color;
}

export interface Color {
    value: string;
    code: number;
}

export class Cell {
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

export const CELL_WIDTH = 16;
export const CELL_HEIGHT = CELL_WIDTH * 1.5;

export const FG: Color = {value: "#d0d0d0", code: 9};
export const BG: Color = {value: "#1c1c1c", code: 9};

export const COLORS: Color[] = [
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

export let cells: Cell[][] = [];
export let brush: Brush = {
    symbol: "█",
    fg: FG,
    bg: BG
};

export const canvas = new Panel("div");
export const textarea = new Panel("textarea");
export const palette = new Panel("div");
export const output = new Panel("div");

export function setCells(cx: Cell[][]): void {
    cells = cx;
}
