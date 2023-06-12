import GUI from "lil-gui";
import {
	Mesh,
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Vector2,
	WebGLCubeRenderTarget,
	CubeCamera,
	PlaneGeometry,
	Group,
	IcosahedronGeometry,
	BufferAttribute,
	Material,
	AmbientLight,
	SpotLight,
	PCFSoftShadowMap,
	MeshStandardMaterial,
	Color,
	Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";
import { CurtainShader } from "./effect1";

import { CustomMaterial, extendMaterial } from "./extend";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class BallScene {
	oscilator = 0;
	guiObj = {};
	renderer!: WebGLRenderer;
	outerball!: Mesh;
	smallball!: Mesh;
	el!: HTMLElement;
	scene!: Scene;
	camera!: PerspectiveCamera;
	cubeCamera!: CubeCamera;
	cubeRenderTarget!: WebGLCubeRenderTarget;
	composer!: EffectComposer;
	controls!: OrbitControls;
	event: any;
	mouse: Vector2;
	mouseTarget: Vector2;
	groups!: Group[];
	material!: Material;

	constructor() {
		this.mouse = new Vector2(0, 0);
		this.mouseTarget = new Vector2(0, 0);
		this.groups = [];
		this.guiObj = { progress: 0 };

		this.setScene();
		this.addLights();
		this.initPost();
		this.events();
		this.handleResize();
		this.setGUI();
	}

	setGUI() {
		const gui = new GUI();
		gui.add(this.guiObj, "progress", 0, 1, 0.01).onChange((value: number) => {
			//@ts-ignore
			this.material.uniforms.progress.value = value;
		});
	}

	initPost() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));
		const effectPass1 = new ShaderPass(CurtainShader);
		this.composer.addPass(effectPass1);
	}

	setScene() {
		this.el = document.querySelector(".scene") as HTMLDivElement;
		this.renderer = new WebGLRenderer({ antialias: true });
		this.el.appendChild(this.renderer.domElement);

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 10;
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const floorGeo = new PlaneGeometry(15, 15, 100, 100);
		const floorMat = new MeshStandardMaterial({ color: 0xcccccc });
		const floor = new Mesh(floorGeo, floorMat);

		floor.rotation.x = -Math.PI * 0.5;
		floor.position.y = -1.1;
		floor.castShadow = false;
		floor.receiveShadow = true;

		this.scene.add(floor);

		const geometry = new IcosahedronGeometry(1, 9).toNonIndexed();
		const length = geometry.attributes.position.count;

		let randoms = new Float32Array(length);
		let centers = new Float32Array(length * 3);
		for (let i = 0; i < length; i += 3) {
			let r = Math.random();
			randoms[i] = r;
			randoms[i + 1] = r;
			randoms[i + 2] = r;

			let x = geometry.attributes.position.array[i * 3];
			let y = geometry.attributes.position.array[i * 3 + 1];
			let z = geometry.attributes.position.array[i * 3 + 2];

			let x1 = geometry.attributes.position.array[i * 3 + 3];
			let y1 = geometry.attributes.position.array[i * 3 + 4];
			let z1 = geometry.attributes.position.array[i * 3 + 5];

			let x2 = geometry.attributes.position.array[i * 3 + 6];
			let y2 = geometry.attributes.position.array[i * 3 + 7];
			let z2 = geometry.attributes.position.array[i * 3 + 8];

			let center = new Vector3(x, y, z)
				.add(new Vector3(x1, y1, z1))
				.add(new Vector3(x2, y2, z2))
				.divideScalar(3);

			centers.set([center.x, center.y, center.z], i * 3);
			centers.set([center.x, center.y, center.z], (i + 1) * 3);
			centers.set([center.x, center.y, center.z], (i + 2) * 3);
		}

		geometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));

		geometry.setAttribute("aCenter", new BufferAttribute(centers, 3));

		// @ts-ignore
		this.material = extendMaterial(MeshStandardMaterial, {
			class: CustomMaterial,
			vertexHeader: `
				attribute float aRandom;
				attribute float aCenter;
				attribute float centers;
				uniform float time;
				uniform float progress;
				mat4 rotationMatrix(vec3 axis, float angle) {
					axis = normalize(axis);
					float s = sin(angle);
					float c = cos(angle);
					float oc = 1.0 - c;

					return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
								oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
								oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
								0.0,                                0.0,                                0.0,                                1.0);
				}

				vec3 rotate(vec3 v, vec3 axis, float angle) {
					mat4 m = rotationMatrix(axis, angle);
					return (m * vec4(v, 1.0)).xyz;
				}
			`,
			vertex: {
				transformEnd: `
				float prog = clamp((position.y + 1.12)/2.,0.,1.);
				float locprog = clamp( (progress - 0.8*prog)/0.2, 0., 1.);

				transformed = transformed - aCenter;
				transformed +=4.*normal*aRandom*(locprog);

				transformed *=clamp((1.- locprog*9.),0.,1.);

				transformed += aCenter;

				// transformed+=normal*aRandom*(locprog);

				transformed = rotate(transformed, vec3(0.0, 1.0, 0.0), aRandom*(locprog)*3.14*1.);
		
				`,
			},
			uniforms: {
				time: {
					mixed: true,
					linked: true,
					value: 0,
				},
				progress: {
					mixed: true,
					linked: true,
					value: 0,
				},
			},
		});

		this.material.uniforms.diffuse.value = new Color(0xff0000);
		const mesh = new Mesh(geometry, this.material);

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		this.scene.add(mesh);
	}

	addLights() {
		const ambient = new AmbientLight(0x8d8d8d, 0.5);
		this.scene.add(ambient);

		const light = new SpotLight(0xffffff, 1, 0, Math.PI / 5, 0.3);
		light.position.set(0, 2, 2);
		light.target.position.set(0, 0, 0);

		light.castShadow = true;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 3;
		light.shadow.bias = 0.0001;

		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;

		this.scene.add(light);
	}

	events() {
		window.addEventListener("resize", this.handleResize, false);
		requestAnimationFrame(this.handleRAF);
	}

	handleResize = () => {
		this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);
		this.composer.setSize(this.el.offsetWidth, this.el.offsetHeight);
	};

	handleRAF = (t: number) => {
		requestAnimationFrame(this.handleRAF);
		this.renderer.render(this.scene, this.camera);
		this.composer.render();
		this.controls.update();
		// @ts-ignore
		this.material.uniforms.time.value = t / 1000;
	};
}

export default BallScene;
