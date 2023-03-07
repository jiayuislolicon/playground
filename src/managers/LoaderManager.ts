import { Texture } from "ogl-typescript";
import type { OGLRenderingContext } from "ogl-typescript";

type TTexture = {
    name: string;
    texture: string;
};

class LoaderManager {
    assets: any;

    constructor() {
        this.assets = {};
    }

    load = (data: TTexture[], gl: OGLRenderingContext) =>
        new Promise<void>((resolve) => {
            const promises = [];
            for (let i = 0; i < data.length; i++) {
                const { name, texture } = data[i];

                if (texture && !this.assets[name]) {
                    promises.push(this.loadTexture(texture, name, gl));
                }
            }

            Promise.all(promises).then(() => resolve());
        });

    loadTexture(url: string, name: string, gl: OGLRenderingContext) {
        if (!this.assets[name]) {
            this.assets[name] = {};
        }
        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = "Anonymous";
            const texture = new Texture(gl);

            image.onload = () => {
                texture.image = image;
                this.assets[name] = texture;
                resolve(image);
            };

            image.src = url;
        });
    }
}

export default LoaderManager;
