enum LetterState {
    Correct,
    Incorrect,
    Overflowing,
}

type Letter = {
    letter: string;
    state: LetterState;
};

type Word = {
    letters: Letter[];
};

// naming is hard
export class WordsHandlerController {
    private currentTypedWord: string = "";
    private typedLetters: Word[] = [];
    private wordIndex = 0;
    private letterIndex = 0;

    constructor(private correctWords: string[]) {}

    typeLetter(letter: string): void {
        if (letter === " ") {
            this.currentTypedWord = "";
            this.letterIndex = 0;
            this.wordIndex++;
            return;
        }
        const state = this.stateOfNextLetter(letter);
        this.typedLetters;
    }

    stateOfNextLetter(letter: string): LetterState {
        if (
            this.correctWords[this.wordIndex][this.letterIndex].length ===
                this.currentTypedWord.length
        ) {
            return LetterState.Overflowing;
        } else if (
            this.correctWords[this.wordIndex][this.letterIndex] === letter
        ) {
            return LetterState.Correct;
        } else {
            return LetterState.Incorrect;
        }
    }

    deleteLastLetter(): void {
        if (this.letterIndex <= 0) {
            this.wordIndex--;
            this.letterIndex = this.typedLetters[this.wordIndex].letters.length;
        }
    }
}
