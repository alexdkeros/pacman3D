/************************************************
*************************************************
****************Initialize WebGL*****************
*************************************************
*************************************************/
// the WebGL context
var gl;

function initGL(canvas) {
	//DBG
	console.log("Initializing canvas");

    try {
	//get a webgl context
        gl = canvas.getContext("experimental-webgl");
		//assign a viewport width and height based on the HTML canvas element properties
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
		//any error is handled here
		//all errors are visible in the console (F12 in Google chrome)
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }

}


//Find and compile shaders (vertex + fragment shader)
function getShader(gl, id) {
	//DBG
	console.log("Getting shaders");

	//gets the shader scripts (vertex + fragment)
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
	//create shaders
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

	//ask WebGL to compile shaders
	//we check for errors here too
	//all errors are visible in the console (F12 in Google chrome)
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}






/************************************************
*************************************************
********texture operations**********
*************************************************
*************************************************/    
function handleLoadedTexture(texture) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

}


    /**
    initialize texture
    @param {image file} texture image
    */
    function initTexture(img){
        var texture=gl.createTexture();
        texture.image = new Image();
        texture.image.onload = handleLoadedTexture.bind(window,texture); 
        texture.image.src=img;
        return texture;
    }



/************************************************
*************************************************
********pMatrix and mvMatrix operations**********
*************************************************
*************************************************/
//ModelView and Projection matrices
//mat4 comes from the external library
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

//The matrix stack operation are implemented below to handle local transformations

//Push Matrix Operation
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

//Pop Matrix Operation
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


//Sets + Updates matrix uniforms
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


//Rotation function helper
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/************************************************
*************************************************
************keyboard  operations*****************
*************************************************
*************************************************/
    
    //array for keeping pressed keys
    var currentlyPressedKeys = {};
    var xTrans = 0.0;
    var yTrans = 0.0;

    //Keyboard handler
    //do not touch :) 
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;

        if (String.fromCharCode(event.keyCode) == "F") {
            filter += 1;
            if (filter == 3) {
                filter = 0;
            }
        }
    }


    //Keyboard handler
    //do not touch :) 
    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

    //Key pressed callback
    //37-40 are the codes for the arrow keys
    //xTrans + yTrans are used in the ModelView matrix for local transformation of the cube
    function handleKeys() {
        if (currentlyPressedKeys[37]) {
            // Left cursor key
            xTrans -= 0.1;
        }
        if (currentlyPressedKeys[39]) {
            // Right cursor key
            xTrans += 0.1;
        }
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            yTrans += 0.1;
        }
        if (currentlyPressedKeys[40]) {
            // Down cursor key
            yTrans -= 0.1;
        }
    }
