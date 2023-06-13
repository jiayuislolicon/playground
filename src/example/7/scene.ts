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
	DoubleSide,
	Group,
	ShaderMaterial,
	Color,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import colors from "nice-color-palettes";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";
import { CurtainShader } from "./effect1";

let pallete = colors[Math.floor(Math.random() * colors.length)];
const palletes = pallete.map((color) => new Color(color));

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
	mesh!: Mesh;

	constructor() {
		this.mouse = new Vector2(0, 0);
		this.mouseTarget = new Vector2(0, 0);
		this.groups = [];
		this.guiObj = {
			freqX: 0.2,
			freqY: 0.4,
			noiseFloor: 0.3,
			noiseCeil: 1,
		};

		this.setScene();
		this.initPost();
		this.events();
		this.handleResize();
		this.setGUI();
	}

	setGUI() {
		const gui = new GUI();
		gui.add(this.guiObj, "freqX", 0, 3, 0.1).onChange((value: number) => {
			// @ts-ignore
			this.mesh.material.uniforms.uFreqX.value = value;
		});
		gui.add(this.guiObj, "freqY", 0, 3, 0.1).onChange((value: number) => {
			// @ts-ignore
			this.mesh.material.uniforms.uFreqY.value = value;
		});
		gui.add(this.guiObj, "noiseFloor", 0, 1).onChange((value: number) => {
			// @ts-ignore
			this.mesh.material.uniforms.uNoiseFloor.value = value;
		});
		gui.add(this.guiObj, "noiseCeil", 0, 1).onChange((value: number) => {
			// @ts-ignore
			this.mesh.material.uniforms.uNoiseCeil.value = value;
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
		this.renderer.setClearColor(0xcccccc);
		this.el.appendChild(this.renderer.domElement);

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			55,
			window.innerWidth / window.innerHeight,
			0.001,
			10000
		);
		this.camera.position.z = 1;
		// this.camera.rotation.x = (Math.PI / 180) * -20;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const geometry = new PlaneGeometry(1.5, 1.5, 300, 300);
		const material = new ShaderMaterial({
			vertexShader: vertex,
			fragmentShader: fragment,
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: palletes },
				uResolution: { value: new Vector2() },
				uFreqX: { value: 0.2 },
				uFreqY: { value: 0.4 },
				uNoiseFloor: { value: 0.3 },
				uNoiseCeil: { value: 1 },
			},
		});
		// const material = new MeshBasicMaterial({color:0xffffff})
		this.mesh = new Mesh(geometry, material);

		this.scene.add(this.mesh);
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
		this.mesh.material.uniforms.uTime.value = t / 50000;
	};
}

export default BallScene;
