// Create global variables that will be needed
var main_scene, camera, renderer, controls, stats, gui;

// Variables for testing cube
var cubeMesh, cubeWireMesh;

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
    controls = new THREE.OrbitControls(camera);
    camera.position.set(0, 0, 3);
    controls.update();

    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Initialize testing cube
    initTestCube();

    // Initialize Gui
    initGui();
}

function initGui(){
    // Initialize gui with main folder
    var gui = new dat.GUI();
    var main_folder = gui.addFolder('main');

    // Specify variables that can be changed
    var gui_vars = {
        'mesh_on': true,
        'wireframe_on': true
    };

    main_folder.add(gui_vars, 'mesh_on').onChange( 
        function() {
            switch(gui_vars.mesh_on) {

                case false:
                    console.log('Removed solid mesh.');
                    main_scene.remove(main_scene.getObjectByName(cubeMesh.name));
                break;
                
                case true:
                    console.log('Added solid mesh.');            
                    main_scene.add(cubeMesh);
                    break;
                
                default:
                    break;
                
            }
        }
    );

    main_folder.add(gui_vars, 'wireframe_on').onChange(
        function() {
            switch(gui_vars.wireframe_on) {

                case false:
                    console.log('Removed wireframe mesh.');                
                    main_scene.remove(main_scene.getObjectByName(cubeWireMesh.name));
                    break;

                case true:
                    console.log('Added wireframe mesh.');                                    
                    main_scene.add(cubeWireMesh);
                    break;

                default:
                    break;
                
            }
        }
    );

    // Start with main folder open
    main_folder.open();
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

function update(){

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