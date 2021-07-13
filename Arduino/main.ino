//==============================================================================
// Includes
//==============================================================================

#include <Arduino_LSM9DS1.h>
#include <TensorFlowLite.h>
#include <tensorflow/lite/micro/all_ops_resolver.h>
#include <tensorflow/lite/micro/micro_error_reporter.h>
#include <tensorflow/lite/micro/micro_interpreter.h>
#include <tensorflow/lite/schema/schema_generated.h>
#include <tensorflow/lite/version.h>

#include <ArduinoBLE.h>

// This is the model you trained in Tiny Motion Trainer, converted to 
// a C style byte array.
#include "model.h"

// Values from Tiny Motion Trainer
#define MOTION_THRESHOLD 0.1
#define CAPTURE_DELAY 1000 // This is now in milliseconds
#define NUM_SAMPLES 75

// Array to map gesture index to a name
const char *GESTURES[] = {
    "feed", "play", "clean", "sleep"
};


//==============================================================================
// Capture variables
//==============================================================================

#define NUM_GESTURES (sizeof(GESTURES) / sizeof(GESTURES[0]))

bool isCapturing = false;

// Num samples read from the IMU sensors
// "Full" by default to start in idle
int numSamplesRead = 0;


//==============================================================================
// TensorFlow variables
//==============================================================================

// Global variables used for TensorFlow Lite (Micro)
tflite::MicroErrorReporter tflErrorReporter;

// Auto resolve all the TensorFlow Lite for MicroInterpreters ops, for reduced memory-footprint change this to only 
// include the op's you need.
tflite::AllOpsResolver tflOpsResolver;

// Setup model
const tflite::Model* tflModel = nullptr;
tflite::MicroInterpreter* tflInterpreter = nullptr;
TfLiteTensor* tflInputTensor = nullptr;
TfLiteTensor* tflOutputTensor = nullptr;

// Create a static memory buffer for TensorFlow Lite for MicroInterpreters, the size may need to
// be adjusted based on the model you are using
constexpr int tensorArenaSize = 8 * 1024;
byte tensorArena[tensorArenaSize];


//==============================================================================
// Setup / Loop
//==============================================================================
void setup() {
  
  pinMode(LED_BUILTIN, OUTPUT);
        
  Serial.begin(9600);

  // This waits for serial monitor to connect
  // Only use it if testing while Arduino is connected to a computer with Serial Monitor for debugging.
  // while (!Serial); 

  // Initialize IMU sensors
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  // Print out the samples rates of the IMUs
  Serial.print("Accelerometer sample rate: ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");
  Serial.print("Gyroscope sample rate: ");
  Serial.print(IMU.gyroscopeSampleRate());
  Serial.println(" Hz");

  Serial.println();

  // Get the TFL representation of the model byte array
  tflModel = tflite::GetModel(model);
  if (tflModel->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("Model schema mismatch!");
    while (1);
  }

  // Create an interpreter to run the model
  tflInterpreter = new tflite::MicroInterpreter(tflModel, tflOpsResolver, tensorArena, tensorArenaSize, &tflErrorReporter);

  // Allocate memory for the model's input and output tensors
  tflInterpreter->AllocateTensors();

  // Get pointers for the model's input and output tensors
  tflInputTensor = tflInterpreter->input(0);
  tflOutputTensor = tflInterpreter->output(0);
  Serial.println("Set up finished");
}

