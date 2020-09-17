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
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 3);
    controls.update();

    // Setup stats panel
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Initialize Gui
    initGui();
}

// Specify the gui variables that will control the system
var gui_vars = {
    'launch_angle': 45,
    'launch_velocity': 1,
    'height': 1,
    'separation': 1,
    'gravity': 1,
    'axes_on': false,
    'color': "#ffffff",
    'particle_rad': .1,
    'num_particles': 2,
    'dT': .1,
    'randomized_launch': false,
    'bounce': false,
    'deletion_height': -10,
    'drag_coeff': 0,
    'deletion_distance': 35,
    'rate': 1
}

async function initGui(){

    var presetData;
    const getPresetFile = await new Promise(function(resolve, reject){
        $.getJSON("./js/presets.json", function(json){
            presetData = json;
            resolve('Preset file found.');
        });
    });

    // Initialize gui with folders
    var gui = new dat.GUI({
        load: presetData,
        preset: "Default"
    });

    gui.remember(gui_vars);

    var system_folder = gui.addFolder('System Settings');
    var particle_folder = gui.addFolder('Particle Settings');

    // Add variables to the setting GUI
    system_folder.add(gui_vars, 'launch_angle', 0, 90);
    system_folder.add(gui_vars, 'launch_velocity', .1, 3);
    system_folder.add(gui_vars, 'separation', 0, 5);
    system_folder.add(gui_vars, 'gravity', .1, 1.5);
    system_folder.add(gui_vars, 'dT', .01, 1);
    system_folder.add(gui_vars, 'deletion_height');
    system_folder.add(gui_vars, 'deletion_distance');
    system_folder.add(gui_vars, 'drag_coeff', 0, 3, .01);
    system_folder.add(gui_vars, 'rate', 1, 10, 1);
    system_folder.add(gui_vars, 'bounce');
    system_folder.add(gui_vars, 'axes_on');

    particle_folder.addColor(gui_vars, 'color');
    particle_folder.add(gui_vars, 'particle_rad', .01, .5);
    particle_folder.add(gui_vars, 'num_particles', 1, 8, 1);
    particle_folder.add(gui_vars, 'randomized_launch');
}

function draw3DAxes(scene){
    // Create axes materials
    var axis_mat = new THREE.LineBasicMaterial({color: "#ffffff", opacity: .4, transparent: true});

    // Create x-axis line geometry
    var x_line_geo = new THREE.Geometry();
    x_line_geo.vertices.push(new THREE.Vector3(-20, 0, 0));
    x_line_geo.vertices.push(new THREE.Vector3(20, 0, 0));
    var x_line = new THREE.Line(x_line_geo, axis_mat);
    x_line.name = "axes_component";
    scene.add(x_line);

    // Create y-axis line geometry
    var y_line_geo = new THREE.Geometry();
    y_line_geo.vertices.push(new THREE.Vector3(0, -20, 0));
    y_line_geo.vertices.push(new THREE.Vector3(0, 20, 0));
    var y_line = new THREE.Line(y_line_geo, axis_mat);
    y_line.name = "axes_component";
    scene.add(y_line);

    // Create z-axis line geometry
    var z_line_geo = new THREE.Geometry();
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, -20));
    z_line_geo.vertices.push(new THREE.Vector3(0, 0, 20));
    var z_line = new THREE.Line(z_line_geo, axis_mat);
    z_line.name = "axes_component";
    scene.add(z_line);

    // Add GridHelper
    var grid_helper = new THREE.GridHelper(40, 50, 0xffffff, 0xffffff);
    grid_helper.material.transparent = true;
    grid_helper.material.opacity = .1;
    grid_helper.name = "axes_component";
    scene.add(grid_helper);
}

var sprinklerAngle = 0;
var axesDrawn = false;
var lastAngle = 0;

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function update(){

    // Update any existing objects in the main scene and remove old particles
    for(var p = main_scene.children.length - 1; p >= 0; p--){
        if(main_scene.children[p].name == 'particle'){
            main_scene.children[p].update(gui_vars.gravity, gui_vars.drag_coeff, gui_vars.dT, 0);

            if(!gui_vars.bounce){
                // If bouncing is not on, then delete after a certain height
                if(main_scene.children[p].position.y <= gui_vars.deletion_height){
                    main_scene.children.splice(p, 1);
                }
            } else {
                // If bouncing is on, reverse vertical velocity upon hitting deletion height
                if(main_scene.children[p].position.y <= gui_vars.deletion_height){
                    main_scene.children[p].v.y = -main_scene.children[p].v.y;
                }
                // If bouncing is on, delete particles after they exceed a certain distance from the origin
                if(main_scene.children[p].position.length() >= gui_vars.deletion_distance){
                    main_scene.children.splice(p, 1);
                }
            }
        }
    }

    // Particle config used in constructor to pass mesh/geometry info
    var particle_config = {
        'color': gui_vars.color,
        'radius': gui_vars.particle_rad,
    }

    var sprinklerArm = gui_vars.separation / 2;
    var verticalAngle = toRadians(90 - gui_vars.launch_angle);

    if(sprinklerAngle - lastAngle >= gui_vars.dT * gui_vars.rate){
        var particleSeparation = (2 * Math.PI ) / gui_vars.num_particles;
        for(var i = 0; i < gui_vars.num_particles; i++){
            var currentAngle = (particleSeparation * i) + sprinklerAngle;
            
            // Get position of the current particle using cylindrical coordinates
            var p_r = new THREE.Vector3(
                sprinklerArm * Math.sin(currentAngle),
                gui_vars.height,
                sprinklerArm * Math.cos(currentAngle)
            );

            // Get the velocity of the current particle using spherical coordinates
            var p_v = new THREE.Vector3(
                gui_vars.launch_velocity * Math.sin(currentAngle) * Math.sin(verticalAngle),
                gui_vars.launch_velocity * Math.cos(verticalAngle),
                gui_vars.launch_velocity * Math.cos(currentAngle) * Math.sin(verticalAngle)
            );

            // Create particle object using position, velocity and previously created config
            var p = new Particle(p_r, p_v, particle_config);

            // Assign it a name so it can be identified during deletion process
            p.name = 'particle';

            // Add the current particle to the scene
            main_scene.add(p);
        }
        lastAngle = sprinklerAngle;
    }

    // Update the angle of the sprinkler "arm"
    sprinklerAngle += gui_vars.dT;

    // Add the axes if needed
    if(gui_vars.axes_on && !axesDrawn){
        draw3DAxes(main_scene);
        axesDrawn = true;
    }

    // Delete the axes if they are no longer needed
    if(!gui_vars.axes_on && axesDrawn){
        while(main_scene.getObjectByName('axes_component') != null){
            main_scene.remove(main_scene.getObjectByName('axes_component'));
        }
        axesDrawn = false;
    }

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

