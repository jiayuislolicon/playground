import GUI from "lil-gui";
import { Renderer, Program, Color, Mesh, Triangle } from "ogl-typescript";
import LoaderManager from "src/managers/LoaderManager";

import vertex from "./glsl/main.vert";
import fragment from "./glsl/main.frag";
import { getCoverUV } from "../../utils/ogl";

// tutorial: https://www.youtube.com/watch?v=kJpyUp_pQqU&ab_channel=HowToCodeThat%3F

class Scene {
    renderer!: Renderer;
    mesh!: Mesh;
    program!: Program;
    guiObj = { offset: 1 };
    el!: HTMLElement;

    constructor() {
        this.setGUI();
        this.setScene();
        this.events();
    }

    setGUI() {
        const gui = new GUI();
        gui.add(this.guiObj, "offset", 0, 1).onChange(this.guiChange);
    }

    async setScene() {
        this.el = document.querySelector(".scene") as HTMLCanvasElement;
        const canvas = document.querySelector(".scene-canvas") as HTMLCanvasElement;
        this.renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2) });
        const { gl } = this.renderer;
        gl.clearColor(1, 1, 1, 1);

        this.handleResize();

        const loaderManager = new LoaderManager();

        await loaderManager.load(
            [
                {
                    name: "image1",
                    texture: "./1/image-1.jpg",
                },
                {
                    name: "image2",
                    texture: "./1/image-2.jpg",
                },
                {
                    name: "displacement",
                    texture: "./1/displacement-map.jpg",
                },
            ],
            gl
        );

        // ! 待修正，不知道為什麼texture的width height 抓不到，所以才先佔用image
        const uvCover1 = getCoverUV(gl, loaderManager.assets.image1.image);
        const uvCover2 = getCoverUV(gl, loaderManager.assets.image2.image);

        this.program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uOffset: { value: this.guiObj.offset },
                uTexture1: { value: loaderManager.assets.image1 },
                uRepeat1: { value: uvCover1.repeat },
                uOffset1: { value: uvCover1.offset },
                uTexture2: { value: loaderManager.assets.image2 },
                uRepeat2: { value: uvCover2.repeat },
                uOffset2: { value: uvCover2.offset },
                uDisplacementTexture: { value: loaderManager.assets.displacement },
            },
        });

        const geometry = new Triangle(gl);

        this.mesh = new Mesh(gl, { geometry, program: this.program });
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
        if (this.mesh) this.renderer.render({ scene: this.mesh });
    };

    guiChange = (value: number) => {
        this.program.uniforms.uOffset.value = value;
    };
}

export default Scene;
