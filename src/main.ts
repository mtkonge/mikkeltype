type LetterKind = "correct" | "incorrect" | "out-of-range" | "missing";

type Letter = {
    value: string;
    kind: LetterKind;
    current: "at" | "after" | "not";
};

type Word = {
    index: number;
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

type WordInfo = {
    word: string;
    input: string;
    wordIndex: number;
    currentInputIndex: number;
};

function buildWord(
    { word, input, wordIndex, currentInputIndex }: WordInfo,
): Word {
    const max = Math.max(word.length, input.length);
    const current = wordIndex === currentInputIndex;
    const letters = range(max).map((idx) => {
        return buildLetter({
            word,
            input,
            idx,
            current: current ? letterIsCurrent({ word, input, idx }) : "not",
        });
    });
    return { letters, index: wordIndex };
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

    return words.map((word, wordIndex) => {
        const input = inputWords[wordIndex] ?? "";
        return buildWord({
            word,
            input,
            wordIndex,
            currentInputIndex: inputWords.length - 1,
        });
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
    element.id = `word-${word.index}`;

    const isCurrentWord = word.letters.some((letter) =>
        letter.current !== "not"
    );
    if (!isCurrentWord && !wordCorrect(word.letters)) {
        element.classList.add("word-incorrect");
    }
    element.append(...letters);
    return element;
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
    let x;
    if (current === "at") {
        x = rect.left;
    } else if (current === "after") {
        x = rect.right;
    } else {
        throw new Error(`unreachable: invalid 'current' value: '${letter}'`);
    }
    const y = rect.top;
    caret.style.transform = `translate(${x}px, ${y}px)`;
}

function diffUi(old: Word[], current: Word[]): Word[] {
    console.assert(
        old.length === current.length,
        "should not add old or new words after start",
    );
    return range(current.length).filter((index) => {
        const oldLetters = old[index].letters;
        const currentLetters = current[index].letters;
        if (oldLetters.length !== currentLetters.length) {
            return true;
        }
        return range(currentLetters.length).some((index) => {
            const old = oldLetters[index];
            const current = currentLetters[index];
            return current.kind !== old.kind || current.value !== old.value ||
                current.current !== old.current;
        });
    }).map((index) => current[index]);
}

function renderUi(words: Word[]): HTMLElement[] {
    return words.map(renderWord);
}

function animateCaret(wordsElement: HTMLElement) {
    const caretElement = document.querySelector<HTMLDivElement>("#caret")!;
    requestAnimationFrame(() => moveCaret(caretElement, wordsElement));
}

function render(
    input: string[],
    words: string[],
    old: Word[] | null,
): Word[] {
    const wordsElement = document.querySelector<HTMLDivElement>("#words")!;
    const current = buildUi(input, words);
    if (old === null) {
        wordsElement.replaceChildren(...renderUi(current));
        animateCaret(wordsElement);
        return current;
    }
    const ui = diffUi(old, current);
    for (const word of ui) {
        const element = document.getElementById(`word-${word.index}`);
        if (!element) {
            throw new Error("we always render based off of an old input value");
        }
        element.replaceWith(
            renderWord(word),
        );
    }
    animateCaret(wordsElement);

    return current;
}

async function main() {
    const words = await wordsFromFile();

    const typingArea = document.querySelector<HTMLDivElement>("#typing-area")!;
    const input = document.querySelector<HTMLInputElement>("#words-input")!;

    let oldUi = render(input.value.split(" "), words, null);

    typingArea.addEventListener("click", () => input.focus());
    input.addEventListener("keydown", () => {
        input.setSelectionRange(input.value.length, input.value.length);
    });
    addEventListener(
        "keyup",
        () => oldUi = render(input.value.split(" "), words, oldUi),
    );
    oldUi = render(input.value.split(" "), words, oldUi);
}

main();
