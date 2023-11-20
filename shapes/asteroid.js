import {defs, tiny} from '../examples/common.js';

const {
    Shape,
} = tiny;

const {Subdivision_Sphere, Textured_Phong} = defs



export class Asteroid extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        Subdivision_Sphere.prototype.make_flat_shaded_version().insert_transformed_copy_into(this, [2])
    }
}