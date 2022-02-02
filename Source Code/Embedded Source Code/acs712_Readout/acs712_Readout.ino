//PRO MINI 5V, tested
const int Sensor_Pin = A0;        // Pin that the sensor output is tied to
unsigned int Sensitivity = 185;   // 185mV/A for 5A, 100 mV/A for 20A and 66mV/A for 30A Module
float Vpp = 0; // peak-peak voltage 
float Vrms = 0; // rms voltage
float Irms = 0; // rms current
float Supply_Voltage = 233.0; // Mains voltage
float Vcc = 5;         // ADC reference voltage
float power = 0;         // power in watt              
float kWh =0 ;             // Energy in kkWh
unsigned long last_time =0;
unsigned long current_time =0;
unsigned int calibration = 250;
unsigned int pF = 95;

// AC power measurement using the ACS712
void getACS712() {
  Vpp = getVPP();
  Vrms = (Vpp/2.0) *0.707; 
  Vrms = Vrms - (calibration / 10000.0);  // calibtration
  Irms = (Vrms * 1000)/Sensitivity ;
  if((Irms > -0.015) && (Irms < 0.008)){  // remove low end noise
    Irms = 0.0;
  }
  power = (Supply_Voltage * Irms) * (pF / 100.0); 
  last_time = current_time;
  current_time = millis();    
  kWh = kWh+  power *(( current_time -last_time) /3600000.0); //cumulativly add the new measurement to the total
}

float getVPP()//get voltage peak to peak voltages
{
  float result; 
  int readValue;                
  int maxValue = 0;             
  int minValue = 1024;          
  uint32_t start_time = millis();
  while((millis()-start_time) < 950) //read every 0.95 Sec
  {
     readValue = analogRead(Sensor_Pin);    
     if (readValue > maxValue) 
     {         
         maxValue = readValue; 
     }
     if (readValue < minValue) 
     {          
         minValue = readValue;
     }
  } 
   float resultBeforeDivision = ((maxValue - minValue) * Vcc);
   result = resultBeforeDivision / 1024.0;  
   return result;
 }

void setup() {
  // Sensor pin setup
  pinMode(Sensor_Pin, INPUT);
  digitalWrite(Sensor_Pin, HIGH);

  // Uart setup
  Serial.begin(9600); 
}

void loop() {
  // Read sensor data
  getACS712();

  // Wait for esp32 to give commands on uart before returning the cumulative measured kWh.
  // Reset the cumulative kWh count after sending
  while(Serial.available()){
    String incomming = Serial.readString(); // Read uart string to clear the buffer
    Serial.println(kWh);
    kWh = 0;
  }
}
