// Create scene and camera.
var main_scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// Initialize renderer.
var renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize orbiting controls.
var controls = new THREE.OrbitControls(camera);
camera.position.set(0, 0, 3);
controls.update();

// Function that can get a random value in a bounded domain
function getBoundedRand(min, max){
    return Math.random() * (max - min) + min;
};

// Make central curve structure
var numCurves = Math.pow(2, 5);
var res = 20;
var curves = [], points = [], geometry = [], ellipses = [], materials = [];
for(var a = 0; a < numCurves; a++){
    // Get random ellipse radii
    var randX = getBoundedRand(.3, 1);
    var randY = getBoundedRand(.3, 1);
    
    // Create the ellipse curve
    curves[a] = new THREE.EllipseCurve(
        -randX, 0,       // centerX, centerY
        randX, randY,    // xRad, yRad
        0, Math.PI/2,    // start and end angles
        false,           // clockwise rotation
        0                // rotation of start and end angles
    );

    // Get points of the curve and create the geometry
    points[a] = curves[a].getPoints(res);
    geometry[a] = new THREE.BufferGeometry().setFromPoints(points[a]);
    geometry[a].rotateY(a * (Math.PI/(numCurves/2)));

    // Create random material (some red-orange-yellow shade)
    var redShade = getBoundedRand(.7, 1);
    var greenShade = getBoundedRand(1 - redShade, redShade);
    materials[a] = new THREE.LineBasicMaterial({
        color: new THREE.Color(redShade, greenShade, 0)
    });

    // Create lines using the newly made geometry and material
    // and then add it to the scene
    ellipses[a] = new THREE.Line(geometry[a], materials[a]);
    main_scene.add(ellipses[a]);
}

// Create "explosions" on end of each trail
var num_deg = Math.pow(2, 2);
var exp_mats = [];
for(var a = 0; a < numCurves; a++){
    // Get center of original shape
    var centerX = points[a][res].x;
    var centerY = points[a][res].y;
    
    // Create quaternion to rotate the position to the right place
    var quat = new THREE.Quaternion();
    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a * (Math.PI/(numCurves/2)))

    // Get position of the center of our "explosion"
    var pos = new THREE.Vector3(centerX, centerY, 0);
    pos.applyQuaternion(quat);

    // Get random material for this explosion
    exp_mats[a] = new THREE.LineBasicMaterial({
        color: new THREE.Color(
            getBoundedRand(.3, 1),
            getBoundedRand(.3, 1),
            getBoundedRand(.3, 1)
        )
    });

    // Rotate through "sphere" to get each point
    for(var i = 0; i < 2*Math.PI; i += (Math.PI/(num_deg))){
        for(var j = 0; j < 2*Math.PI;  j += (Math.PI/(num_deg))){
            // Get a temp random length vector along the given angles i and j
            var len = getBoundedRand(.01, .1);
            var endPoint = new THREE.Vector3(
                len * Math.cos(i) * Math.sin(j),
                len * Math.sin(i) * Math.sin(j),
                len * Math.cos(j) 
            );

            // Translate this endpoint to start at the center of this explosion
            endPoint.add(pos);

            // Create this lines geometry
            var line_geo = new THREE.Geometry();
            line_geo.vertices.push(pos);
            line_geo.vertices.push(endPoint);

            // Create the final line and add it to the scene
            var line_final = new THREE.Line(line_geo, exp_mats[a]);
            main_scene.add(line_final);
        }
    }
}

// Animate function
function animate(){
    requestAnimationFrame(animate);

    // Update controls.
    controls.update();

    // Render main scene
    renderer.render(main_scene, camera);
};

// Check to see if the size of the window has changed and 
// adjust accordingly.
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}, false); 

animate();