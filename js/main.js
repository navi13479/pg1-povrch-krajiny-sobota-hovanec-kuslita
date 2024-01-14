import * as THREE from "three";
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";

//scene
let camera, scene, renderer, controls;

// skybox
let sun, moon, sky, ambientLight;

// lighting
let sunlight, moonlight;

//terrain
let terrain, water1, water2, groundMaterial;
let mapSize = 4000;

let autoRotation = false;
const rotationSpeed = 0.1;
const rotationSpeed_day = 0.1;

let clock = new THREE.Clock();

//controls
let manualMoveSlider = document.getElementById('manualMove');
let manualMoveOutput = document.getElementById('manualMoveOut');
let manualMoveValue = 0;
let waterLevel = document.getElementById('waterOut').value;
let dispScale = document.getElementById('heightsOut').value;
let selectedOption = document.getElementById('map').value;
let mapCheckbox = document.getElementById("lockCheckbox");
let isCheckboxChecked = false;
let mapVariant = true;
mapCheckbox.checked = isCheckboxChecked;
let fixedRaycaster, raycasterLine;
init();


function init() {

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, mapSize * 3);
    camera.position.set(0, 1000, 0);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    addObjects();
    addLights();

    controls = new PointerLockControls(camera, renderer.domElement, 0.001);
    controls.pointerSpeed = 0.5;

    eventListeners();
    render();
}

//controls

function eventListeners() {

    document.addEventListener('click', function () {
        if (document.getElementById('lockCheckbox').checked) {
            controls.lock();
        }
    });

    document.addEventListener('keydown', function () {
        if (event.key === 'e') {
            isCheckboxChecked = !isCheckboxChecked;
            mapCheckbox.checked = isCheckboxChecked;
            mapCheckbox.dispatchEvent(new Event('change'));
        }
    })

    document.getElementById('lockCheckbox').addEventListener('change', function () {
        if (this.checked) {
            controls.lock();
            autoRotation = false;
        } else {
            autoRotation = true;
            controls.unlock();
            camera.position.set(0, 1000, 0);
        }
    });

    document.getElementById('MapVariant').addEventListener('change', function () {
        if(this.checked){
            mapVariant = true;
        } else {
            mapVariant = false;
        }
        addObjects();
    })

    controls.addEventListener('lock', function () {
    });

    controls.addEventListener('unlock', function () {
    });

    scene.add(controls.getObject());

    document.addEventListener('keydown', function (event) {
        handleKeyDown(event);
    });
    document.addEventListener('keyup', function (event) {
        handleKeyUp(event);
    });

    document.getElementById('map').addEventListener('change', function () {
        if(mapVariant === true) {
            terrain.material.uniforms.bumpTexture.value = new THREE.TextureLoader()
                .setPath("maps/")
                .load(this.value);
            terrain.material.needsUpdate = true;
        }
        else {
            terrain.material.displacementMap = new THREE.TextureLoader()
                .setPath("maps/")
                .load(this.value);
            terrain.material.needsUpdate = true;
        }
    });

    dayNightCheckbox.addEventListener('change', function () {
        autoRotation = !dayNightCheckbox.checked;
    });

    manualMoveSlider.addEventListener('input', function () {
        manualMoveValue = parseFloat(manualMoveSlider.value);
        manualMoveOutput.innerHTML = manualMoveValue.toFixed(0);
    });

    document.getElementById('waterLevel').addEventListener('input', function () {
        waterLevel = this.value;
    });
    document.getElementById('defaultSpeed').addEventListener('click', function () {
        document.getElementById("speed").value = 10;
        document.getElementById("speedOut").value = 10;

    });
    document.getElementById('defaultDay').addEventListener('click', function () {
        document.getElementById("manualMove").value = 0;
        document.getElementById("manualMoveOut").value = 0;
        manualMoveValue = 0;
    });

    document.getElementById('scale').addEventListener('input', function () {
        dispScale = this.value*-1;
    });

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });

    document.getElementById('defaultWater').addEventListener('click', function () {
        if(mapVariant === false) {
            document.getElementById("waterOut").value = 100;
            document.getElementById("waterLevel").value = 100;
            waterLevel = 100;
        }
        else {
            document.getElementById("waterOut").value = 0;
            document.getElementById("waterLevel").value = 0;
            waterLevel = 0;
        }
    });
    document.getElementById('defaultScale').addEventListener('click', function () {
        if(mapVariant === false) {
            document.getElementById("heightsOut").value = 250;
            document.getElementById("scale").value = 250;
            dispScale = -250;
        }
        else {
            document.getElementById("heightsOut").value = 750;
            document.getElementById("scale").value = 750;
            dispScale = -750;
        }
    });
}

