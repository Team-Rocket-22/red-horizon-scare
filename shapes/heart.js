import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Subdivision_Sphere, Cube, Axis_Arrows, Textured_Phong, Windmill, Phong_Shader, Square, Triangle} = defs



export class Heart extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        this.arrays.position = [];
        this.arrays.normal = [];
        this.arrays.texture_coord = [];

        const num_points = 40;

        for (let i = 0; i < num_points; i++) {
            const t = (i / (num_points - 1)) * 2 * Math.PI;

            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const z = 0.5 * t * Math.sin(t);

            this.arrays.position.push(vec3(x, y, z));

            const normal = vec3(
                48 * Math.pow(Math.sin(t), 2) * Math.cos(t),
                48 * Math.pow(Math.sin(t), 2) * Math.sin(t),
                Math.sin(t)
            ).normalized();
            this.arrays.normal.push(normal);
        }

        this.indexed = true;
    }
}