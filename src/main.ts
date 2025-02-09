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
    const wordsElement = document.querySelector<HTMLDivElement>("#words")!;
    const input = document.querySelector<HTMLInputElement>("#words-input")!;
    typingArea.addEventListener("click", () => input.focus());
    input.addEventListener("keydown", (event: KeyboardEvent) => {
        const letterElement = wordsElement.children[wordStepper.wordIndex]
            .children[wordStepper.letterIndex];

        console.log(letterElement);
        if (event.key === " ") {
            wordStepper.wordDone();
            console.log("next word");
        } else if (event.key === "Backspace") {
            wordStepper.back();
            const letterElementBefore =
                wordsElement.children[wordStepper.wordIndex]
                    .children[wordStepper.letterIndex];

            letterElementBefore.classList.forEach((className) => {
                letterElementBefore.classList.remove(className);
            });
            console.log("back");
        } else if (
            wordStepper.nextLetter() === event.key
        ) {
            letterElement.classList.add("correct");
            console.log("correct");
        } else {
            letterElement.classList.add("incorrect");
            console.log("incorrect");
        }
    });
}

main();
