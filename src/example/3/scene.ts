import GUI from "lil-gui";
import {
	Mesh,
	ShaderMaterial,
	Renderer,
	WebGLRenderer,
	PerspectiveCamera,
	Scene,
	DirectionalLight,
	AmbientLight,
	Vector2,
	DoubleSide,
	TorusGeometry,
} from "three";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class BallScene {
	renderer!: Renderer;
	mesh!: Mesh;
	guiObj = { offset: 1 };
	el!: HTMLElement;
	scene!: Scene;
	camera!: PerspectiveCamera;

	constructor() {
		this.setGUI();
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

		const geometry = new TorusGeometry(1, 0.3, 100, 100);
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

	handleRAF = (t: number) => {
		requestAnimationFrame(this.handleRAF);
		// @ts-ignore
		this.mesh.material.uniforms.uTime.value = t / 1000;

		this.renderer.render(this.scene, this.camera);
	};
}

export default BallScene;
