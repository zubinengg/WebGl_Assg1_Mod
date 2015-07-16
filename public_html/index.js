"use strict";

var gl;
var points = [];
var nsd = 5;
var theta = 90;
var thetaLoc;
var origin = vec2(0, 0);
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //var vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);
    var vertices = [vec2(-1/2, -1/2), vec2(0, 1/2), vec2(1/2, -1/2)];
    divideTriangle(vertices[0], vertices[1], vertices[2], nsd);

    //  Configure WebGL
    console.log(points.length);
    console.log("testing log");
    console.log(vertices.length);
    transform();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 0.5, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    document.getElementById("slider").onchange = function () {
        theta = 360 - event.srcElement.value;
    };
    thetaLoc = gl.getUniformLocation(program, "theta");

    render();
};

function transform() {
    var rad1 = radians(theta);
    //rad = 2;
    for (var i = 0; i < points.length; i++) {
        var temp = points[i];
        var x = temp[0];
        var y = temp[1];
        var d = length(temp);
        var rad = rad1 * (d);
        //rad = rad1;
        points[i] = vec2(x, y);
        var rotatedPosition = vec2(x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad));
        points[i] = rotatedPosition;
    }    
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
    if (count == 0) {
        triangle(a, b, c);
    } else {
        var ab = mix(a, b, 0.5);
        var bc = mix(b, c, 0.5);
        var ca = mix(c, a, 0.5);
        --count;
        divideTriangle(a, ab, ca, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(c, ca, bc, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(thetaLoc, theta);
    
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    
    setTimeout(
            function () {
                requestAnimFrame(render);
            },
            theta
            );
}
