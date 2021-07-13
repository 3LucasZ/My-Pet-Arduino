//get action div, displays latest action
var actionDiv = document.getElementById("actionDiv");

/* GAME CONTROL FUNCTIONS */
function StartGame() {
  //Functions that restart the game
  RestartAllMeters();
  //Default all variable globals
  gameInProgress = true;
  previousData = 4;
  defaultArray = idleHappyArray;
  loopedArray = [].concat(defaultArray);
}
//Arduino becomes sad. Triggered when game ends or a meter is at 0.
function ArduinoSad() {
  defaultArray = idleSadArray;
  console.log("Your Arduino Pet feels very sad :(");
}
//Triggered when disconnecting the Arduino.
//Notifications will not be received, so we don't need to worry about disabling meter activations.
function EndGame() {
  ArduinoSad();
  gameInProgress = false;
}

// Callback function for when notifications are received
function handleNotifications(data) {
  console.log("received: ", data);
  actionDiv.innerHTML = "action: " + ACTIONS[data];
  //activate corresponding meter and update loopedArray
  if (data != 4 && data != 5) {
    loopedArray = [].concat(faceArrays[data].concat(defaultArray));
    meters[data].Activate();
  }
  //add corresponding color class and remove previous color class
  RGBdiv.classList.remove(colorsArray[previousData]);
  RGBdiv.classList.add(colorsArray[data]);
  previousData = data;
}
