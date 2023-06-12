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
	MeshBasicMaterial,
	Group,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { CurtainShader } from "./effect1";

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

	constructor() {
		this.mouse = new Vector2(0, 0);
		this.mouseTarget = new Vector2(0, 0);
		this.groups = [];
		this.guiObj = { progress: 0 };

		this.setScene();
		this.initPost();
		this.events();
		this.handleResize();
		this.setGUI();
	}

	setGUI() {
		const gui = new GUI();
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

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 10;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const geometry = new PlaneGeometry(10, 10, 1, 1);
		const material = new MeshBasicMaterial({ color: 0xffffff });
		const mesh = new Mesh(geometry, material);

		this.scene.add(mesh);
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
	};
}

export default BallScene;
