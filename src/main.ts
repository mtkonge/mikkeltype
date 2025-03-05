type LetterKind = "correct" | "incorrect" | "out-of-range" | "missing";

type Letter = {
    value: string;
    kind: LetterKind;
    current: "at" | "after" | "not";
};

type Word = {
    letters: Letter[];
};

function range(length: number): number[] {
    return [...Array(length).keys()];
}

type LetterOpts = {
    input: string;
    word: string;
    idx: number;
    current: Letter["current"];
};

type LetterKindOpts = Omit<LetterOpts, "current">;

function letterKind(
    { input, word, idx }: LetterKindOpts,
): LetterKind {
    if (idx >= word.length) {
        return "out-of-range";
    }
    if (idx >= input.length) {
        return "missing";
    }
    if (input[idx] !== word[idx]) {
        return "incorrect";
    }
    return "correct";
}

async function wordsFromFile(): Promise<string[]> {
    return await fetch("words.txt")
        .then((res) => res.text())
        .then((text) => text.split("\n"));
}

function buildLetter({ word, input, idx, current }: LetterOpts): Letter {
    const kind = letterKind({ word, input, idx });
    const value = word[idx] ?? input[idx];
    return {
        kind,
        value,
        current,
    };
}

function letterIsCurrent(
    { word, input, idx }: LetterKindOpts,
): Letter["current"] {
    if (input.length < word.length) {
        return idx === input.length ? "at" : "not";
    }
    return idx === input.length - 1 ? "after" : "not";
}

function buildWord(word: string, input: string, current: boolean): Word {
    const max = Math.max(word.length, input.length);
    const letters = range(max).map((idx) =>
        buildLetter({
            word,
            input,
            idx,
            current: current ? letterIsCurrent({ word, input, idx }) : "not",
        })
    );
    return { letters };
}

function wordCorrect(word: Letter[]): boolean {
    const empty = word.every((letter) => letter.kind === "missing");
    const correct = word.every((letter) => letter.kind === "correct");
    return empty || correct;
}

function buildUi(inputWords: string[], words: string[]): Word[] {
    console.assert(
        inputWords.length <= words.length,
        "you shouldn't render after the typing session is over",
    );
    console.assert(
        inputWords.length > 0,
        "input words should never be empty",
    );

    return words.map((word, wordIdx) => {
        const input = inputWords[wordIdx] ?? "";
        const current = wordIdx === inputWords.length - 1;
        return buildWord(word, input, current);
    });
}

function renderLetter({ kind, value, current }: Letter): HTMLElement {
    const element = document.createElement("span");
    element.textContent = value;
    element.classList.add("letter", `letter-${kind}`);
    element.dataset.current = current;
    return element;
}

function renderWord(word: Word): HTMLElement {
    const letters = word.letters.map(renderLetter);
    const element = document.createElement("div");
    element.classList.add("word");

    const isCurrentWord = word.letters.some((letter) =>
        letter.current !== "not"
    );
    if (!isCurrentWord && !wordCorrect(word.letters)) {
        element.classList.add("word-incorrect");
    }
    element.append(...letters);
    return element;
}

function renderUi(words: Word[]): HTMLElement[] {
    return words.map(renderWord);
}

function moveCaret(caret: HTMLElement, words: HTMLElement) {
    const letters = [
        ...words.querySelectorAll<HTMLElement>(
            "[data-current]",
        ).values(),
    ];
    const letter = letters.find((v) => v.dataset.current !== "not");
    if (letter === undefined) {
        throw new Error("there should always be atleast one caret position");
    }
    const current = letter.dataset.current;
    const rect = letter.getBoundingClientRect();
    if (current === "at") {
        caret.style.left = `${rect.left}px`;
    } else if (current === "after") {
        caret.style.left = `${rect.right}px`;
    } else {
        throw new Error(`unreachable: invalid 'current' value: '${letter}'`);
    }
    caret.style.top = `${rect.top - rect.height * 0.125}px`;
    caret.style.height = `${rect.height}px`;
}

function render(
    input: string,
    words: string[],
) {
    const wordsElement = document.querySelector<HTMLDivElement>("#words")!;
    const inputWords = input.split(" ");
    wordsElement.replaceChildren(
        ...renderUi(buildUi(inputWords, words)),
    );

    const caretElement = document.querySelector<HTMLDivElement>("#caret")!;
    requestAnimationFrame(() => moveCaret(caretElement, wordsElement));
}

async function main() {
    const words = await wordsFromFile();

    const typingArea = document.querySelector<HTMLDivElement>("#typing-area")!;
    const input = document.querySelector<HTMLInputElement>("#words-input")!;
    typingArea.addEventListener("click", () => input.focus());
    input.addEventListener("keydown", () => {
        input.setSelectionRange(input.value.length, input.value.length);
    });
    input.addEventListener(
        "keyup",
        () => render(input.value, words),
    );
    render(input.value, words);
}

main();
