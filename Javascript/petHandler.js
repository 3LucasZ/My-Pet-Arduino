//get div that contains the pet
petContainer = document.getElementById("petContainer");

/*ARDUINO PET CLASS */
class ArduinoPet {
  constructor() {
    petContainer.innerHTML +=
      `
        <div class="container pet-container" style="position: relative"> 
          <img src="../Images/ArduinoPet2.jpg" class="pet-image">
          <img src="` + FacesPath + `Default.jpg" class="pet-face" id="face-img">
                
          <input 
            type="image"
            src="`+ArduinoComponentsPath+`Microphone.jpg"
            id="microphone-popover"
            data-bs-toggle="popover" 
            title="Digital microphone" 
            data-bs-placement="bottom"
          />
          <input 
            type="image"
            src="`+ArduinoComponentsPath+`IMU.jpg"
            id="IMU-popover"
            data-bs-toggle="popover" 
            title="IMU Sensor" 
            data-bs-content="Measures motion, vibration, orientation"
            data-bs-placement="bottom"
          />
          <input 
            type="image"
            src="`+ArduinoComponentsPath+`SurroundingsSensor.jpg"
            id="SurroundingsSensor-popover"
            data-bs-toggle="popover" 
            title="Surroundings Sensor" 
            data-bs-content="Measures color, brightness, proximity, detects gesture"
            data-bs-placement="bottom"
          />
          <input 
            type="image"
            src="`+ArduinoComponentsPath+`ClimateSensor.jpg"
            id="ClimateSensor-popover"
            data-bs-toggle="popover" 
            title="Climate Sensor" 
            data-bs-content="Measures temperature, humidity, pressure"
            data-bs-placement="bottom"
          />
          <div id="RGB-LED" class="` + colorsArray[4] + `">

          </div>
        </div>
      `;
  }
  UpdateFace() {
    //debugging
    //console.log(loopedArray);
    //console.log(loopedArray[0]);
    if (loopedArray[0] === undefined) {
      loopedArray = [].concat(defaultArray);
    }
    document.getElementById("face-img").src =
      FacesPath + loopedArray[0] + ".jpg";
    //remove the first element of the array
    loopedArray.shift();
  }
}

//myPet is the pet
myPet = new ArduinoPet();

//get RGB div
var RGBdiv = document.getElementById("RGB-LED");

//Allow popovers, and make them all dismissable style
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl, {
    trigger: 'focus'
  })
})

//Update pet face every 200 ms
setInterval(myPet.UpdateFace, 200);
