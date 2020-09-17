// Create global variables that will be needed
var main_scene, camera, renderer, controls, stats, gui;

// Wave 2D Array
var waveSideLength = 2;
var waveVoxelSize = .1;
var voxelsPerSide = waveSideLength / waveVoxelSize;
var voxelGeo = new THREE.BoxGeometry(waveVoxelSize, waveVoxelSize, waveVoxelSize);
var updateCount = 0;
var waveSpeed = 1;
var waveVoxels = [];

function init(){
     // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true});
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

    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Initialize wave
    initWave();

    // Initialize Gui
    initGui();
}

function initGui(){
    // Initialize gui with main folder
    var gui = new dat.GUI();
    var main_folder = gui.addFolder('main');

    // Specify variables that can be changed
    var gui_vars = {
        'wave_speed': 1
    };

    main_folder.add(gui_vars, 'wave_speed', 0, 50).onChange( 
        function() {
            waveSpeed = gui_vars.wave_speed;
        }
    );

    // Start with main folder open
    main_folder.open();
}

// Gets distance from the given coordinates to the line z = x
function getDist(x, z){
    var rot = Math.PI / 4;    
    var x_ = x * Math.cos(rot) + z * Math.sin(rot);
    var dist = x_ * .5;
    return dist;
}

function initWave(){
    // Loop through voxel array to initialize all voxel meshes
    for(var x = 0; x < voxelsPerSide; x++){
        waveVoxels[x] = []
        for(var z = 0; z < voxelsPerSide; z++){

            var tempMat = new THREE.MeshBasicMaterial({color: "#00ff00"});

            // Get initial position of the current voxel
            var xCenter = ((-waveSideLength * x) / voxelsPerSide) - (waveVoxelSize/2) + (waveSideLength/2);
            var zCenter = ((-waveSideLength * z) / voxelsPerSide) - (waveVoxelSize/2) + (waveSideLength/2);
            var dist = getDist(xCenter, zCenter);

            // Pastel rainbow settings
            var freq = .25;
            var p1 = 0, p2 = 2, p3 = 4;
            var center = 200;
            var width = 55;
            var lenMult = 55/getDist(1, 1);

            // Create pastel color based on position
            var voxelMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(
                    Math.round(Math.sin(freq * dist * lenMult + p1) * width + center) / 255,
                    Math.round(Math.sin(freq * dist * lenMult + p2) * width + center) / 255,
                    Math.round(Math.sin(freq * dist * lenMult + p3) * width + center) / 255
                )
            });

            // Finalize mesh and add to scene
            waveVoxels[x][z] = new THREE.Mesh(voxelGeo, voxelMat);
            waveVoxels[x][z].position.set(xCenter, .5 * Math.sin(5 * dist), zCenter);

            main_scene.add(waveVoxels[x][z]);
        }
    }
}

// Update the wave voxel positions over time
function updateWave(){
    updateCount++;
    for(var c = 0; c < main_scene.children.length; c++){
        var x_ = main_scene.children[c].position.x;
        var z_ = main_scene.children[c].position.z;
        main_scene.children[c].position.y = .5 * Math.sin(5 * getDist(x_, z_) + (updateCount/(51-waveSpeed)));
    } 
}

function update(){
    updateWave();
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

init();
animate();