void loop() {
  // BLE action Service
  BLEService actionService("19b10010-e8f2-537e-4f6c-d104768a1214");

  // BLE action Level Characteristic
  BLEUnsignedCharCharacteristic actionDetectedChar("19b10010-e8f2-537e-4f6c-d104768a1214",
  BLERead | BLENotify); // remote clients will be able to get notifications if this characteristic changes

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1);
  }
  BLE.setLocalName("actionMonitor");
  BLE.setAdvertisedService(actionService); // add the service UUID
  actionService.addCharacteristic(actionDetectedChar); // add the action level characteristic
  BLE.addService(actionService); // Add the action service
  actionDetectedChar.writeValue(5); // set initial value for this characteristic, 5 is the waiting signal
  
  // start advertising
  BLE.advertise();
  Serial.println("Bluetooth device active, waiting for connections...");
  while(1){
    // wait for a BLE central
    BLEDevice central = BLE.central();
    // if a central is connected to the peripheral:
    if (central) {
      Serial.print("Connected to central: ");
      // print the central's BT address:
      Serial.println(central.address());
      while(central.connected()){
        //declare IMU variables
        float aX, aY, aZ, gX, gY, gZ;
      
        // Wait for motion above the threshold setting
        while (!isCapturing && central.connected()) {
          if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
           
            IMU.readAcceleration(aX, aY, aZ);
            IMU.readGyroscope(gX, gY, gZ);
      
            // Sum absolute values
            float average = fabs(aX / 4.0) + fabs(aY / 4.0) + fabs(aZ / 4.0) + fabs(gX / 2000.0) + fabs(gY / 2000.0) + fabs(gZ / 2000.0);
            average /= 6.;
      
            // Above the threshold?
            if (average >= MOTION_THRESHOLD) {
              isCapturing = true;
              numSamplesRead = 0;
              break;
            }
          }
        }
        while (isCapturing && central.connected()) {
          // Check if both acceleration and gyroscope data is available
          if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
      
            // read the acceleration and gyroscope data
            IMU.readAcceleration(aX, aY, aZ);
            IMU.readGyroscope(gX, gY, gZ);
      
            // Normalize the IMU data between -1 to 1 and store in the model's
            // input tensor. Accelerometer data ranges between -4 and 4,
            // gyroscope data ranges between -2000 and 2000
            tflInputTensor->data.f[numSamplesRead * 6 + 0] = aX / 4.0;
            tflInputTensor->data.f[numSamplesRead * 6 + 1] = aY / 4.0;
            tflInputTensor->data.f[numSamplesRead * 6 + 2] = aZ / 4.0;
            tflInputTensor->data.f[numSamplesRead * 6 + 3] = gX / 2000.0;
            tflInputTensor->data.f[numSamplesRead * 6 + 4] = gY / 2000.0;
            tflInputTensor->data.f[numSamplesRead * 6 + 5] = gZ / 2000.0;
      
            numSamplesRead++;
      
            // Do we have the samples we need?
            if (numSamplesRead == NUM_SAMPLES) {
              
              // Stop capturing
              isCapturing = false;
              
              // Run inference
              TfLiteStatus invokeStatus = tflInterpreter->Invoke();
              if (invokeStatus != kTfLiteOk) {
                Serial.println("Error: Invoke failed!");
                while (1);
                return;
              }
      
              // Loop through the output tensor values from the model
              int maxIndex = 0;
              float maxValue = 0;
              for (int i = 0; i < NUM_GESTURES; i++) {
                float _value = tflOutputTensor->data.f[i];
                if(_value > maxValue){
                  maxValue = _value;
                  maxIndex = i;
                }
                Serial.print(GESTURES[i]);
                Serial.print(": ");
                Serial.println(tflOutputTensor->data.f[i], 6);
              }
              // Only run if the confidence of the prediction is above 50%
              // Otherwise, ignore, (probably a false trigger)
              Serial.print("Winner: ");
              Serial.print(GESTURES[maxIndex]);
              if (maxValue > 0.5) {
                //signal for winning action
                actionDetectedChar.writeValue(maxIndex);
                Serial.println();
              }
              else {
                //signal for none detected
                actionDetectedChar.writeValue(4);
                Serial.print("However, confidence is too low: ");
                Serial.print(maxValue);
                Serial.println();
              }
              // Add delay to not double trigger
              delay(CAPTURE_DELAY);
              Serial.print("Waiting...");
              //signal for waiting
              actionDetectedChar.writeValue(5);
            }
          }
        }
        actionDetectedChar.writeValue(5);
      }
      Serial.print("Disconnected from central: ");
      Serial.println(central.address());
    }
  }
}