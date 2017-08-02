// All words used in this hangman game.
// Make sure everything in lower case!
var randomWords = ["3dhubs", "filament", "layer", "marvin", "order", "print"];

var countHP = 5;
var countSuggest = 3;

var chosenWord = pickRandomWord(randomWords);
var progress = chosenWord; // How many letters are still need to be guessed.
var is = []; // List of index of correctly guessed letters.

var linesProps; // User interface lines properties (coordinates, ...).
var margin;

var upperText; // GUI to display winning/losing or `countHP`.
var suggestButton;

var mainMenuButtons = ["? suggest", "& retry"];
var mainMenuFunctions = [suggestLetters, reInit];
var mainMenuTextSize;
var mainMenuWidth;

var guiLetterProgresses = [];
var guiLines = [];
var guiMainMenuButtons = [];
var guiMainMenuTexts = [];



function setup () {
  createCanvas(960, 120);

  margin = Math.ceil((width > height ? width : height)/100);
  mainMenuTextSize = (width > height ? height : width)/3 - margin/3;

  // Draw the main upper text.
  upperText = new textGUI(
      guiMainMenuTexts,
      setHP(countHP),
      margin,
      0,
      mainMenuTextSize
  );
  upperText.fill = "red"; // Initial red text to display hit points (HP).

  // Draw the main menu buttons.
  for (var i = 0; i < mainMenuButtons.length; i ++) {
    if(mainMenuButtons[i] === "? suggest") {
      suggestButton = new textButtonGUI(
        guiMainMenuButtons,
        mainMenuButtons[i],
        margin,
        mainMenuTextSize*(i + 1),
        mainMenuTextSize,
        mainMenuFunctions[i]
      );
    }
    else {
      new textButtonGUI(
        guiMainMenuButtons,
        mainMenuButtons[i],
        margin,
        mainMenuTextSize*(i + 1),
        mainMenuTextSize,
        mainMenuFunctions[i]
      );
    }
  }

  // Need to get `upperText.textW`.
  upperText.draw();

  // Set lines properties.
  mainMenuWidth = upperText.textW;
  linesProps = createLinesProps(
      chosenWord,
      mainMenuWidth + 30,
      height - 20,
      width - (mainMenuWidth + 50)
  );
  // Draw lines!
  createLinesGUI(linesProps);
}



function draw () {
  background(255, 204, 4);
  cursor(ARROW);

  // Draw GUI (these need to be drawn in order).
  for (var i = 0; i < guiMainMenuTexts.length; i ++) guiMainMenuTexts[i].draw();
  for (var i = 0; i < guiMainMenuButtons.length; i ++)
    guiMainMenuButtons[i].draw();
  for (var i = 0; i < guiLines.length; i ++) guiLines[i].draw();
  for (var i = 0; i < guiLetterProgresses.length; i ++)
    guiLetterProgresses[i].draw();
}



function keyPressed () {
  var charPressed = String.fromCharCode(keyCode).toLowerCase();

  if (countHP > 0 && progress.length > 0) {
    if (progress.indexOf(charPressed) > -1) correctGuess(charPressed);
    else wrongGuess();
  }
}



function mousePressed () {
  for (var i = 0; i < guiMainMenuButtons.length; i ++)
    guiMainMenuButtons[i].mousePressed();
}



function pickRandomWord (_array) {
  return _array[Math.floor(Math.random()*_array.length)];
}



function createLinesProps (_string, _x, _y, _width) {
  // Default values.
  if (_x === undefined) _x = 0;
  if (_y === undefined) _y = 0;
  if (_width === undefined) _width = width;

  var linesMargin = margin * 4;
  var length = (_width - linesMargin*(_string.length - 1))/_string.length;
  var pos = [];

  if (linesMargin < 10) { linesMargin = 10; }

  for (var i = 0; i < _string.length; i ++) {
    var coord = {};
    coord.x1 = _x + (length*i) + (linesMargin*i);
    coord.x2 = coord.x1 + length;
    coord.y1 = coord.y2 = _y;
    pos.push(coord);
  }

  var props = {};
  props.pos = pos;
  props.length = length;
  props.width = _width;

  return props;
}



