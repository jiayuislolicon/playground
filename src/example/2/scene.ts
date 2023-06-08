import GUI from "lil-gui";
import {
	Mesh,
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	IcosahedronGeometry,
	MeshStandardMaterial,
	DirectionalLight,
	AmbientLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import vertexPars from "./glsl/vertexPars.vert";
import vertexMain from "./glsl/vertexMain.vert";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class BallScene {
	renderer!: WebGLRenderer;
	mesh!: Mesh;
	guiObj = { offset: 1 };
	el!: HTMLElement;
	scene!: Scene;
	camera!: PerspectiveCamera;
	controls!: OrbitControls;

	constructor() {
		// this.setGUI();
		this.setScene();
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
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// 當邊緣產生像素感時，可能是面數不夠了...(效能再哭)
		const geometry = new IcosahedronGeometry(1, 100);
		const material = new MeshStandardMaterial({
			// @ts-ignore
			onBeforeCompile: (shader: any) => {
				material.userData.shader = shader;
				shader.uniforms.uTime = { value: 0 };

				// 試著把 MeshStanderMaterial 裡面寫好的 shader 替換成我們要的
				// 主要是為了加入燈光跟bump貼圖，當然用ShaderMaterial重新複製貼上的方法也是可行
				// 完整不吃燈光的檔案可以參照 main.vert 跟 main.frag

				const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;
				shader.vertexShader = shader.vertexShader.replace(parsVertexString, vertexPars);

				const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
				shader.vertexShader = shader.vertexShader.replace(mainVertexString, vertexMain);

				// 想要幫模型加深陰暗面可以加，當下喜歡沒有加的感覺==
				// const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
				// shader.fragmentShader = shader.fragmentShader.replace(
				// 	parsFragmentString,
				// 	fragmentPars
				// );

				// const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
				// shader.fragmentShader = shader.fragmentShader.replace(
				// 	mainFragmentString,
				// 	fragmentMain
				// );
			},
		});

		this.mesh = new Mesh(geometry, material);
		this.scene.add(this.mesh);

		const dirLight = new DirectionalLight("#ffffff", 0.6);
		dirLight.position.set(2, 2, 2);

		const ambientLight = new AmbientLight("#ffffff", 0.1);
		this.scene.add(dirLight, ambientLight);
	}

	events() {
		window.addEventListener("resize", this.handleResize, false);
		requestAnimationFrame(this.handleRAF);
	}

	handleResize = () => {
		this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);
	};

	handleRAF = (t: number) => {
		requestAnimationFrame(this.handleRAF);

		// @ts-ignore
		if ("shader" in this.mesh.material.userData)
			// @ts-ignore
			this.mesh.material.userData.shader.uniforms.uTime.value = t / 10000;

		this.renderer.render(this.scene, this.camera);
		this.controls.update();
	};
}

export default BallScene;
