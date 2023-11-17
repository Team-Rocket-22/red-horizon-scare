import {defs, tiny} from './examples/common.js';
import {Asteroid} from './asteroid.js';
import {Heart} from './shapes/heart.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Space extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            asteroid: new Asteroid(),
            // asteroid: new defs.Subdivision_Sphere(4)
            heart: new Heart(),
            satellite: new defs.Capped_Cylinder(20, 20),
            solar_panel1: new defs.Cube(),
            solar_panel2: new defs.Cube(),
            satellite_head: new defs.Cone_Tip(20, 20),
            satellite_tail: new defs.Subdivision_Sphere(8),
        };

        // *** Materials
        this.materials = {
            asteroid: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#4b4e52")}),
            heart: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#880808")}),
            satellite: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#F5F5DC")}),
            solar_panel1: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            solar_panel2: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            satellite_head: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#4b4e52")}),
            satellite_tail: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#FFFFFF")}),
        }

        this.background_colors = [hex_color("#000000"), hex_color("#000435"), hex_color("#36013f")]
        this.current_background = 0
        this.asteroid_positions = []
        for (let i = 0; i < 10; i++) {
            this.asteroid_positions.push(Math.floor(Math.random() * (31) - 15 ))
        }
        // TODO: what rocket colors do we want
        this.rocket_colors = [hex_color("#850e05"), hex_color("#050bb3"), hex_color("#4e4e54"), hex_color("#023b02")]
        this.current_rocket = 0
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.hp = 3
    }

    change_background() {
        this.current_background = (this.current_background + 1) % (this.background_colors.length)
    }

    change_rocket() {
        this.current_rocket = (this.current_rocket + 1) % (this.rocket_colors.length)
    }

    // TODO: call this function whenever rocket is hit or we collect a powerup
    modify_hp(amount) {
        this.hp += amount
    }

    // TODO: number of asteroids, asteroid speed? change based on level?
    asteroid_belt(t, context, program_state, model_transform) {
        let asteroids = []
        for (let i = 0; i < this.asteroid_positions.length; i++) {
            asteroids[i] = model_transform
            asteroids[i] = asteroids[i].times(Mat4.translation(this.asteroid_positions[i], 30 + (i * 5), 0)).times(Mat4.scale(1, 1.5, 1)).times(Mat4.translation(0, -(t % 10) * 7, 0))
            this.shapes.asteroid.draw(context, program_state, asteroids[i], this.materials.asteroid)
        }
    }

    // TODO: fill in heart shape and transform to 3D
    spawn_heart(t, context, program_state, model_transform) {
        let heart_transform = model_transform;
        heart_transform = heart_transform.times(Mat4.scale(1/14, 1/14, 1/14));
        this.shapes.heart.draw(context, program_state, heart_transform, this.materials.heart);
    }

    // TODO: add texture to satellite
    spawn_satellite(t, context, program_state, model_transform) {
        let satellite_transform = model_transform;
        satellite_transform = satellite_transform.times(Mat4.translation(0, 0, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(.5, .5, 2));
        this.shapes.satellite.draw(context, program_state, satellite_transform, this.materials.satellite);

        let solar1_transform = satellite_transform;
        let solar2_transform = satellite_transform;
        let head_transform = satellite_transform;
        let tail_transform = satellite_transform;
        solar1_transform = solar1_transform.times(Mat4.scale(1.5, 1, 1/32)).times(Mat4.translation(1.5, 0, 0));
        solar2_transform = solar2_transform.times(Mat4.scale(1.5, 1, 1/32)).times(Mat4.translation(-1.5, 0, 0));
        head_transform = head_transform.times(Mat4.scale(1.75, 1.75, 1/10)).times(Mat4.translation(0, 0, -5.5));
        tail_transform = tail_transform.times(Mat4.scale(1, 1, 1/4)).times(Mat4.translation(0, 0, 1.75));
        this.shapes.solar_panel1.draw(context, program_state, solar1_transform, this.materials.solar_panel1);
        this.shapes.solar_panel2.draw(context, program_state, solar2_transform, this.materials.solar_panel2);
        this.shapes.satellite_head.draw(context, program_state, head_transform, this.materials.satellite_head);
        this.shapes.satellite_tail.draw(context, program_state, tail_transform, this.materials.satellite_tail);
    }

    spawn_objects(t, context, program_state, model_transform) {
        // asteroid belt there and back
        if ((t >= 10 && t <= 20) || (t >= 110 && t <= 120)) {
            this.asteroid_belt(t, context, program_state, model_transform)
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change background color", ["b"], this.change_background);
        this.key_triggered_button("Change rocket color", ["c"], this.change_rocket);
    }

    display(context, program_state) {
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
        this.spawn_objects(t, context, program_state, model_transform);
    }
}