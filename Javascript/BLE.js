//set up and run the BLE program

//connected or disconnected status div
var statusDiv = document.getElementById("statusDiv");

//"connect" pressed
function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

//disconnecting from BLE, triggered from disconnect button or all meters value at 0
function disconnectToBle() {
  // Dicsonnect
  myBLE.disconnect();
  // update statusDiv
  statusDiv.innerHTML =
    "Status: " + (myBLE.isConnected() ? "Connected" : "Disconnected");
  // End game
  EndGame();
}

//once characteristics are received
function gotCharacteristics(error, characteristics) {
  if (error) console.log("error: ", error);
  if (myBLE.isConnected()) {
    console.log("characteristics: ", characteristics);
    //start the game!
    StartGame();
    //update statusDiv
    statusDiv.innerHTML =
      "Status: " + (myBLE.isConnected() ? "Connected" : "Disconnected");
    //get the action characteristic
    actionCharacteristic = characteristics[0];
    //start notifications
    myBLE.startNotifications(actionCharacteristic, handleNotifications);
  }
}