function setHP (_int) {
  var str = "";
  for (var i = 0; i < _int; i ++) str = str + "<3 "
  return str.substring(0, str.length - 1); // Remove the last " " character.
}



function correctGuess (_charPressed) {
  // Remove the recently correct letter from `progress`.
  progress = removeLetters(progress, _charPressed);
  // Looking for index for all `_charPressed`.
  var is = indexesOf(chosenWord.split(""), _charPressed);

  // Add GUI for each recent correct letters.
  for (var i = 0; i < is.length; i ++) {
    new textGUI(
      guiLetterProgresses,
      _charPressed,
      linesProps.pos[is[i]].x1 + linesProps.length/2,
      linesProps.pos[is[i]].y1 - margin,
      (linesProps.length - 5 <= 12 ? 12 : linesProps.length - 5),
      CENTER,
      BASELINE
    );
  }

  checkWin();
}



function checkWin () {
  if (progress.length <= 0) {
    countSuggest = 0;
    suggestButton.fill = "grey";

    upperText.fill = "green";
    upperText.text = "you win!";
  }
}



function wrongGuess () {
  countHP --; // Reduce HP by one.
  upperText.text = setHP(countHP); // Set `upperText` text into the newest HP.

  checkLose();
}



function checkLose () {
  if (countHP <= 0) {
    countSuggest = 0;
    suggestButton.fill = "grey";

    upperText.fill = "red";
    upperText.text = "you lose!";

    giveSolution();
  }
}



// Function to give all remaining letters if the game already lost.
function giveSolution () {
  for (var i = 0; i < progress.split("").length; i ++) {
    var is = indexesOf(chosenWord.split(""), progress.split("")[i]);

    for (var j = 0; j < is.length; j ++) {
      var letterProgress = new textGUI(
        guiLetterProgresses,
        progress.split("")[i],
        linesProps.pos[is[j]].x1 + linesProps.length/2,
        linesProps.pos[is[j]].y1 - margin,
      (linesProps.length - 5 <= 12 ? 12 : linesProps.length - 5),
        CENTER,
        BASELINE
      );

      // Mark the given letters with gray color.
      letterProgress.fill = "grey";
    }
  }
}



function removeLetters (_string, _rmString, _all) {
  if (_all === undefined) _all = true;

  if (_all) return _string.split(_rmString).join("");
  else return _string.replace(_rmString, "");
}



// Function to suggest letters (can suggest multiple letters).
function suggestLetters (_x) {
  // Default value.
  if (_x === undefined || _x < 1) _x = 1;

  if (countHP > 0 && countSuggest > 0) {
    countSuggest --; // Decrease the suggest counter.
    // Turn the suggest button to gray if there is no more suggestion available.
    if (countSuggest <= 0) suggestButton.fill = "grey";

    // Suggest a letter.
    if (_x === 1) {
      var letter = progress.charAt(Math.floor(Math.random()*progress.length));
      putLetterSuggestion(letter);

      checkWin();

      return letter;
    }

    // Suggest `_x` letters.
    var letters = [];
    var progressTemp = progress; // Make sure to suggest a different letter.

    // Give random suggested letters.
    for (var i = 0; i < _x; i ++){
      var letter = progressTemp.charAt(
        Math.floor(Math.random()*progress.length)
      );
      letters.push(letter);
      progressTemp = removeLetters(progressTemp, letter);
    }

    // Make sure the array `letters` unique.
    letters = Array.from(new Set(letters));
    // If there is nothing to return.
    if (letters.length === 1 && letters[0] === "") return [];

    // Double loop! Not efficient but whatever XD.
    for (var i = 0; i < letters.length; i ++) putLetterSuggestions(letters[i]);

    checkWin();

    return arr;
  }
}



