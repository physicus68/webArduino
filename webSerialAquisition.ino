int       d       = 0;
String    message = String("");

long      Delta   = 1000;
int       N       = -1;
String    An      = String("00000");
int       n       = 0;
long      t0      = 0;
long      t       = 0;

boolean   RUN     = false;


void setup() {  
   Serial.begin(115200);      
   t0 = millis();   
   n = N;
}

void loop() { 
 if (Serial.available() > 0){
    d = Serial.read();
    if ( d=='*'){      
      parser(message);
      message = String("");
    }else{
      message.concat(char(d));
    }        
 }

 t = millis();  
 if ( ((t - t0) > Delta) && RUN ){
  t0 = t;  
  if ( n < N){
     String msg = "";
     msg.concat(String(n,DEC));
     msg.concat(";");
     for(int i = 0 ; i < An.length();i++){
        if(An.charAt(i)=='1'){
          int v = analogRead(i);
          msg.concat(String(v,DEC));
          msg.concat(";");
        }else{          
        }
     }
     Serial.println(msg);
     n++;
  }else{
    RUN = false;
  }
 }
}


 
void parser( String message){  
 if (!message.equals("")){    
    int i = message.indexOf(';');
    String cmd = message.substring(0,i);    
    if (cmd == "START"){
      int j = message.indexOf(';',i+1);
      Delta = long( message.substring(i+1,j).toInt());    
      int k = message.indexOf(';',j+1);
      N = message.substring(j+1,k).toInt();  
      int l = message.indexOf(';',k+1);
      An = message.substring(k+1,l);    
      n = 0;
      RUN = true;
    }
    if (cmd == "STOP"){
      RUN =  false;
    }    
 }
}
