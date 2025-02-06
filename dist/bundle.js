// src/main.ts
function wordsFromFile() {
  return fetch("assets/words.txt").then((res) => res.text()).then((text) => text.split("\n"));
}
async function main() {
  const words = await wordsFromFile();
  const typingArea = document.querySelector("#typing-area");
  const wordsDiv = document.createElement("div");
  wordsDiv.id = "words";
  for (let i = 0; i < words.length; i++) {
    const word = document.createElement("div");
    word.classList.add("word");
    for (let j = 0; j < words[i].length; j++) {
      const letterElement = document.createElement("letter");
      console.log(words[i][j]);
      letterElement.innerHTML = words[i][j];
      word.append(letterElement);
    }
    wordsDiv.append(word);
  }
  typingArea.append(wordsDiv);
}
await main();
