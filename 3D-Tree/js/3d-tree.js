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

// Variables for running this
var total_layers = 3;
var branches_per_node = 8;
var branch_angles = Math.PI/4;

function createTree(layers, num_legs, pos){
    if(layers <= 0)
        return;
    for(var a = 0; a < num_legs; a++){
        // Get length of current leg
        var len = layers * getBoundedRand(.3, .6);

        // Create endpoint of current leg
        var endPoint = new THREE.Vector3(
            len * Math.cos(getBoundedRand(Math.PI/6, Math.PI/3)),
            len * Math.sin(getBoundedRand(Math.PI/6, Math.PI/3)),
            0
        );

        // Create quaternion to rotate the endpoint to the right place
        var quat = new THREE.Quaternion();
        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a * ((2 * Math.PI)/(num_legs)));

        // Apply quaternion to the endpoint
        endPoint.applyQuaternion(quat);

        // Transform to endpoint to relative spot off of last branch pos
        endPoint.add(pos);

        // Create the line geometry
        var line_geo = new THREE.Geometry();
        line_geo.vertices.push(pos);
        line_geo.vertices.push(endPoint);

        // Create line material based on endpoint heights
        var mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(
                (pos.y + endPoint.y + 2)/(2 * (total_layers - 1)) , 
                1,
                (pos.y + endPoint.y + 2)/(2 * (total_layers - 1)) 
            )
        });    

        // Create the final line and add it to the scene
        var line_final = new THREE.Line(line_geo, mat);
        main_scene.add(line_final);

        // Recurse through rest of this branch
        createTree(layers - 1, num_legs, endPoint);
    }
}

createTree(total_layers, branches_per_node, new THREE.Vector3(0, -1, 0));

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