// naming is hard

export type Word = {
    letters: string;
    addedLetters: string;
};

export class WordStepper {
    wordIndex = 0;
    letterIndex = 0;
    constructor(private words: Word[]) {}

    nextLetter(): string {
        let result = (this.words[this.wordIndex].letters +
            this.words[this.wordIndex].addedLetters)[
                this.letterIndex
            ];
        if (!result) result = "";
        this.letterIndex++;
        return result;
    }

    addLetter(letter: string) {
        this.words[this.wordIndex].addedLetters += letter;
    }

    wordDone() {
        this.letterIndex = 0;
        this.wordIndex++;
    }

    currentWord() {
        return this.words[this.wordIndex];
    }

    back() {
        if (this.letterIndex <= 0 && this.wordIndex <= 0) {
            return;
        }
        if (this.letterIndex <= 0) {
            this.wordIndex--;
            this.letterIndex = (this.words[this.wordIndex].letters +
                this.words[this.wordIndex].addedLetters)
                .length - 1;
        } else {
            if (this.words[this.wordIndex].addedLetters.length > 0) {
                this.words[this.wordIndex].addedLetters = this
                    .words[this.wordIndex].addedLetters.slice(
                        0,
                        this.words[this.wordIndex].addedLetters.length - 1,
                    );
            }
            this.letterIndex--;
        }
    }
}