function addObjects() {
    scene.remove(terrain);
    scene.remove(water1);
    scene.remove(water2);

    if(mapVariant === false) {
        document.getElementById("waterOut").value = 100;
        document.getElementById("waterLevel").value = 100;
        waterLevel = 100;
        document.getElementById("heightsOut").value = 250;
        document.getElementById("scale").value = 250;
        dispScale = 250;
    }
    else {
        document.getElementById("waterOut").value = 0;
        document.getElementById("waterLevel").value = 0;
        waterLevel = 0;
        document.getElementById("heightsOut").value = 750;
        document.getElementById("scale").value = 750;
        dispScale = 750;
    }

    let geometryPlane = new THREE.PlaneGeometry(mapSize, mapSize, 100, 100);

    document.getElementById('scale').value = dispScale;
    document.getElementById('waterLevel').value = waterLevel;
    dispScale =dispScale*-1;
    let dispMap = new THREE.TextureLoader()
        .setPath("maps/")
        .load(selectedOption);

    let oceanTexture = new THREE.TextureLoader().load( 'assets/sand.png' );
    oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping;

    let sandyTexture = new THREE.TextureLoader().load( 'assets/sand.png' );
    sandyTexture.wrapS = sandyTexture.wrapT = THREE.RepeatWrapping;

    let grassTexture = new THREE.TextureLoader().load( 'assets/grass_2.png' );
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;

    let rockyTexture = new THREE.TextureLoader().load( 'assets/stone_pixelated.png');
    rockyTexture.wrapS = rockyTexture.wrapT = THREE.RepeatWrapping;

    let snowyTexture = new THREE.TextureLoader().load( 'assets/snow.png' );
    snowyTexture.wrapS = snowyTexture.wrapT = THREE.RepeatWrapping;


    // use "this." to create global object

    let shadedGroundMaterial = new THREE.ShaderMaterial({
        uniforms: {
            bumpTexture: { type: "t", value: dispMap },
            bumpScale: { type: "f", value: dispScale },
            oceanTexture: { type: "t", value: oceanTexture },
            sandyTexture: { type: "t", value: sandyTexture },
            grassTexture: { type: "t", value: grassTexture },
            rockyTexture: { type: "t", value: rockyTexture },
            snowyTexture: { type: "t", value: snowyTexture },
            lightIntensity: {type: "f", value:0}
        },
        vertexShader: `
        uniform sampler2D bumpTexture;
        uniform float bumpScale;

        varying float vAmount;
        varying vec2 vUV;
        varying vec3 vNormal;

        void main() {
            vUV = uv;
            vec4 bumpData = texture2D(bumpTexture, uv);
            vAmount = bumpData.r;
            float logAmount = 1.5 * pow(vAmount, 4.0);
            vec3 newPosition = position + normal * bumpScale * logAmount;

            vNormal = normal; // Pass normal to fragment shader
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
        fragmentShader: `
        uniform sampler2D oceanTexture;
        uniform sampler2D sandyTexture;
        uniform sampler2D grassTexture;
        uniform sampler2D rockyTexture;
        uniform sampler2D snowyTexture;
        uniform float lightIntensity;

        varying vec2 vUV;
        varying float vAmount;
        varying vec3 vNormal;

        void main() {
            vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D(oceanTexture, vUV * 10.0);
            vec4 sandy = (smoothstep(0.24, 0.27, vAmount) - smoothstep(0.28, 0.4, vAmount)) * texture2D(sandyTexture, vUV * 10.0);
            vec4 grass = (smoothstep(0.28, 0.40, vAmount) - smoothstep(0.55, 0.70, vAmount)) * texture2D(grassTexture, vUV * 20.0);
            vec4 rocky = (smoothstep(0.40, 0.89, vAmount) - smoothstep(0.80, 1.5, vAmount)) * texture2D(rockyTexture, vUV * 20.0);
            vec4 snowy = (smoothstep(0.90, 1.0, vAmount)) * texture2D(snowyTexture, vUV * 10.0);

            // Simple Lambertian lighting model
            float lambertian = lightIntensity;

            vec3 finalColor = vec3(0.0, 0.0, 0.0);
            finalColor += water.rgb * lambertian;
            finalColor += sandy.rgb * lambertian;
            finalColor += grass.rgb * lambertian;
            finalColor += rocky.rgb * lambertian;
            finalColor += snowy.rgb * lambertian;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
        side: THREE.DoubleSide,
    });



    dispMap.repeat.set(mapSize, mapSize);
    dispMap.wrapS = THREE.RepeatWrapping;
    dispMap.wrapT = THREE.RepeatWrapping;

    dispMap.repeat.set(1, 1);
    //materialPlane.map = texture;


    groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x52643a,
        wireframe: false,
        displacementMap: dispMap,
        displacementScale: dispScale*-1,
        reflectivity: 0,
        shininess: 0,
        bumpMap: dispMap,
        bumpScale: 10,
        side: THREE.DoubleSide,
    });

    if(mapVariant === false) {
        terrain = new THREE.Mesh(geometryPlane, groundMaterial);
    } else {
        terrain = new THREE.Mesh(geometryPlane, shadedGroundMaterial);
    }
    terrain.name = "plocha";
    terrain.position.set(0, 0, 0);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrain.rotation.x = Math.PI / 2;
    console.log(terrain);
    scene.add(terrain);

    //water -----
    let water = new THREE.BoxGeometry(mapSize, mapSize, 10, 1, 1);
    let materialPlane = new THREE.MeshPhongMaterial({
        color: 0x2f90c4,
        side: THREE.DoubleSide,
        wireframe: false,
        clipIntersection: true,
        reflectivity: 0,
        opacity: 0.6,
        transparent: true,
        shininess: 50
    });

    water1 = new THREE.Mesh(water, materialPlane);
    water1.position.set(0, waterLevel, 0);
    water1.rotation.x = Math.PI / 2
    water1.receiveShadow = true;
    console.log(water1);
    scene.add(water1);

    water2 = new THREE.Mesh(water, materialPlane);
    water2.position.set(0, waterLevel - 20, 0);
    water2.rotation.x = Math.PI / 2;
    water2.receiveShadow = true;
    scene.add(water2);

}

