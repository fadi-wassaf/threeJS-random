/**
 * This class extends the three.js mesh class to make multiple
 * meshes that have easy to modify motion.
 */
class Particle extends THREE.Mesh {

    /**
     * Main constructor for a modifiable particle mesh.
     * @param {THREE.Vector3} r 
     * @param {THREE.Vector3} v 
     * @param {Object} config 
     */
    constructor(r, v, config){

        // Get config for the appearance of the particle
        var p_opacity = 1;
        var p_color = config.color;
        var p_radius = config.radius;

        // Setup the material we need
        var material = new THREE.MeshBasicMaterial({
            color: p_color,
            opacity: p_opacity,
            transparent: true
        });

        // Setup the particle geometry
        var geometry = new THREE.SphereGeometry(p_radius);
        // var geometry = new THREE.BoxGeometry(p_radius, p_radius, p_radius);

        // Call superconstructor for THREE.Mesh
        super(geometry, material);
        
        // Get initial position and velocity of the particle
        this.r = r;
        this.v = v;

        // Set initial position of the particle
        this.position.x = this.r.x;
        this.position.y = this.r.y;
        this.position.z = this.r.z;

    }

    /**
     * Function to update the position of the particle given the 
     * current gravity and change in time
     * @param {Number} gravity 
     * @param {Number} dT 
     * @param {Number} base_height 
     */
    update(gravity, dT, base_height){

        // Change positions not affected by gravity
        this.r.x = this.r.x + this.v.x * dT;
        this.position.x = this.r.x;
        this.r.z = this.r.z + this.v.z * dT;
        this.position.y = this.r.z;

        // Change the y position and velocity
        this.r.y = this.r.y + (this.v.y * dT) + (0.5 * -gravity * Math.pow(dT, 2));
        this.v.y = this.v.y - gravity * dT;
        this.position.y = this.r.y;

        // Change opacity of particle based on height
        // this.opacity = 

    }

}