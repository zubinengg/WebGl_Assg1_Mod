"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 2;

var bufferId;

var theta = 0;

var sides = 3;

var solid_fill = true;

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), gl.STATIC_DRAW);



    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider").onchange = function (target) {
        numTimesToSubdivide = parseInt(event.target.value);
        render();
    };

    document.getElementById("slider_a").onchange = function (target) {
        theta = parseInt(event.target.value);
        render();
    };
    var m = document.getElementById("mymenu");
    m.addEventListener("click", function () {
        switch (m.selectedIndex) {
            case 0:
                sides = 3;
                break;
            case 1:
                sides = 4;
                break;
            case 2:
                sides = 5;
                break;
            case 3:
                sides = 6;
                break;
        }
        render();
    });

    var k = document.getElementById("fill_type");
    k.addEventListener("click", function () {
        switch (k.selectedIndex) {
            case 0:
                solid_fill = true;
                break;
            case 1:
                solid_fill = false;
                break;
        }
        render();
    });


    render();
}
;

function triangle(a, b, c)
{
    if (solid_fill)
    {
        points.push(a, b, c);
    }
    else
    {
        points.push(a, b, b, c, c, a);
    }
}

function divideTriangle(a, b, c, count)
{

    // check for end of recursion

    if (count == 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        if (!solid_fill)
        {
            divideTriangle(ab, bc, ac, count);
        }
    }
}

function transform() {
    //theta=thetaLoc;
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

window.onload = init;

function render()
{
    var vertices = [];
    var s_angle = 90;
    var length = 1;
    var adder = 360 / sides;
    for (var i = 0; i < sides; i++)
    {
        var rad1 = radians(s_angle);
        var x = length * Math.cos(rad1);
        var y = length * Math.sin(rad1);
        vertices.push(vec2(x, y));
        s_angle += adder;
    }

    console.log(vertices.length);

    if (vertices.length == 3)
    {
        points = [];
        divideTriangle(vertices[0], vertices[1], vertices[2],
                numTimesToSubdivide);
        transform();
    }
    else
    {
        points = [];
        var num = vertices.length;
        for (var i = 0; i < num; i++)
        {
            divideTriangle(vec2(0, 0), vertices[i], vertices[(i + 1) % num],
                    numTimesToSubdivide);
        }
        transform();
    }
    var length = points.length;
    //console.log(points.length);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);  


    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (solid_fill) {
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    } else {
        gl.drawArrays(gl.LINES, 0, points.length);
    }

    points = [];
}


