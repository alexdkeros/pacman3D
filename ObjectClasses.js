/*
inheritance function
*/
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} 
/************************************************
*************************************************
********************Objects**********************
*************************************************
*************************************************/
/**
colored object
@constructor
*/
function ColoredObject(){
	/*object properties*/
	this.vertexPositionBuffer;
	this.vertexColorBuffer;
	this.vertexIndexBuffer;
	this.whiteTexture;
}
	/**
	forms object
	@param {float array, int, int} vertices Contains vertices.vals positions and vertices.itemSize, vertices.numItems attributes
	@param {float array, int, int} colors Contains color.vals definitions and colors.itemSizem, colors.numItems attributes
	@param {int array, int, int} indices Contains vertex indices.vals and indices.itemSize, indices.numItems attributes
	*/
	ColoredObject.prototype.formObject=function(vertices,colors,indices){
		//DBG
		////console.log("Forming object");

		//vertices
		this.vertexPositionBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices.vals),gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize=vertices.itemSize;
		this.vertexPositionBuffer.numItems=vertices.numItems;

		//colors
		this.vertexColorBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors.vals),gl.STATIC_DRAW);
		this.vertexColorBuffer.itemSize=colors.itemSize;
		this.vertexColorBuffer.numItems=colors.numItems;
		
		//make white texture
		this.whiteTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,new Uint8Array([1, 1, 1, 1]));

		//indices
		this.vertexIndexBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices.vals),gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize=indices.itemSize;
		this.vertexIndexBuffer.numItems=indices.numItems;
	}

	/**
	draw object
	@private
	@param {gl.MODE} drawingMode, example is gl.TRIANGLES
	*/
	ColoredObject.prototype.drawObj_=function(drawingMode){
		//DBG
		//console.log("Sending to shaderProgram, drawElement");

		//vertices
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,this.vertexPositionBuffer.itemSize,gl.FLOAT, false, 0, 0);

		//bind white texture and turn off textureCoords
		gl.bindTexture(gl.TEXTURE_2D,this.whiteTexture);
		gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
		//colors
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        //indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        //update uniforms
        setMatrixUniforms();
        //Triangles mode
        gl.drawElements(drawingMode, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    /**
    draw object with specified translation
	@param {float array} translation Translation array [x , y, z]
	@param {float, float array} rotation Rotation with rotation.angle and rotation.rotAxis attributes
	*/
	ColoredObject.prototype.drawObj=function(translation, rotation){
		//DBG
		//console.log("Drawing Object to specified location");
		//console.log(translation);
		//console.log(rotation);

		mvPushMatrix();
		mat4.translate(mvMatrix, translation);
		mat4.rotate(mvMatrix, degToRad(rotation.angle), rotation.rotAxis);
		this.drawObj_(gl.TRIANGLES);
		mvPopMatrix();
	}






/**
textured object
@constructor
*/
function TexturedObject(){
	/*object properties*/
	this.vertexPositionBuffer;
	this.vertexNormalBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
	this.texture;
	this.fixRotation;
}
	/**
	forms object
	@param {float array, int, int} vertices Contains vertices.vals positions and vertices.itemSize, vertices.numItems attributes
	@param {float array, int, int} textureCoord Contains texture positioning, textureCoord.vals, textureCoord.itemSizem, textureCoord.numItems attributes
	@param {int array, int, int} indices Contains vertex indices.vals and indices.itemSize, indices.numItems attributes
	*/
	TexturedObject.prototype.formObject=function(vertices,vertexNormals, textureCoord,indices,texture){
		//DBG
		//console.log("Forming object");
		//vertices
		this.vertexPositionBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices.vals),gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize=vertices.itemSize;
		this.vertexPositionBuffer.numItems=vertices.numItems;

		//normals
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals.vals), gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = vertexNormals.itemSize;
        this.vertexNormalBuffer.numItems = vertexNormals.numItems;

		//texture
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord.vals), gl.STATIC_DRAW);
        this.textureCoordBuffer.itemSize = textureCoord.itemSize;
        this.textureCoordBuffer.numItems = textureCoord.numItems;

		
		//indices
		this.vertexIndexBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices.vals),gl.STATIC_DRAW);
		this.vertexIndexBuffer.itemSize=indices.itemSize;
		this.vertexIndexBuffer.numItems=indices.numItems;
	
		this.texture=texture;
	}
	TexturedObject.prototype.setFixRotation=function(rot){
		this.fixRotation=rot;
	}


	/**
	draw object
	@private
	@param {gl.MODE} drawingMode, example is gl.TRIANGLES
	*/
	TexturedObject.prototype.drawObj_=function(drawingMode){
		//DBG
		//console.log("Sending to shaderProgram, drawElement");
		
		//disable color, set it to black
		gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
		//change to add tint to texture
		gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0, 0, 0, 1);
		
		//vertices
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,this.vertexPositionBuffer.itemSize,gl.FLOAT, false, 0, 0);
		
		//texture
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

		//texture
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        //normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        //update uniforms
        setMatrixUniforms();
        //Triangles mode
        gl.drawElements(drawingMode, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    /**
    draw object with specified translation
	@param {float array} translation Translation array [x , y, z]
	@param {float, float array} rotation Rotation with rotation.angle and rotation.rotAxis attributes
	*/
	TexturedObject.prototype.drawObj=function(translation, rotation){
		//DBG
		//console.log("Drawing Object to specified location");

		mvPushMatrix();
		mat4.translate(mvMatrix, translation);
		if (this.fixRotation){
			mat4.rotate(mvMatrix, degToRad(this.fixRotation.angle), this.fixRotation.rotAxis);
		}
		mat4.rotate(mvMatrix, degToRad(rotation.angle), rotation.rotAxis);
		this.drawObj_(gl.TRIANGLES);
		mvPopMatrix();
	}



/**
textured cube
*/
function Tcube(){

}
Tcube.inheritsFrom(TexturedObject);
Tcube.prototype.formObject=function(sideLength,texture){
	var vertices={};
        vertices.vals = [
            // Front face
            -(sideLength/2), -(sideLength/2),  (sideLength/2),
             (sideLength/2), -(sideLength/2),  (sideLength/2),
             (sideLength/2),  (sideLength/2),  (sideLength/2),
            -(sideLength/2),  (sideLength/2),  (sideLength/2),

            // Back face
            -(sideLength/2), -(sideLength/2), -(sideLength/2),
            -(sideLength/2),  (sideLength/2), -(sideLength/2),
             (sideLength/2),  (sideLength/2), -(sideLength/2),
             (sideLength/2), -(sideLength/2), -(sideLength/2),

            // Top face
            -(sideLength/2),  (sideLength/2), -(sideLength/2),
            -(sideLength/2),  (sideLength/2),  (sideLength/2),
             (sideLength/2),  (sideLength/2),  (sideLength/2),
             (sideLength/2),  (sideLength/2), -(sideLength/2),

            // Bottom face
            -(sideLength/2), -(sideLength/2), -(sideLength/2),
             (sideLength/2), -(sideLength/2), -(sideLength/2),
             (sideLength/2), -(sideLength/2),  (sideLength/2),
            -(sideLength/2), -(sideLength/2),  (sideLength/2),

            // Right face
             (sideLength/2), -(sideLength/2), -(sideLength/2),
             (sideLength/2),  (sideLength/2), -(sideLength/2),
             (sideLength/2),  (sideLength/2),  (sideLength/2),
             (sideLength/2), -(sideLength/2),  (sideLength/2),

            // Left face
            -(sideLength/2), -(sideLength/2), -(sideLength/2),
            -(sideLength/2), -(sideLength/2),  (sideLength/2),
            -(sideLength/2),  (sideLength/2),  (sideLength/2),
            -(sideLength/2),  (sideLength/2), -(sideLength/2)
        ];
        vertices.itemSize = 3;
		//we have 24 vertices
        vertices.numItems = 24;

        var vertexNormals = {}
        vertexNormals.vals= [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
        ];
        vertexNormals.itemSize = 3;
        vertexNormals.numItems = 24;
        
        var textureCoords={};
        textureCoords.vals = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        textureCoords.itemSize = 2;
        textureCoords.numItems = 24;
		
		//Index Buffer Object
		var indices={};
		indices.vals = [
		//this numbers are positions in the VBO array above
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
		indices.itemSize = 1;
		//we have 36 indices (6 faces, every face has 2 triangles, each triangle 3 vertices: 2x3x6=36)
        indices.numItems = 36;
    	this.parent.formObject.call(this,vertices,vertexNormals, textureCoords,indices,texture);
}

/*
textured tile
*/
function Ttile(){

}
Ttile.inheritsFrom(TexturedObject);
Ttile.prototype.formObject=function(sideLength,texture){
	var vertices={};
        vertices.vals = [
            // Face
            -(sideLength/2), -(sideLength/2),  -0.5,
             (sideLength/2), -(sideLength/2),  -0.5,
             (sideLength/2),  (sideLength/2),  -0.5,
            -(sideLength/2),  (sideLength/2),  -0.5            
        ];
        vertices.itemSize = 3;
		//we have 24 vertices
        vertices.numItems = 4;
        
        var vertexNormals = {}
        vertexNormals.vals= [
            // Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0
        ];
        vertexNormals.itemSize = 3;
        vertexNormals.numItems = 4;
        
        var textureCoords={};
        textureCoords.vals = [
            // Face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        textureCoords.itemSize = 2;
        textureCoords.numItems = 4;
		
		//Index Buffer Object
		var indices={};
		indices.vals = [
		//this numbers are positions in the VBO array above
            0, 1, 2,      0, 2, 3    // Front face
        ];
		indices.itemSize = 1;
		//we have 6 indices (1 face, every face has 2 triangles, each triangle 3 vertices: 2x3=6)
        indices.numItems = 6;
    	this.parent.formObject.call(this,vertices,vertexNormals,textureCoords,indices,texture);
}

/*
textured sphere
*/
function Tsphere(){

}
Tsphere.inheritsFrom(TexturedObject);
Tsphere.prototype.formObject=function(radius,texture){
    var latitudeBands = 20;
    var longitudeBands = 20;
    var vertexPositionData={};
    vertexPositionData.vals = [];
    var normalData ={};
    normalData.vals = [];
    var textureCoordData = {};
    textureCoordData.vals= [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1-(longNumber / longitudeBands);
            var v = 1- (latNumber / latitudeBands);

            normalData.vals.push(x);
            normalData.vals.push(y);
            normalData.vals.push(z);
            textureCoordData.vals.push(u);
            textureCoordData.vals.push(v);
            vertexPositionData.vals.push(radius * x);
            vertexPositionData.vals.push(radius * y);
            vertexPositionData.vals.push(radius * z);
        }
    }

    vertexPositionData.itemSize=3;
    vertexPositionData.numItems=vertexPositionData.vals.length / 3;

    normalData.itemSize = 3;
    normalData.numItems = normalData.vals.length /3;

    textureCoordData.itemSize = 2;
    textureCoordData.numItems = textureCoordData.vals.length / 2;

    var indexData ={};
    indexData.vals = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.vals.push(first);
            indexData.vals.push(second);
            indexData.vals.push(first + 1);

            indexData.vals.push(second);
            indexData.vals.push(second + 1);
            indexData.vals.push(first + 1);
        }
    }
    indexData.itemSize = 1;
    indexData.numItems = indexData.vals.length;


	this.parent.formObject.call(this,vertexPositionData,normalData,textureCoordData,indexData,texture);
}



