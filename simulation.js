canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
ctx.rect(this.rectX, this.rectY, this.rectWidth, this.rectHeight)

//User params
var numberOfPeople = document.getElementById('number-of-people').value;
var selfIsolating = document.getElementById('percent-self-isolating').value;
var initialInfections = document.getElementById('initial-infections').value;
var timeToRecover = document.getElementById('time-to-recover').value;

//Canvas params
var canvasHeight = 500;
var canvasWidth = 500;

//Physics params
var speedRange  = 1.5;

//Instantiate inital people state
function createPeople(){
    people = [];
    for(i=0; i<numberOfPeople; i++){

        isInfected = false
        infectionTime = null
        isRecovered = false
        isSelfIsolating = false

        //Add initial infections
        if(i < initialInfections){
            isInfected = true
            infectionTime = Math.round((new Date()).getTime() / 1000);
        }

        //Add self-isolation
        if(i < Math.round(0.01*selfIsolating*numberOfPeople)){
            isSelfIsolating = true
        }

        people.push(new component(
            random(1,canvasHeight-1), 
            random(1,canvasWidth-1), 
            random(-speedRange,speedRange), 
            random(-speedRange,speedRange),
            isInfected,
            infectionTime,
            isRecovered,
            isSelfIsolating
            )
        );
    }
    return people
}

people = createPeople()

//Creates the methods that update the state of a person
function component(x,y,xSpeed,ySpeed,isInfected,infectionTime,isRecovered,isSelfIsolating){

    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.isInfected = isInfected;
    this.isRecovered = isRecovered;
    this.radius = 3;
    this.infectionTime = infectionTime;
    this.isSelfIsolating = isSelfIsolating;

    //Draw person
    this.update = function(){
    
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2 * Math.PI);

        if(this.isInfected == false && this.isRecovered == false){
            ctx.fillStyle = '#000000';
        }else if (this.isInfected == true && this.isRecovered == false ) {
            ctx.fillStyle = '#ED3C1B';
        }else if (this.isRecovered == true){
            ctx.fillStyle = '#439E0B';
        }

        ctx.fill();
        ctx.closePath();
    }

    this.newPos = function(){
        if(isSelfIsolating == true){
            this.x = random(0,0.15)*this.xSpeed + this.x;
            this.y = random(0,0.15)*this.ySpeed + this.y;
        }else{
            this.x = this.xSpeed + this.x;
            this.y = this.ySpeed + this.y;
        }
    }

    this.detectBoundaryCollision = function(){
        
        if (this.y >= canvasHeight || this.y <= 0){
            this.ySpeed = -this.ySpeed*random(0.95,1.05)
        }
        if (this.x >= canvasWidth || this.x <= 0){
            this.xSpeed = -this.xSpeed*random(0.95,1.05)
        }
    }

    this.detectPersonTransfer = function(){
        for(i in people){
            trasnferPerson = people[i]

            //ignore current person
            if(trasnferPerson.x == this.x && trasnferPerson.y == this.y){
                return
            }
            
            //Logic for infection
            if (
                circleTouch(trasnferPerson.x, this.x, trasnferPerson.y, this.y, this.radius) &&
                this.isRecovered == false
            ){
                this.ySpeed = -this.ySpeed*random(0.95,1.05)
                this.xSpeed = -this.xSpeed*random(0.95,1.05)

                if(trasnferPerson.isInfected == true){
                    this.isInfected = true
                    this.infectionTime = Math.round((new Date()).getTime() / 1000);
                }
            }   
        }
    }

    this.detectRecovery = function(){
        if(this.isInfected == true){
            currentTime = Math.round((new Date()).getTime() / 1000);
        
            if(currentTime - this.infectionTime > timeToRecover){
                this.isInfected = false
                this.isRecovered = true
            }
        }
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function difference(a, b) { 
    return Math.abs(a - b); 
}

// Return true if circles (x1, y1) and (x2, y2) are overlapping
function circleTouch(x1, x2, y1, y2, radius){
    if( 
        2*radius > (
            Math.sqrt(   
                Math.pow(difference(x1,x2), 2)
                +
                Math.pow(difference(y1,y2), 2)
            )
        )

    ){
        return true
    }else{
        return false
    }
}

function updateArea(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFEFEC";
    ctx.fillRect(0, 0, 500, 500);

    for(i in people){
        person = people[i];
        person.update();
        person.newPos();
        person.detectBoundaryCollision();
        person.detectPersonTransfer()
        person.detectRecovery();
    }

    currentInfected = people.filter(function(s) { return s.isInfected; }).length;
    currentRecovered = people.filter(function(s) { return s.isRecovered; }).length;

    ctx.fillStyle = "#FFEFEC";
    ctx.fillRect(360, 450, 470, 470);
    
    textI = "Infections: "+ currentInfected
    ctx.font = "20px Lucida Console";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.fillText(textI, 370, 470);

    textR = "Recoveries: "+ currentRecovered
    ctx.font = "20px Lucida Console";
    ctx.fillStyle = "green";
    ctx.textAlign = "left";
    ctx.fillText(textR, 370, 490); 
}

function clearAll(){    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFEFEC";
    ctx.fillRect(0, 0, 500, 500);
    people = []
}

function startSimulation(){

    //Reset global params
    numberOfPeople = document.getElementById('number-of-people').value;
    selfIsolating = document.getElementById('percent-self-isolating').value;
    initialInfections = document.getElementById('initial-infections').value;
    timeToRecover = document.getElementById('time-to-recover').value;

    clearAll()
    createPeople()
    clearInterval(initiate)

    initiate = setInterval(updateArea, 20);
}

initiate = setInterval(updateArea, 20);