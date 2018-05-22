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
camera.position.set(0, 0, 10);
controls.update();

// Function that can get a random value in a bounded domain
function getBoundedRand(min, max){
    return Math.random() * (max - min) + min;
};

// Clear scene function
function clearScene(scene){
    while(scene.children.length > 0)
        scene.remove(scene.children[0]);
}

// Get img source from file
var img = new Image();
// Get image values
img.src = './moon.jpg';
// img.onload = function() {};

// Create virtual canvas that is used to get pixel data
var canvas = document.createElement('canvas');
canvas.width = img.width;
canvas.height = img.height;
canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

// Get pixel data
var pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height);

// var imageData = canvas.getContext('2d').getImageData(0, 0, imgWidth, imgHeight);
// console.log(img.naturalWidth);

// Scale image to fit in the area on screen

// Make 2d array of voxel z-coordinates based off of
// image pixel darkness

// Make voxels and draw them

// Add light source

var boxGeo = new THREE.BoxGeometry(.1, .1, .1);
var mat = new THREE.MeshBasicMaterial({color: "#00ff00"});
var cube = new THREE.Mesh(boxGeo, mat);
main_scene.add(cube);

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