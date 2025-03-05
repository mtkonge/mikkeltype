import { Word, WordStepper } from "./WordStepper.ts";

type InputCorrectness = "correct" | "incorrect" | "out-of-range";

function correctness(
    input: string,
    word: string,
    characterIndex: number,
): InputCorrectness {
    if (characterIndex >= word.length) {
        return "out-of-range";
    }
    if (input[characterIndex] !== word[characterIndex]) {
        return "incorrect";
    }
    return "correct";
}

async function wordsFromFile(): Promise<string[]> {
    return await fetch("assets/words.txt")
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

    // 😭
    const wordFr: Word[] = [];
    for (let i = 0; i < words.length; i++) {
        wordFr.push({ letters: words[i], addedLetters: "" });
    }
    const wordStepper = new WordStepper(wordFr);

    const typingArea = document.querySelector<HTMLDivElement>("#typing-area")!;
    const wordsElement = document.querySelector<HTMLDivElement>("#words")!;
    const input = document.querySelector<HTMLInputElement>("#words-input")!;
    typingArea.addEventListener("click", () => input.focus());
    input.addEventListener("keydown", (event: KeyboardEvent) => {
        const wordElement = wordsElement
            .children[wordStepper.wordIndex];
        const letterElement = wordElement.children[wordStepper.letterIndex];

        if (event.key === " ") {
            wordStepper.wordDone();
            console.log("next word");
        } else if (event.key === "Backspace") {
            wordStepper.back();
            console.log(wordStepper.wordIndex);
            console.log(wordStepper.letterIndex);
            const letterElementBefore =
                wordsElement.children[wordStepper.wordIndex]
                    .children[wordStepper.letterIndex];
            if (wordStepper.currentWord().addedLetters.length > 0) {
                wordsElement.children[wordStepper.wordIndex].removeChild(
                    letterElementBefore,
                );
            } else {
                letterElementBefore.classList.forEach((className) => {
                    letterElementBefore.classList.remove(className);
                });
            }
            console.log("back");
        } else if (event.key.length > 1) {
            return;
        } else if (
            wordStepper.nextLetter() === event.key
        ) {
            letterElement.classList.add("correct");
            console.log("correct");
        } else {
            if (wordStepper.letterIndex > wordElement.children.length) {
                wordStepper.addLetter(event.key);
                const newLetterElement = document.createElement("letter");
                newLetterElement.append(event.key);
                newLetterElement.classList.add("incorrect");
                wordElement.appendChild(newLetterElement);
            } else {
                letterElement.classList.add("incorrect");
            }
            console.log("incorrect");
        }
    });
}

main();
