//array for the meters
meters = [];
//num meters empty
emptyMeterCount = 0;
//meterContainer div
var meterContainer = document.getElementById("meters");

/*CUSTOM METER CLASS */
class CustomMeter {
  constructor(bdclass, bgclass, imagepath, idnum) {
    //Set attributes
    this.value = 1000;
    this.decayRate;
    this.idnum = idnum;
    this.idname = ACTIONS[idnum];
    //Meter UI
    meterContainer.innerHTML +=
      `
        <div class="row">
          <img src=` + imagepath + ` class="avatar border border-3 ` + bdclass + ` | remove-left-padding remove-right-padding add-left-margin shift-right"> 
          <div class="responsive-width d-flex  align-items-center | remove-left-padding remove-right-padding">
            <div class="container  high-z-index | remove-left-padding remove-right-padding">
              <div class="progress | border border-start-0 border-3 ` + bdclass + ` RemoveLeftRounded-bd White-bg" style="height: 30px;">
                <div id=` + this.idname + ` class="progress-bar | ` + bgclass + `" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        </div>
        `;
  }
  Activate() {
    //update meter value
    if (this.value >= 1000 - GROWTH) {
      this.value = 1000;
    } else {
      this.value += GROWTH;
    }
    this.UpdateWidth();
  }
  Decay() {
    if (Math.random() < RARE_DECAY_RATE) {
      this.decayRate = RARE_DECAY;
    } else {
      this.decayRate = REGULAR_DECAY;
    }
    if (this.value >= this.decayRate) {
      this.value -= this.decayRate;
    } else {
      this.value = 0;
    }
    this.UpdateWidth();
  }
  UpdateWidth() {
    document.getElementById(this.idname).style =
      "width: " + this.value / 10 + "%";
  }
}
/* FUNCTIONS THAT APPLY TO ALL METERS */
function RestartAllMeters() {
  for (i = 0; i < ACTIONS.length - 2; i++) {
    selectedMeter = meters[i];
    selectedMeter.value = 1000;
  }
}
function DecayAllMeters() {
  if (gameInProgress) {
    //decay all meters
    for (i = 0; i < ACTIONS.length - 2; i++) {
      selectedMeter = meters[i];
      selectedMeter.Decay();
    }
    //find how many meters are empty after decay
    emptyMeterCount = 0;
    for (i = 0; i < ACTIONS.length - 2; i++) {
      selectedMeter = meters[i];
      if (selectedMeter.value == 0) {
        emptyMeterCount += 1;
      }
    }
    //if no meters empty
    if (emptyMeterCount == 0) {
      defaultArray = idleHappyArray;
    }
    // if all meters are empty
    else if (emptyMeterCount == ACTIONS.length - 2) {
      console.log("Arduino is really sad now. Disconnected. :(")
      disconnectToBle();
    }
    // only a few meters empty
    else {
      ArduinoSad();
    }
  }
}

/* INITIALIZE METERS */
//hunger meter
meters.push(
  new CustomMeter(
    "EatGrey-bd",
    "EatGrey-bg",
    MeterIconsPath + "EatMeter" + ".jpg",
    0
  )
);
//play meter
meters.push(
  new CustomMeter(
    "PlayGold-bd",
    "PlayGold-bg",
    MeterIconsPath + "PlayMeter" + ".jpg",
    1
  )
);
//clean meter
meters.push(
  new CustomMeter(
    "CleanBlue-bd",
    "CleanBlue-bg",
    MeterIconsPath + "CleanMeter" + ".jpg",
    2
  )
);
//sleep meter
meters.push(
  new CustomMeter(
    "SleepPurple-bd",
    "SleepPurple-bg",
    MeterIconsPath + "SleepMeter" + ".jpg",
    3
  )
);

decayer = setInterval(DecayAllMeters, DECAY_INTERVAL);