function render() {

    requestAnimationFrame(render);

    renderer.render(scene, camera);

    update();
}

//lighting
function addLights() {

    let sphereGeometry = new THREE.SphereGeometry(400, 100, 100);
    let sphereMaterial = new THREE.MeshPhongMaterial({color: 0xf7c93d, side: THREE.DoubleSide, emissive: 0xf7c93d});
    sun = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sun.receiveShadow = false;
    sun.position.set(1500, 500, 0);

    scene.add(sun);

    sunlight = new THREE.DirectionalLight(0xFFFFFF, 10);
    sunlight.castShadow = true;

    sunlight.shadow.camera.left = -2000;
    sunlight.shadow.camera.right = 2000;
    sunlight.shadow.camera.top = 2000;
    sunlight.shadow.camera.bottom = -2000;
    sunlight.shadow.mapSize.width = 5000;
    sunlight.shadow.mapSize.height = 5000;
    sunlight.shadow.camera.near = 1;
    sunlight.shadow.camera.far = mapSize * 10;
    sunlight.shadow.bias = -0.001;
    sunlight.shadow.radius = 30;
    sunlight.shadow.blurSamples = 2500;

    scene.add(sunlight);
    // ----------------------

    sphereGeometry = new THREE.SphereGeometry(400, 100, 100);
    //sphereMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, side: THREE.DoubleSide, emissive: 0xdabd8b});
    let textureLoader = new THREE.TextureLoader();
    let moon_texture = textureLoader.load('assets/moon_pixelated.png');
    let moon_material = new THREE.MeshBasicMaterial( {
        map: moon_texture,
        side: THREE.DoubleSide
    });
    moon = new THREE.Mesh(sphereGeometry, moon_material);

    moon.receiveShadow = false;
    moon.position.set(1500, 500, 0);

    scene.add(moon);

    moonlight = new THREE.DirectionalLight(0x74accf, 3);
    moonlight.castShadow = true;

    moonlight.shadow.camera.left = -2000;
    moonlight.shadow.camera.right = 2000;
    moonlight.shadow.camera.top = 2000;
    moonlight.shadow.camera.bottom = -2000;
    moonlight.shadow.mapSize.width = 5000;
    moonlight.shadow.mapSize.height = 5000;
    moonlight.shadow.camera.near = 1;
    moonlight.shadow.camera.far = mapSize * 10;
    moonlight.shadow.bias = -0.001;
    moonlight.shadow.radius = 30;
    moonlight.shadow.blurSamples = 2500;

    scene.add(moonlight);

    ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambientLight);


    sphereGeometry = new THREE.SphereGeometry(2 * mapSize, 100, 100);
    sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x096cb3,
        side: THREE.DoubleSide,
        reflectivity: 0,
        shininess: 0
    });
    sky = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sky.position.set(0, 0, 0);
    scene.add(sky);
    sunlight.target = terrain;
    moonlight.target = terrain;
}

