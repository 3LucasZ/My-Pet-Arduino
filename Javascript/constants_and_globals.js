//valid actions
const ACTIONS =     ["feed" ,"play", "clean", "sleep", "none", "waiting"];
//valid colors
const colorsArray = ["EatGrey-bg","PlayGold-bg","CleanBlue-bg","SleepPurple-bg","OffLED-bg","OffLED-bg"]
//face arrays
const idleHappyArray = ["Default", "Default", "Default", "Default", "Blink"];
const idleSadArray = ["Sad", "Sad", "Sad", "Sad", "Sad", "Sad"];
const eatArray = ["Eat", "Eat", "Eat", "Eat", "Eat"];
const playArray = ["Play", "Play", "Play", "Play", "Play", "Play"];
const cleanArray = ["Clean", "Clean", "Clean", "Clean", "Clean", "Clean"];
const sleepArray = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
//valid face arrays
const faceArrays = [eatArray, playArray, cleanArray, sleepArray];
//set default face array
var defaultArray = idleHappyArray;
var loopedArray = [].concat(defaultArray);
//const decay and growth
const REGULAR_DECAY = 5;
const RARE_DECAY = 25;
const RARE_DECAY_RATE = 0.05;
const DECAY_INTERVAL = 500;
const GROWTH = 100;
//const paths
const FacesPath = "../Images/Faces/";
const MeterIconsPath = "../Images/MeterIcons/";
const ArduinoComponentsPath = "../Images/ArduinoComponents/";
//initialize previousData with 4
var previousData = 4;
//set this to the service uuid of your device
const serviceUuid = "19b10010-e8f2-537e-4f6c-d104768a1214";
let actionCharacteristic;
let myBLE = new p5ble();
//Game starts off not in progress. 
//This only controls if DecayAllMeters can be triggered.
var gameInProgress = false;