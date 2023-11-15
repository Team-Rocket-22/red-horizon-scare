import {defs, tiny} from './examples/common.js';
import {Asteroid} from './asteroid.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Space extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            asteroid: new Asteroid()
            // asteroid: new defs.Subdivision_Sphere(4)
        };

        // *** Materials
        this.materials = {
            asteroid: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#4b4e52")}),
        }

        this.background_colors = [hex_color("#000000"), hex_color("#000435"), hex_color("#36013f")]
        this.current_background = 0
        this.rocket_colors = [hex_color("#ffffff")]
        this.current_rocket = 0
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    change_background() {
        this.current_background = (this.current_background + 1) % 3
    }

    change_rocket() {
        this.current_rocket = (this.current_rocket + 1) % 1
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change background color", ["b"], this.change_background);
        this.key_triggered_button("Change rocket color", ["r"], this.change_rocket);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }

        context.context.clearColor(this.background_colors[this.current_background][0], this.background_colors[this.current_background][1], this.background_colors[this.current_background][2], 1)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10**3)];

        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(5, -5, 0)).times(Mat4.scale(1.5, 2, 1.5))
        this.shapes.asteroid.draw(context, program_state, model_transform, this.materials.asteroid)
    }
}