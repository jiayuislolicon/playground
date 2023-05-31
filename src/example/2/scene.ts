import GUI from "lil-gui";
import {
	Mesh,
	PlaneGeometry,
	ShaderMaterial,
	Renderer,
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	IcosahedronGeometry,
	MeshStandardMaterial,
	DirectionalLight,
	AmbientLight,
	Vector2,
} from "three";

// import { SavePass } from "three/examples/jsm/postprocessing/SavePass";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// import { BlendShader } from "three/examples/jsm/postprocessing/BlendShader";
// import { CopyShader } from "three/examples/jsm/postprocessing/CopyShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import vertexPars from "./glsl/vertexPars.vert";
import vertexMain from "./glsl/vertexMain.vert";
import fragmentPars from "./glsl/fragmentPars.frag";
import fragmentMain from "./glsl/fragmentMain.frag";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class BallScene {
	renderer!: Renderer;
	mesh!: Mesh;
	guiObj = { offset: 1 };
	el!: HTMLElement;
	composer!: EffectComposer;
	scene!: Scene;
	camera!: PerspectiveCamera;

	constructor() {
		this.setGUI();
		this.setScene();
		// this.handlePass();
		this.events();
		this.handleResize();
	}

	setGUI() {
		const gui = new GUI();
		// gui.add(this.guiObj, "offset", 0, 1).onChange(this.guiChange);
	}

	setScene() {
		this.el = document.querySelector(".scene") as HTMLDivElement;
		this.renderer = new WebGLRenderer({ antialias: true });
		this.el.appendChild(this.renderer.domElement);

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 3;

		const geometry = new IcosahedronGeometry(1, 300);
		const material = new MeshStandardMaterial({
			// @ts-ignore
			onBeforeCompile: (shader: any) => {
				material.userData.shader = shader;
				shader.uniforms.uTime = { value: 0 };

				const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;
				shader.vertexShader = shader.vertexShader.replace(parsVertexString, vertexPars);

				const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
				shader.vertexShader = shader.vertexShader.replace(mainVertexString, vertexMain);

				const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
				shader.fragmentShader = shader.fragmentShader.replace(
					parsFragmentString,
					fragmentPars
				);

				const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
				shader.fragmentShader = shader.fragmentShader.replace(
					mainFragmentString,
					fragmentMain
				);
			},
		});

		this.mesh = new Mesh(geometry, material);
		this.scene.add(this.mesh);

		const dirLight = new DirectionalLight("#526cff", 0.6);
		dirLight.position.set(2, 2, 2);

		const ambientLight = new AmbientLight("#4255ff", 0.5);
		this.scene.add(dirLight, ambientLight);
	}

	events() {
		window.addEventListener("resize", this.handleResize, false);
		requestAnimationFrame(this.handleRAF);
	}

	handleResize = () => {
		this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);
	};

	handlePass() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(
			new UnrealBloomPass(
				new Vector2(this.el.offsetWidth, this.el.offsetHeight),
				0.7,
				0.4,
				0.4
			)
		);
	}

	handleRAF = (t: number) => {
		requestAnimationFrame(this.handleRAF);

		if ("shader" in this.mesh.material.userData)
			this.mesh.material.userData.shader.uniforms.uTime.value = t / 10000;

		this.renderer.render(this.scene, this.camera);
		if (this.composer) this.composer.render();
	};
}

export default BallScene;