// Put the suggested letter as with GUI.
function putLetterSuggestion (_value) {
  progress = removeLetters(progress, _value);
  var is = indexesOf(chosenWord.split(""), _value);
  for (var i = 0; i < is.length; i ++) {
    new textGUI(
      guiLetterProgresses,
      _value,
      linesProps.pos[is[i]].x1 + linesProps.length/2,
      linesProps.pos[is[i]].y1 - margin,
      (linesProps.length - 5 <= 12 ? 12 : linesProps.length - 5),
      CENTER,
      BASELINE
    );
  }
}



// Function to return multiple indexes in an array for found element.
function indexesOf (_array, _element) {
  var indexes = [];
  for (var i = 0; i < _array.length; i ++) {
    if (_array[i] == _element) indexes.push(i);
  }

  return indexes;
}



function reInit () {
  guiLetterProgresses = [];
  guiLines = [];

  countHP = 5;
  countSuggest = 3;

  chosenWord = pickRandomWord(randomWords);
  progress = chosenWord;

  suggestButton.fill = "black";
  upperText.fill = "red";
  upperText.text = setHP(countHP);

  // Set the line properties.
  linesProps = createLinesProps(
      chosenWord,
      mainMenuWidth + 30,
      height - 20,
      width - (mainMenuWidth + 50)
  );
  createLinesGUI(linesProps);
}



function createLinesGUI (_lineProps) {
  for (var i = 0; i < _lineProps.pos.length; i ++) {
    new lineGUI(guiLines, _lineProps.pos[i].x1, _lineProps.pos[i].y1, _lineProps.pos[i].x2, _lineProps.pos[i].y2, 10);
  }
}



function lineGUI (_array, _x1, _y1, _x2, _y2, _weight) {
  // Push into buttons array.
  _array.push(this);

  this.stroke = "black";

  this.draw = function () {
    strokeWeight(_weight);
    stroke(this.stroke);
    line(_x1, _y1, _x2, _y2);
    stroke("black");
    strokeWeight(1);
  };
}



function textButtonGUI (
  _array,
  _text,
  _x,
  _y,
  _fontSize,
  _callback,
  _args
) {
  // Default value.
  if (_callback === undefined) _callback = function () { console.log(_text + " mouse pressed"); }

  // Push into buttons array.
  _array.push(this);

  this.text = _text;
  this.fill = "black";

  this.draw = function () {
    fill(this.fill);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(_fontSize);

    text(this.text, _x, _y);
    this.textW = textWidth(_text);
    this.textH = _fontSize;

    textSize(12);
    textAlign(RIGHT, CENTER);
    stroke("black");
    fill("black");

    this.hover();
  };

  this.hover = function () {
    if (
      mouseX > _x &&
      mouseX < _x + this.textW &&
      mouseY > _y &&
      mouseY < _y + this.textH
    ) cursor(HAND);
  }

  this.mousePressed = function () {
    if (
      mouseX > _x &&
      mouseX < _x + this.textW &&
      mouseY > _y &&
      mouseY < _y + this.textH
    ) _callback.apply(this, _args);
  };
}



function textGUI (
  _array,
  _text,
  _x,
  _y,
  _fontSize,
  _hAlign,
  _vAlign
) {
  // Default values.
  if (_hAlign === undefined) _hAlign = LEFT;
  if (_vAlign === undefined) _vAlign = TOP;

  // Push into text array.
  _array.push(this);

  this.text = _text;
  this.fill = "black";

  this.draw = function () {
    fill(this.fill);
    noStroke();
    textAlign(_hAlign, _vAlign);
    textSize(_fontSize);

    text(this.text, _x, _y);
    this.textW = textWidth(this.text);

    textSize(12);
    textAlign(RIGHT, CENTER);
    stroke("black");
    fill("black");
  };
}