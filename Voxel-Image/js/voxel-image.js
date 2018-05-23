// NOTE: LIGHT_MODE variable can either be set in this file
// or in the corresponding HTML file. It must be present though.

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

// Clear scene function
function clearScene(scene){
    while(scene.children.length > 0)
        scene.remove(scene.children[0]);
}

// Variables for size of voxel image
var imgLength = 10;
var imgRes = 100;
var voxelSize = imgLength / imgRes;

// Create image and virtual canvas (Use 1000x1000 res image)
var img = new Image();
img.crossOrigin = "Anonymous";
var canvas = document.createElement('canvas');

// Create empty 2d arrays to store initial and reduced versions of image
var pixelData;
var pixelDataFormatted = [];
var pixelDataReduced = [];

img.onload = function() {
    // Set canvas width and height
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image to virtual canvas
    canvas.getContext('2d').drawImage(img, 0, 0);
    pixelData = canvas.getContext('2d').getImageData(0, 0, img.width, img.height);

    // Convert pixelData to 2d array filled with RGBA values
    for(var y = 0; y < img.height; y++){
        pixelDataFormatted[y] = [];
        for(var x = 0; x < img.width; x++){
            var pixelRGBA = [];

            // Get initial index of this pixel in pixelData
            var currIndexInit = (img.width * y) + x;

            // Get RGBA values and put them into the formatted pixelData 2d array
            pixelRGBA[0] = pixelData.data[currIndexInit*4];
            pixelRGBA[1] = pixelData.data[currIndexInit*4 + 1];
            pixelRGBA[2] = pixelData.data[currIndexInit*4 + 2];
            pixelRGBA[3] = pixelData.data[currIndexInit*4 + 3];
            pixelDataFormatted[y][x] = pixelRGBA;
        }
    }

    // Reduce array to 100x100 size
    var chunkSize = img.width/imgRes;
    for(var y = 0; y < img.height; y += chunkSize){
        pixelDataReduced[y/chunkSize] = [];
        for(var x = 0; x < img.width; x += chunkSize){
            // Get average RGB value for this chunk
            var avgR = 0, avgG = 0, avgB = 0;
            for(var cy = 0; cy < chunkSize; cy++){
                for(var cx = 0; cx < chunkSize; cx++){
                    avgR += pixelDataFormatted[y + cy][x + cx][0];
                    avgG += pixelDataFormatted[y + cy][x + cx][1];
                    avgB += pixelDataFormatted[y + cy][x + cx][2];
                }
            }
            // Finalize average RGB values
            avgR /= Math.pow(chunkSize, 2);
            avgG /= Math.pow(chunkSize, 2);
            avgB /= Math.pow(chunkSize, 2);
            pixelDataReduced[y/chunkSize][x/chunkSize] = [
                Math.round(avgR), 
                Math.round(avgG), 
                Math.round(avgB)
            ];
        }
    }

    // Clear up memory?
    pixelDataFormatted = 0;
    pixelData = 0;

    // Create geometry to use for all the voxels
    var voxelGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);

    // Loop through reduced 2d array and draw voxels
    for(var y = 0; y < imgRes; y++){
        for(var x = 0; x < imgRes; x++){
            // Get correct color of this voxel
            var mat;
            if(!LIGHT_MODE){
                mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(
                        pixelDataReduced[y][x][0]/255,
                        pixelDataReduced[y][x][1]/255,
                        pixelDataReduced[y][x][2]/255
                    )
                });
            } else {
                mat = new THREE.MeshLambertMaterial({color: "#ffffff"});
            }

            // Get average of RGB values
            var avgRGB = (pixelDataReduced[y][x][0] + 
                pixelDataReduced[y][x][1] + pixelDataReduced[y][x][2])/(3*255);

            // Create voxel
            var voxel = new THREE.Mesh(voxelGeo, mat);

            // Translate voxel to correct location
            voxel.position.set(
                (x * voxelSize) - (imgLength/2),
                // (imageRes - y) is so that the image
                // can be drawn right side up
                ((imgRes - y) * voxelSize) - (imgLength/2),
                -5 + (avgRGB * 5)
            );

            // Add current voxel to scene
            main_scene.add(voxel);
        }
    }
}

// Assign image source
img.src = './eye.jpg';

// If light mode is on, we want lighting to actually
// affect the appearance of the voxel "image"
if(LIGHT_MODE){
    // Create light and set proper values for it
    var light = new THREE.PointLight(0xffffff, 1, 10);
    light.position.set(0, 0, 3);
    light.castShadow = true;
    light.decay = 2;
    light.power = 40;
    renderer.physicallyCorrectLights = true;

    // Add light to the scene
    main_scene.add(light);
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