/************************************************
*************************************************
*************Pacman Objects**********************
*************************************************
*************************************************/
/*
tile with pellet
*/
function TpelletTile(){
	this.pellet = new Tsphere();
	this.tile = new Ttile();
}
TpelletTile.prototype.formObject=function(radius, sideLength,pTexture, tTexture){
	this.pellet.formObject(radius,pTexture);
	this.tile.formObject(sideLength,tTexture);
}
TpelletTile.prototype.drawObj=function(translation,rotation,pelletTexture,tileTexture){
	var pelletTranslation=math.add([0.0, 0.0, 0.25],translation);
	var pelletRotation={angle:0.0, rotAxis:[0,0,0]};
	this.pellet.drawObj(pelletTranslation, pelletRotation,pelletTexture);

	var tileTranslation=math.add([0.0, 0.0, 0.0],translation);
	var tileRotation={angle:0.0, rotAxis:[0,0,0]};
	this.tile.drawObj(tileTranslation, tileRotation,tileTexture);
}


/************************************************
*************************************************
*************World  Objects**********************
*************************************************
*************************************************/
function World(){
	this.worldArray=[];
	this.worldElements=[];
	this.pelletTexture;
    this.superPelletTexture;
	this.tileTexture;
    this.boxTexture;
    this.pelletCounter=0;
}
World.prototype.loadWorld=function(file){
    var request = new XMLHttpRequest();
    request.open("GET", file);
    request.onreadystatechange =this.handleLoadedWorld.bind(window, request,this);
    request.send();
}
World.prototype.handleLoadedWorld=function(request,el){
	if (request.readyState == 4) {
            var data=request.responseText;
        	var lines=data.split("\n");
        	for (var i in lines){
        		el.worldArray.push(lines[i].split(" "));
        	}
        el.initWorld();
    }
}

