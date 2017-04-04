var ball = {};
var myjson;
var poz;
var vyber;
var pad,ciel,start = false; 
var smer = 1;    // smer 1 lopta ide doprava, smer 0 lopta ide dolava
var old_poz = 99999;
var level = 1;


$.getJSON('plocha.json', function (json) {
		myjson = json;
});

		
$(document).ready(function() {
	kresli_plochu(); //vykresli plochu labyrintu
});


ball = {     // objekt lopty s funkciami draw a clear pre animaciu
	x: 20,
	y: 20,
	radius:15,
	color: 'red',
	
	draw: function(){	
		var canvas = document.getElementById("plocha");
		var context = canvas.getContext("2d");
		
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x,this.y,this.radius,0,Math.PI*2);
		context.fill();
		context.closePath();	
	},
	
	clear: function(){
		var canvas = document.getElementById("plocha");
		var context = canvas.getContext("2d");
		
		context.fillStyle = '#694F3E';
		context.beginPath();
		context.arc(this.x,this.y,15.6,0,Math.PI*2);
		context.fill();
		context.closePath();
		
	}
	
	
};

function zapni(){
	if (!start){ // ak hra nebezi, sputi hruS
		
		if (vyber==undefined){   // najskor musi byt vybrata priehrada
			swal ('Najprv vyber priehradku',"","warning");
			return;
		}
		
		start = true;  
		vyber = true;  // nastavi na true aby sa nedalo vyber pocas hry
		
		var timer = setInterval(function(){
		pos_i = Math.floor(ball.y/40);  // vypocet kde sa gula nachadza podla mapy v json.
		pos_j = Math.floor(ball.x/50);
		
		
		if (pos_i>6){  
			clearInterval(timer); // ak je v cieli, vypni casovac
			return;
		}
		
		
		if (myjson[pos_i][pos_j]=='M'){  // ak je pozicia jama nastav pad a zmen smer	
			pad = true;
			if (pos_i==6){   // gula sa dostala do ciela
				ciel = true;
			}
			if (smer==1){  // zmen smer na opacny
				ball.clear();
				ball.x += 15; // pomocne pixely aby lopticka padla cez stred jamy
				smer=0;			
			}
			else if (smer==0){ // zmen smer na opacny
				ball.clear();
				ball.x -= 15;
				smer=1;
			}
		}
		update();
		},60);
	}
}

function c_level(id){ // zmen level
	if (!start){
		level = id;
		kresli_plochu();
	}
}

function reset_everything(){  // resetuje nastavanie pre novu hru 
	ball.x = 20;
	ball.y = 20;
	pad = false;
	ciel = false;
	start = false;
	vyber = undefined;
	smer = 1;
	
	
}

function update(){  // animacia gule
	if (!pad){
		if (smer==1){
			if (ball.x>580){
				smer=0;
			}
			ball.clear();	
			ball.x += 7;
			ball.draw();
		}
		if (smer==0){
			if (ball.x<20){
				smer=1;
			}
			ball.clear();
			ball.x -= 7;
			ball.draw();
		}
	}
	else{
		if (ciel){				
			ball.y += 20;
			over_poziciu();
		}
		ball.clear();	
		ball.y += 40;
		ball.draw();		
	}
	pad = false;
	
	
}

function over_poziciu(){
	    $.ajax({   // pripoji sa na server a overi poziciu
        url: 'http://www.st.fmph.uniba.sk/~knechta2/projekt-hra/vysledky.php',  
        data: "",                        
        dataType: 'json',                
        success: function(data)   // ak uspech       
        {
			
            if (poz == data[level-1]["jama"]) {
				if (level==3){
					swal("Správna voľba","Gratulujem, dokončili ste všetky levely.","success");
				}
				else{
					swal("Správna voľba","Gratulujem,uhádli ste správnu priehradku","success");
				}
				
				if (level==1){  // odomkni dalsi level
					 document.getElementById("lvl2").disabled = false;
				}
				if (level==2){ // odomkni dalsi level
					 document.getElementById("lvl3").disabled = false;
				}
				level += 1;
				if (level>3){
					level = 1;
				}
				reset_everything();
				kresli_plochu();
             
            }else{ // ak neuspech
				swal("Nesprávne","Žial nezvolili ste správnu priehradku,skúste znova","error");
				reset_everything();
				kresli_plochu();				
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            alert( textStatus);
        }
    });
	
}

function oznac_moznost(event) {
	var canvas = document.getElementById("plocha");
	var context = canvas.getContext("2d");	
   
   if (event.offsetX !== undefined && event.offsetY !== undefined  && event.offsetY>295  && event.offsetY<351 && !vyber) 
	{ 
		
		context.strokeStyle = 'black';   //prekresli staru moznost
		context.lineWidth = 5.6;
		context.strokeRect(old_poz*50,295,50,55);
		
		
		canv_x = event.offsetX;
		canv_y = event.offsetY;
		poz = Math.floor(canv_x/50);
		
		context.strokeStyle = 'yellow';   // oznac novu moznost
		context.strokeRect(poz*50,295,50,55);
		old_poz = poz;
		vyber = false;
		
	}
}

function kresli_plochu(){  // vykreslenie plochy a priehradok
	var x = 0;
	var y = 40;	
	var canvas = document.getElementById("plocha");
	canvas.addEventListener('mousedown',oznac_moznost,false);
	var context = canvas.getContext("2d");
	context.clearRect(0,0,900,900);
	context.strokeStyle = 'black';
	
	$.getJSON('plocha'+level+'.json', function (json) {
		myjson = json;
	
	for	(i=0;i<12;i++){
		context.lineWidth = 5;
		context.font = "36px Courier";
		context.strokeRect(i*50, 295,50,55);
		context.fillStyle = 'black';
		context.fillText(i,i*50+5,330);
	}
	
	context.beginPath();
	context.lineWidth = 2;
	for (i=0;i<=6;i++){
		for (j=0;j<=11;j++) {           
              if (myjson[i][j]=='C'){
                  context.moveTo(x,y);
				  x += 50;
				  context.lineTo(x,y);
				  context.stroke();
               }
			  if (myjson[i][j]=='M'){
				  
				  x += 50;
			  }
                           
          }
		y += 40;
		x = 0;
	}
	context.closePath();
	}) 
};
	


	

                   