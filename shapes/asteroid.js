import {defs, tiny} from '../examples/common.js';
import {shaders} from '../shaders.js'

const {
    Shape,
    Mat4, 
    Material,
    Texture,
    hex_color
} = tiny;

const {Subdivision_Sphere, Textured_Phong} = defs



export class Asteroid extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        Subdivision_Sphere.prototype.make_flat_shaded_version().insert_transformed_copy_into(this, [2])
        this.angle = Math.random() * 2 * Math.PI
        this.xPos = Math.floor(Math.random() * (61) - 30)
    }
}