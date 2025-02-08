// naming is hard
export class WordStepper {
    private wordIndex = 0;
    private letterIndex = 0;
    constructor(private words: string[]) {}

    public nextLetter() {
        let result = this.words[this.wordIndex][this.letterIndex];
        if (!result) result = "";
        this.letterIndex++;
        return result;
    }

    wordDone() {
        this.letterIndex = 0;
        this.wordIndex++;
    }

    back() {
        if (this.letterIndex <= 0 && this.wordIndex <= 0) {
            return;
        }
        if (this.letterIndex <= 0) {
            this.wordIndex--;
            this.letterIndex = this.words[this.wordIndex].length;
        } else {
            this.letterIndex--;
        }
    }
}
