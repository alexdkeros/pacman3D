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
	/**
	forms object
	@param {float array, int, int} vertices Contains vertices.vals positions and vertices.itemSize, vertices.numItems attributes
	@param {float array, int, int} colors Contains color.vals definitions and colors.itemSizem, colors.numItems attributes
	@param {int array, int, int} indices Contains vertex indices.vals and indices.itemSize, indices.numItems attributes
	*/
	this.formObject=function(vertices,colors,indices){
		//DBG
		console.log("Forming object");

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
	this.drawObj_=function(drawingMode){
		//DBG
		console.log("Sending to shaderProgram, drawElement");

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
	this.drawObj=function(translation, rotation){
		//DBG
		console.log("Drawing Object to specified location");
		console.log(translation);
		console.log(rotation);

		mvPushMatrix();
		mat4.translate(mvMatrix, translation);
		mat4.rotate(mvMatrix, degToRad(rotation.angle), rotation.rotAxis);
		this.drawObj_(gl.TRIANGLES);
		mvPopMatrix();
	}
}





/**
textured object
@constructor
*/
function TexturedObject(img){
	/*object properties*/
	this.vertexPositionBuffer;
	this.textureCoordBuffer;
	this.vertexIndexBuffer;
	this.texture;
	/**
	forms object
	@param {float array, int, int} vertices Contains vertices.vals positions and vertices.itemSize, vertices.numItems attributes
	@param {float array, int, int} textureCoord Contains texture positioning, textureCoord.vals, textureCoord.itemSizem, textureCoord.numItems attributes
	@param {int array, int, int} indices Contains vertex indices.vals and indices.itemSize, indices.numItems attributes
	*/
	this.formObject=function(vertices,textureCoord,indices){
		//DBG
		console.log("Forming object");
		//vertices
		this.vertexPositionBuffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices.vals),gl.STATIC_DRAW);
		this.vertexPositionBuffer.itemSize=vertices.itemSize;
		this.vertexPositionBuffer.numItems=vertices.numItems;
		
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
	}

	/**
	initialize texture
	@param {image file} texture image
	*/
	this.initTexture=function(img){
		this.texture=gl.createTexture();
		this.texture.image = new Image();
		this.texture.image.onload = handleLoadedTexture.bind(window,this.texture); 
		this.texture.image.src=img;
	}

	/**
	draw object
	@private
	@param {gl.MODE} drawingMode, example is gl.TRIANGLES
	*/
	this.drawObj_=function(drawingMode){
		//DBG
		console.log("Sending to shaderProgram, drawElement");
		
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
	this.drawObj=function(translation, rotation){
		//DBG
		console.log("Drawing Object to specified location");
		console.log(translation);
		console.log(rotation);

		mvPushMatrix();
		mat4.translate(mvMatrix, translation);
		mat4.rotate(mvMatrix, degToRad(rotation.angle), rotation.rotAxis);
		this.drawObj_(gl.TRIANGLES);
		mvPopMatrix();
	}
}

