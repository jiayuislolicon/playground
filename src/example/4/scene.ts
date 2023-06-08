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
	RGBAFormat,
	LinearMipMapLinearFilter,
	CubeCamera,
	SRGBColorSpace,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";
import innerVertex from "./glsl/inner.vert";
import innerFragment from "./glsl/inner.frag";

import { DotScreenShader } from "./CustomShader";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class BallScene {
	renderer!: WebGLRenderer;
	outerball!: Mesh;
	smallball!: Mesh;
	guiObj = { offset: 1 };
	el!: HTMLElement;
	scene!: Scene;
	camera!: PerspectiveCamera;
	cubeCamera!: CubeCamera;
	cubeRenderTarget!: WebGLCubeRenderTarget;
	composer!: EffectComposer;
	controls!: OrbitControls;

	constructor() {
		// this.setGUI();
		this.setScene();
		this.initPost();
		this.events();
		this.handleResize();
	}

	setGUI() {
		const gui = new GUI();
		// gui.add(this.guiObj, "offset", 0, 1).onChange(this.guiChange);
	}

	initPost() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.camera));

		const effect1 = new ShaderPass(DotScreenShader);
		effect1.uniforms["scale"].value = 4;
		this.composer.addPass(effect1);
	}

	setScene() {
		this.el = document.querySelector(".scene") as HTMLDivElement;
		this.renderer = new WebGLRenderer({ antialias: true });
		this.el.appendChild(this.renderer.domElement);

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 1.5;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const geometry = new SphereGeometry(2, 32, 32);
		const material = new ShaderMaterial({
			vertexShader: vertex,
			fragmentShader: fragment,
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new Vector2() },
				uDisplace: { value: 2 },
				uSpread: { value: 1.2 },
				uNoise: { value: 16 },
			},
		});

		this.outerball = new Mesh(geometry, material);
		this.scene.add(this.outerball);

		this.cubeRenderTarget = new WebGLCubeRenderTarget(256, {
			format: RGBAFormat,
			generateMipmaps: true,
			minFilter: LinearMipMapLinearFilter,
			// @ts-ignore
			encoding: SRGBColorSpace,
		});

		this.cubeCamera = new CubeCamera(0.1, 10, this.cubeRenderTarget);

		const geometry2 = new SphereGeometry(0.4, 32, 32);
		const material2 = new ShaderMaterial({
			vertexShader: innerVertex,
			fragmentShader: innerFragment,
			side: DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uResolution: { value: new Vector2() },
				uDisplace: { value: 2 },
				uSpread: { value: 1.2 },
				uNoise: { value: 16 },
				tCube: { value: null },
			},
		});

		this.smallball = new Mesh(geometry2, material2);
		this.scene.add(this.smallball);
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
		// @ts-ignore
		this.outerball.material.uniforms.uTime.value = t / 3000;

		this.smallball.visible = false;
		this.cubeCamera.update(this.renderer, this.scene);
		// @ts-ignore
		this.smallball.material.uniforms.tCube.value = this.cubeRenderTarget.texture;
		this.smallball.visible = true;

		this.renderer.render(this.scene, this.camera);
		this.composer.render();
		this.controls.update();
	};
}

export default BallScene;
