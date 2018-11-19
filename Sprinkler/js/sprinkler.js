// Create global variables that will be needed
var main_scene, camera, renderer, controls, stats, gui;
var visualizer_div;

// Variables for testing cube
var cubeMesh, cubeWireMesh;

window.onload = function(){ 
    init();
    animate();
};

function init(){
    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create scene and camera.
    main_scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    // Add listener that checks to see if the size of the
    // window has changed and adjust accordingly.
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false); 

    // Initialize orbiting controls.
    controls = new THREE.OrbitControls(camera);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.15;
    // controls.enableZoom = true;
    // controls.zoomSpeed = 1.2;
    camera.position.set(0, 0, 3);
    controls.update();

    // Setup stats panel
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Initialize testing cube
    //initTestCube();

    // Initialize Gui
    initGui();
}

// Specify the gui variables that
var gui_vars = {
    'launch_angle': 45,
    'launch_velocity': .1,
    'height': .5,
    'separation': 1,
    'gravity': 1,
    'axes_on': false,
    'color': "#ffffff",
    'particle_rad': .1,
    'dT': .1
}

function initGui(){
    // Initialize gui with folders
    var gui = new dat.GUI();
    var system_folder = gui.addFolder('System Settings');
    var particle_folder = gui.addFolder('Particle Settings');

    // Add variables to the setting GUI
    system_folder.add(gui_vars, 'launch_angle', 0, 90);
    system_folder.add(gui_vars, 'launch_velocity', .1, 3);
    system_folder.add(gui_vars, 'height');
    system_folder.add(gui_vars, 'separation');
    system_folder.add(gui_vars, 'gravity');
    system_folder.add(gui_vars, 'axes_on');
    system_folder.add(gui_vars, 'dT', .01, 1);
    particle_folder.addColor(gui_vars, 'color');
    particle_folder.add(gui_vars, 'particle_rad', .2, 1);

    // Start with main folder open
    // main_folder.open();
}

function initTestCube(){
    // Test object to show dat.gui working
    var cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    var cubeWire = new THREE.WireframeGeometry(cubeGeo);
    var meshMaterial = new THREE.MeshBasicMaterial({color: "#0000ff"});
    var wireMaterial = new THREE.MeshBasicMaterial({color: "#ffffff"});
    wireMaterial.wireframe = true;
    wireMaterial.wireframeLinewidth = 3;
    cubeMesh = new THREE.Mesh(cubeGeo, meshMaterial);
    cubeMesh.name = 'cubeMesh';
    cubeWireMesh = new THREE.Mesh(cubeGeo, wireMaterial);
    cubeWireMesh.name = 'cubeWire';
    main_scene.add(cubeMesh);
    main_scene.add(cubeWireMesh);
}

var sprinklerAngle = 0;

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function update(){

    // Update any existing objects in the main scene and remove old particles
    for(var p = main_scene.children.length - 1; p >= 0; p--){
        main_scene.children[p].update(gui_vars.gravity, gui_vars.dT, 0);
        if(main_scene.children[p].position <= 0){
            main_scene.children.splice(p, 1);
        }
    }

    // Particle config
    var particle_config = {
        'color': gui_vars.color,
        'radius': gui_vars.particle_rad,
    }

    var sprinklerArm = gui_vars.separation / 2;
    var verticalAngle = toRadians(90 - gui_vars.launch_angle);

    // Get position vectors for particle 1 and 2 using cylindrical coordinates
    var p1_r = new THREE.Vector3(
        sprinklerArm * Math.cos(sprinklerAngle),
        gui_vars.height,
        sprinklerArm * Math.sin(sprinklerAngle)
    );
    var p2_r = new THREE.Vector3(
        -sprinklerArm * Math.cos(sprinklerAngle),
        gui_vars.height,
        -sprinklerArm * Math.sin(sprinklerAngle)
    );

    // Get velocity vectors for particle 1 and 2 using spherical coordinates
    var p1_v = new THREE.Vector3(
        gui_vars.launch_velocity * Math.sin(sprinklerAngle) * Math.sin(verticalAngle),
        gui_vars.launch_velocity * Math.cos(verticalAngle),
        gui_vars.launch_velocity * Math.cos(sprinklerAngle) * Math.sin(verticalAngle)
    );
    var p2_v = new THREE.Vector3(
        -gui_vars.launch_velocity * Math.sin(sprinklerAngle) * Math.sin(verticalAngle),
        gui_vars.launch_velocity * Math.cos(verticalAngle),
        -gui_vars.launch_velocity * Math.cos(sprinklerAngle) * Math.sin(verticalAngle)
    );

    // Create particle 1 and 2 objects
    var p1 = new Particle(p1_r, p1_v, particle_config);
    var p2 = new Particle(p2_r, p2_v, particle_config);

    // Add particle 1 and 2 to the scene
    main_scene.add(p1);
    main_scene.add(p2);

    // Update the angle of the sprinkler "arm"
    sprinklerAngle += gui_vars.dT;
}

function render(){
    // Render main scene
    renderer.render(main_scene, camera);
}

function animate(){
    requestAnimationFrame(animate);

    // Update controls.
    controls.update();

    // Run update and render
    update();
    render();

    // Update stats
    stats.update();
}


// Clear scene function
function clearScene(scene){
    while(scene.children.length > 0)
        scene.remove(scene.children[0]);
}

