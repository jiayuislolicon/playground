import GUI from "lil-gui";
import {
	Mesh,
	ShaderMaterial,
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	Vector2,
	DoubleSide,
	SphereGeometry,
	WebGLCubeRenderTarget,
	CubeCamera,
	PlaneGeometry,
	TextureLoader,
	MeshBasicMaterial,
	Group,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// @ts-ignore
import createInputEvents from "simple-input-events";
import gsap from "gsap";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";
import { CurtainShader } from "./effect1";
import { RGBAShader } from "./effect2";

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
		this.guiObj = { progress1: 0, progress2: 0, runAnimation: this.runAnimation.bind(this) };

		this.setScene();
		this.initPost();
		this.events();
		this.handleResize();
		this.setGUI();
	}

	setGUI() {
		const gui = new GUI();
		gui.add(this.guiObj, "progress1", 0, 1).onChange((value: number) => {
			// @ts-ignore
			this.composer.passes[1].uniforms["uProgress"].value = value;
			// @ts-ignore
			this.composer.passes[2].uniforms["uProgress"].value = value;
		});
		gui.add(this.guiObj, "runAnimation");

		// gui.add(this.guiObj, "progress2", 0, 1).onChange((value: number) => {
		// 	// @ts-ignore
		// 	this.composer.passes[2].uniforms["uProgress"].value = value;
		// });
	}

	runAnimation() {
		let tl = gsap.timeline();

		tl.to(this.camera.position, {
			x: 2500,
			duration: 2,
			ease: "power4.inOut",
		});
		tl.to(
			this.camera.position,
			{
				z: 700,
				duration: 1.5,
				ease: "power4.inOut",
			},
			1
		);
		tl.to(
			this.camera.position,
			{
				z: 900,
				duration: 1.5,
				ease: "power4.inOut",
			},
			2
		);

		tl.to(
			// @ts-ignore
			this.composer.passes[1].uniforms.uProgress,
			{
				value: 1,
				duration: 1,
				ease: "power3, inOut",
			},
			0
		);

		tl.to(
			// @ts-ignore
			this.composer.passes[2].uniforms.uProgress,
			{
				value: 0,
				duration: 1,
				ease: "power3, inOut",
			},
			1
		);

		tl.to(
			// @ts-ignore
			this.composer.passes[2].uniforms.uProgress,
			{
				value: 1,
				duration: 1,
				ease: "power3, inOut",
			},
			0
		);
	}

	initPost() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));
		const effectPass1 = new ShaderPass(CurtainShader);
		this.composer.addPass(effectPass1);

		const effectPass2 = new ShaderPass(RGBAShader);
		this.composer.addPass(effectPass2);
	}

	setScene() {
		this.el = document.querySelector(".scene") as HTMLDivElement;
		this.renderer = new WebGLRenderer({ antialias: true });
		this.el.appendChild(this.renderer.domElement);

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 900;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.event = createInputEvents(this.renderer.domElement);

		const textures = Array.from({ length: 3 }).map((_, index) =>
			new TextureLoader().load(`/5/${index + 1}.jpg`)
		);

		const geometry = new PlaneGeometry(1920, 1080, 1, 1);

		textures.forEach((texture, j) => {
			let group = new Group();
			this.scene.add(group);

			for (let i = 0; i < 3; i++) {
				let material = new MeshBasicMaterial({ map: texture });

				if (i > 0) {
					material = new MeshBasicMaterial({
						map: texture,
						alphaMap: new TextureLoader().load(`/5/mask.jpg`),
						transparent: true,
					});
				}

				let mesh = new Mesh(geometry, material);
				mesh.position.z = (i + 1) * 100;

				group.add(mesh);
				group.position.x = j * 2500;
				this.groups.push(group);
			}
		});
	}

	events() {
		this.event.on("move", ({ uv }: { uv: number[] }) => {
			this.mouse.x = uv[0] - 0.5;
			this.mouse.y = uv[1] - 0.5;
		});

		window.addEventListener("resize", this.handleResize, false);
		requestAnimationFrame(this.handleRAF);
	}

	handleResize = () => {
		this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);
		this.composer.setSize(this.el.offsetWidth, this.el.offsetHeight);
	};

	handleRAF = (t: number) => {
		requestAnimationFrame(this.handleRAF);
		// @ts-ignore
		// this.outerball.material.uniforms.uTime.value = t / 3000;

		this.oscilator = Math.sin(t * 0.0001) * 0.5 + 0.5;

		this.mouseTarget.lerp(this.mouse, 0.05);
		this.groups.forEach((group) => {
			group.rotation.x = -this.mouseTarget.y * 0.2;
			group.rotation.y = -this.mouseTarget.x * 0.2;

			group.children.forEach((mesh, i) => {
				mesh.position.z = (i + 1) * 100 - this.oscilator * 200;
			});
		});

		this.renderer.render(this.scene, this.camera);
		this.composer.render();
		// this.controls.update();
	};
}

export default BallScene;
