import { WordStepper } from "./WordStepper.ts";

function wordsFromFile(): Promise<string[]> {
    return fetch("assets/words.txt")
        .then((res) => res.text())
        .then((text) => text.split("\n"));
}

function addWordsToTypingArea(words: string[]) {
    const typingArea = document.querySelector<HTMLDivElement>("#typing-area")!;
    const wordsDiv = document.createElement("div");
    wordsDiv.id = "words";
    for (let i = 0; i < words.length; i++) {
        const word = document.createElement("div");
        word.classList.add("word");
        for (let j = 0; j < words[i].length; j++) {
            const letterElement = document.createElement("letter");
            letterElement.innerHTML = words[i][j];
            word.append(letterElement);
        }
        wordsDiv.append(word);
    }
    typingArea.append(wordsDiv);
}

async function main() {
    const words = await wordsFromFile();
    addWordsToTypingArea(words);
    const wordStepper = new WordStepper(words);

    const typingArea = document.querySelector<HTMLDivElement>("#typing-area")!;
    const input = document.querySelector<HTMLInputElement>("#words-input")!;
    typingArea.addEventListener("click", () => input.focus());
    input.addEventListener("keyup", (event: KeyboardEvent) => {
        if (event.key === " ") {
            wordStepper.wordDone();
            console.log("next word");
        } else if (event.key === "Backspace") {
            wordStepper.back();
            console.log("back");
        } else if (
            wordStepper.nextLetter() === input.value[input.value.length - 1]
        ) {
            console.log("correct");
        }
    });
}

main();
