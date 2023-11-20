import {defs, tiny} from '../examples/common.js';

const {
   Shape,
   Shader
} = tiny;

const {Capped_Cylinder} = defs



export class BlackHole extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");
        Capped_Cylinder.prototype.make_flat_shaded_version().insert_transformed_copy_into(this, [20, 20])
    }
}