function autoMoveSvetlo() {
    let horizonOffset = Math.PI / 12;
    let position = (manualMoveValue * Math.PI) / 180;
    if (dayNightCheckbox.checked) {
        position = clock.getElapsedTime() * rotationSpeed_day + horizonOffset;
    }

    sun.position.x = sunlight.position.x = Math.cos(position) * mapSize;
    sun.position.y = sunlight.position.y = Math.sin(position) * mapSize / 1.5;
    sun.position.z = sunlight.position.z = Math.sin(position) * mapSize;
    sun.rotation.y = 0.1 * clock.getElapsedTime();

    moon.position.x = moonlight.position.x = Math.cos(position + Math.PI) * mapSize;
    moon.position.y = moonlight.position.y = Math.sin(position + Math.PI) * mapSize / 1.5;
    moon.position.z = moonlight.position.z = Math.sin(position + Math.PI) * mapSize;
    moon.rotation.y = 0.1 * clock.getElapsedTime();

    const intensity1 = 0.8;
    const intensity2 = 3;

    // Use a sine function to smoothly alternate between the two intensities
    const intensityFactor = 0.5 * (1 + Math.sin(position));
    sunlight.intensity = intensity1 + intensityFactor * (intensity2 - intensity1);
    moonlight.intensity = sunlight.intensity;

    const color2 = new THREE.Color(0xffffff);
    const color1 = new THREE.Color(0x74accf);

    // Interpolate between the two colors based on intensityFactor
    const interpolatedColor = new THREE.Color().lerpColors(color1, color2, 1);
    sunlight.color = interpolatedColor;
    moonlight.color = interpolatedColor;

    // Set the color based on the calculated index
    sky.material.emissive = new THREE.Color(0x096cb3);
    sky.material.emissiveIntensity = 0.5 * Math.sin(position);

    if(mapVariant){
        terrain.material.uniforms.lightIntensity.value = ((sunlight.intensity)/(intensity2));
    }

    //console.log(terrain.material.uniforms.lightPosition);
}

//update
function updateWater() {
    water1.position.y = waterLevel;
    water2.position.y = waterLevel - 20;

}

function updateTerrain() {
    if(mapVariant === true) {
        terrain.material.uniforms.bumpScale.value = dispScale;
    } else {
        terrain.material.displacementScale = dispScale;
    }
}



function update() {

    const moveSpeed = document.getElementById('speedOut').value;
    const verticalSpeed = 3;
    autoMoveSvetlo();

    if (document.getElementById('lockCheckbox').checked) {
        if (moveState.forward) controls.moveForward(moveSpeed);
        if (moveState.backward) controls.moveForward(-moveSpeed);
        if (moveState.left) controls.moveRight(-moveSpeed);
        if (moveState.right) controls.moveRight(moveSpeed);
        if (moveState.up) controls.getObject().position.y += verticalSpeed;
        if (moveState.down) controls.getObject().position.y -= verticalSpeed;
    } else {
        autoMove();
    }
    updateTerrain();
    updateWater();
    boundaries();
}

//Movement controls
function boundaries() {
    const boundaryX = mapSize / 2;
    const boundaryZ = mapSize / 2;

    const currentPosition = controls.getObject().position;

    currentPosition.x = Math.max(-boundaryX, Math.min(boundaryX, currentPosition.x));
    currentPosition.z = Math.max(-boundaryZ, Math.min(boundaryZ, currentPosition.z));
}

function autoMove() {
    controls.getObject().position.x = Math.cos(clock.getElapsedTime() * rotationSpeed) * mapSize / 2;
    controls.getObject().position.z = Math.sin(clock.getElapsedTime() * rotationSpeed) * mapSize / 2;
    controls.getObject().lookAt(0, 0, 0);
}

const moveState = {
    forward: 0,
    backward: 0,
    right: 0,
    left: 0,
    up: 0,
    down: 0,
};

function handleKeyDown(event) {
    switch (event.key) {
        case 'w':
            moveState.forward = 1;
            break;
        case 'a':
            moveState.left = 1;
            break;
        case 's':
            moveState.backward = 1;
            break;
        case 'd':
            moveState.right = 1;
            break;
        case ' ':
            moveState.up = 1;
            break;
        case 'Shift':
            moveState.down = 1;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case 'w':
            moveState.forward = 0;
            break;
        case 'a':
            moveState.left = 0;
            break;
        case 's':
            moveState.backward = 0;
            break;
        case 'd':
            moveState.right = 0;
            break;
        case ' ':
            moveState.up = 0;
            break;
        case 'Shift':
            moveState.down = 0;
            break;
    }
}



