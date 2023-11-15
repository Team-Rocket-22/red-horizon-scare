import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Subdivision_Sphere, Cube, Axis_Arrows, Textured_Phong, Windmill, Phong_Shader, Square, Triangle} = defs



export class Asteroid extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        
        Subdivision_Sphere.insert_transformed_copy_into(this, [5])
    }
}