World.prototype.initWorld=function(){
	if (this.worldArray.length>0){
		this.pelletTexture=initTexture("metalBall.png");
        this.superPelletTexture=initTexture("superMetalBall.png");
		this.tileTexture=initTexture("metal1.png");
        this.boxTexture=initTexture("metal2.png");
		for (var i in this.worldArray){
			var row=[];
			for (var j in this.worldArray[i]){
				//console.log(this.worldArray[i][j])
				if (this.worldArray[i][j]=="x"){
					var t=new Tcube();
					t.formObject(1,this.boxTexture);
					row.push(t);
				}else if (this.worldArray[i][j]=="p"){
                    this.pelletCounter+=1;
					var t=new TpelletTile();
					t.formObject(0.15,1,this.pelletTexture,this.tileTexture);
					row.push(t);
				}else if (this.worldArray[i][j]=="U"){
					this.pelletCounter+=1;
                    var t=new TpelletTile();
					t.formObject(0.25,1,this.superPelletTexture,this.tileTexture);
					row.push(t);
				}else if (this.worldArray[i][j]=="t"){
					var t=new Ttile();
					t.formObject(1,this.tileTexture);
					row.push(t);
				}
			}
			if (row.length>0){
				this.worldElements.push(row);
			}
		}
		console.log("world initialized");
	}
}
World.prototype.drawWorld=function(){
	if (this.worldElements.length>0){
		for (var i in this.worldElements){
			for (var j in this.worldElements[i]){
				var translation=[j,-i,0];
				var rotation={angle:0, rotAxis:[0,0,0]};
				this.worldElements[i][j].drawObj(translation,rotation);
			}
		}
	}
}
World.prototype.canMove=function(l){
	var location=[-l[1], l[0], l[2]];
	if (this.worldElements.length>0){
		//check for bounds
		if (location[0]>=0 && location[0]<=this.worldElements.length-1){
			if (location[1]>=0 && location[1]<=this.worldElements[math.round(location[0])].length-1){
				//check for cube in the way
				var margin=0.4;
				if (this.worldArray[math.round(location[0]+margin)][math.round(location[1]+margin)]!="x" &&
					this.worldArray[math.round(location[0]-margin)][math.round(location[1]-margin)]!="x" &&
					this.worldArray[math.round(location[0]+margin)][math.round(location[1]-margin)]!="x" &&
					this.worldArray[math.round(location[0]-margin)][math.round(location[1]+margin)]!="x"){
				return true;
				}
			}
		}
	}
	return false;
}
World.prototype.moveTo=function(l){
	var location=[-l[1], l[0], l[2]];
	var x=math.round(location[0]);
	var y=math.round(location[1]);

	if (this.worldArray[x][y]=="p"){
        this.pelletCounter-=1;
		this.worldArray[x][y]="t";

		var t=new Ttile();
		t.formObject(1,this.tileTexture);
		this.worldElements[x][y]=t;

		return "p";
	}else if (this.worldArray[x][y]=="U"){
        this.pelletCounter-=1;
		this.worldArray[x][y]="t";

		var t=new Ttile();
		t.formObject(1,this.tileTexture);
		this.worldElements[x][y]=t;
		
		return "U";
	}
    if (this.pelletCounter==0){
        return "W";
    }
	return null;

}

/*
pacman
*/
function Pacman(){
	this.pacBody;
	this.pacTexture;
	this.translation=[0,0,0];
	this.rotation={angle:0,rotAxis:[0,0,0]};
}
Pacman.prototype.formObject=function(){
	this.pacTexture=initTexture("face.png");
	this.pacBody=new Tsphere();
	this.pacBody.formObject(0.5,this.pacTexture);
}
Pacman.prototype.moveTo=function(location){
	var prevTranslation=this.translation;
	this.translation=location;
	var res=math.subtract(this.translation,prevTranslation);
	if (res[0]>0 && math.round(res[1])==0){	//moving right
		this.rotation.angle=180;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]<0 && math.round(res[1])==0){ //moving left
		this.rotation.angle=0;
		this.rotation.rotAxis=[0,1,0];	
	}else if (res[1]>0 && math.round(res[0])==0){ //moving down 
		this.rotation.angle=-90;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[1]<0 && math.round(res[0])==0){ //moving up
		this.rotation.angle=90;
		this.rotation.rotAxis=[0,1,0];	
	}else if (res[0]<0 && res[1]<0){ //moving diagonaly left-up
		this.rotation.angle=45;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]>0 && res[1]<0){ //moving diagonaly right-up
		this.rotation.angle=135;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]<0 && res[1]>0){ //moving diagonaly left-down
		this.rotation.angle=-45;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]>0 && res[1]>0){ //moving diagonaly right-down
		this.rotation.angle=-135;
		this.rotation.rotAxis=[0,1,0];
	}

}
Pacman.prototype.drawObj=function(){
	this.pacBody.setFixRotation({angle:90, rotAxis:[1,0,0]});
	this.pacBody.drawObj(this.translation,this.rotation);
}
Pacman.prototype.animate=function(world,xT,yT){
	var token=null;
	if (world.canMove([xT,yT,0])){
        P.moveTo([xT,yT,0]);  
        token=world.moveTo([xT,yT,0]);
    }
    xTrans=this.translation[0];
    yTrans=this.translation[1];
    return token;
}
/*
ghost
*/
function Ghost(){
	this.gBody;
	this.gTexture;
    this.alertTexture;
	this.translation=[0,0,0];
	this.rotation={angle:0,rotAxis:[0,0,0]};

	this.eaten=false;
    this.alert=false;

	this.speedX = 0;
	this.speedY = 0;
	this.lastTime=0.0;		


}
Ghost.prototype.formObject=function(texturefile,alerttexturefile){
	this.gTexture=initTexture(texturefile);
    this.alertTexture=initTexture(alerttexturefile);
	this.gBody=new Tsphere();
	this.gBody.formObject(0.5,this.gTexture);

	this.speedX = getRandomArbitrary(-0.05,0.05);
	this.speedY = getRandomArbitrary(-0.05,0.05);
	this.lastTime=0.0;
	this.counter=0.0;
	this.staticPosCounter=0.0;
}
Ghost.prototype.moveTo=function(location){
	var prevTranslation=this.translation;
	this.translation=location;
	var res=math.subtract(this.translation,prevTranslation);
	if (res[0]>0 && math.round(res[1])==0){	//moving right
		this.rotation.angle=180;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]<0 && math.round(res[1])==0){ //moving left
		this.rotation.angle=0;
		this.rotation.rotAxis=[0,1,0];	
	}else if (res[1]>0 && math.round(res[0])==0){ //moving down 
		this.rotation.angle=-90;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[1]<0 && math.round(res[0])==0){ //moving up
		this.rotation.angle=90;
		this.rotation.rotAxis=[0,1,0];	
	}else if (res[0]<0 && res[1]<0){ //moving diagonaly left-up
		this.rotation.angle=45;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]>0 && res[1]<0){ //moving diagonaly right-up
		this.rotation.angle=135;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]<0 && res[1]>0){ //moving diagonaly left-down
		this.rotation.angle=-45;
		this.rotation.rotAxis=[0,1,0];
	}else if (res[0]>0 && res[1]>0){ //moving diagonaly right-down
		this.rotation.angle=-135;
		this.rotation.rotAxis=[0,1,0];
	}

}
Ghost.prototype.drawObj=function(){
	this.gBody.setFixRotation({angle:90, rotAxis:[1,0,0]});
	this.gBody.drawObj(this.translation,this.rotation);
}
Ghost.prototype.animate=function(world){
	if (this.eaten==false){
		if (this.alert==false){
            this.normalAnimate(world);
        }else{
            this.alertAnimate();
        }
	}else{
		this.eatenAnimate();
	}

}
Ghost.prototype.normalAnimate=function(world){
	var timeNow = new Date().getTime();
	var translation=[0,0,0];
	translation[0] = this.translation[0]+this.speedX;
	translation[1] = this.translation[1]+this.speedY;


    if (this.lastTime != 0) {
        var elapsed = timeNow - this.lastTime;

		this.counter += elapsed;
		if (this.counter > 450.0 || this.staticPosCounter>100.0){
			this.speedX =getRandomArbitrary(-0.05,0.05);
		}	
		if (this.counter>350.0|| this.staticPosCounter>80.0){
			this.speedY =getRandomArbitrary(-0.05,0.05);
		}
		if (Math.random() > 0.9){
			this.speedX = getRandomArbitrary(-0.05,0.05);
			this.speedY = getRandomArbitrary(-0.05,0.05);
			this.counter=0;
		}
		
	}
    this.lastTime = timeNow;
    
    if (world.canMove(translation)){
        this.moveTo(translation);
        this.staticPosCounter=0;
    }else{
    	this.staticPosCounter+=1;
    }
}
Ghost.prototype.eatenAnimate=function(world){
	var timeNow = new Date().getTime();
	if (this.lastTime!=0){
		var elapsed=timeNow-this.lastTime;
        this.translation[2]+=0.2;

        if (elapsed>2000){
            this.gBody.formObject(0.5,this.gTexture);
            this.eaten=false;
            this.alert=false;
            this.translation[2]=0;
            this.lastTime=0.0;
        }
        this.moveTo(this.translation);
	}
}
Ghost.prototype.alertAnimate=function(){
    var timeNow = new Date().getTime();
    if (this.lastTime!=0){
        var elapsed=timeNow-this.lastTime;
        this.translation[0]+=getRandomArbitrary(-0.05,0.05);
        this.translation[1]+=getRandomArbitrary(-0.05,0.05);
        if (elapsed>3000){
            this.gBody.formObject(0.5,this.gTexture);
            this.alert=false;
            this.lastTime=0.0;
        }
        this.moveTo(this.translation);
    }
}
Ghost.prototype.eat=function(){
	this.eaten=true;
	this.lastTime=new Date().getTime();
}
Ghost.prototype.alerted=function(){
    this.alert=true;
    this.gBody.formObject(0.25,this.alertTexture);
    this.lastTime=new Date().getTime();
}

function checkColission(el1,el2){
	var margin=0.3;
	if (math.round(el1.translation[0]+margin)==math.round(el2.translation[0]) || math.round(el1.translation[0]-margin)==math.round(el2.translation[0])){
		if (math.round(el1.translation[1]+margin)==math.round(el2.translation[1]) || math.round(el1.translation[1]-margin)==math.round(el2.translation[1])){
			//console.log("COLLISION");
			return true;
		}
	}
	return false;	
}
