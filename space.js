import {defs, tiny} from './examples/common.js';
import {Asteroid} from './shapes/asteroid.js';
import { BlackHole } from './shapes/black_hole.js';
import {shaders} from './shaders.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;
const PLAYER_SPEED = 0.1;

export class Space extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.

        this.shapes = {
            asteroid: new Asteroid(),
            // asteroid: new defs.Cube(),
            black_hole: new BlackHole,
            heart_part: new defs.Cube(),
            face: new defs.Capped_Cylinder(20, 20),
            smile: new defs.Closed_Cone(20, 20),
            satellite: new defs.Capped_Cylinder(20, 20),
            solar_panel1: new defs.Cube(),
            solar_panel2: new defs.Cube(),
            satellite_head: new defs.Cone_Tip(20, 20),
            satellite_tail: new defs.Subdivision_Sphere(8),
            earth: new defs.Subdivision_Sphere(8),
            mars: new defs.Subdivision_Sphere(8),
            // speed_up:
            // shield: new defs
            rocket_body: new defs.Capped_Cylinder(20,20),
            rocket_head: new defs.Closed_Cone(20, 20),
            rocket_fin: new defs.Triangle(),
            rocket_hitbox: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            asteroid: new Material(new shaders.Bump_Mapped(), {
                color: hex_color("#000000"),
                ambient: 0.8, diffusivity: 0, specularity: 0.2, texture: new Texture("assets/asteroid.jpeg"), 
            }),
            heart: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#880808")}),
            face: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#000000")}),
            satellite: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#F5F5DC")}),
            solar_panel1: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            solar_panel2: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            satellite_head: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#4b4e52")}),
            satellite_tail: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#ffffff")}),
            black_hole: new Material(new shaders.Ring_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.3}),
            earth: new Material(new defs.Phong_Shader(),
                {ambient: 0.5, diffusivity: 0.8, specularity: 0.5, color: hex_color("#023ca7")}),
            mars: new Material(new defs.Phong_Shader(),
                {ambient: 0.5, diffusivity: 0.8, specularity: 0.5, color: hex_color("#a43f2f")}),
            // rocket material colors don't matter because they will be overridden in display()
            rocket_body: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0, color: hex_color("#000000")}),
            rocket_extras: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.7, specularity: 0.4, color: hex_color("#000000")}),
            rocket_hitbox: new Material(new defs.Invisible_Shader(),
                {ambient: 0.8, diffusivity: 0.7, specularity: 0.5, color: hex_color("#850e05")}),
        }

        this.background_colors = [hex_color("#000000"), hex_color("#000435"), hex_color("#36013f")]
        this.current_background = 0
        this.asteroid_positions = []
        for (let i = 0; i < 10; i++) {
            this.asteroid_positions.push(Math.floor(Math.random() * (31) - 15 ))
        }
        // TODO: what rocket colors do we want
        this.rocket_colors = [hex_color("#850e05"), hex_color("#61abff"), hex_color("#4e4e54"), hex_color("#023b02")]
        this.rocket_extras_colors = [hex_color("#2ebdff"), hex_color("#ea94d5"), hex_color("#ff1b1b"), hex_color("#7c61ff")]
        this.current_rocket = 2
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.hp = 3
        
        // user-controlled rocket movement for next frame in North, South, East, and West
        this.rocket_motion = {
            'N': false,
            'S': false,
            'E': false,
            'W': false,
        }
        this.rocket_transform = Mat4.identity();
    }

    change_background() {
        this.current_background = (this.current_background + 1) % (this.background_colors.length)
    }

    change_rocket_color() {
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

    spawn_heart(t, context, program_state, model_transform) {

        let heart_transform = model_transform;
        heart_transform = heart_transform.times(Mat4.scale(7 / 4, 2 / 4, 1 / 4));
        this.shapes.heart_part.draw(context, program_state, heart_transform, this.materials.heart);

        let eye1_transform = heart_transform.times(Mat4.scale(1/7, 1/ 2, 1));
        eye1_transform = eye1_transform.times(Mat4.scale(1, 2.5, 0.8)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.translation(-2, 1, 0.25));
        this.shapes.face.draw(context, program_state, eye1_transform, this.materials.face);

        let eye2_transform = eye1_transform.times(Mat4.translation(4, 0, 0));
        this.shapes.face.draw(context, program_state, eye2_transform, this.materials.face);

        let smile_transform = eye1_transform.times(Mat4.scale(2, 1, 1 / 6)).times(Mat4.translation(1, 0, 6));
        this.shapes.smile.draw(context, program_state, smile_transform, this.materials.face);

        let heart_transform2 = heart_transform.times(Mat4.scale(1/7, 1/2, 1));
        heart_transform2 = heart_transform2.times(Mat4.scale(2, 4, 1)).times(Mat4.translation(-1.5, 0, 0));
        this.shapes.heart_part.draw(context, program_state, heart_transform2, this.materials.heart);

        let heart_transform3 = heart_transform2;
        heart_transform3 = heart_transform3.times(Mat4.translation(3, 0, 0));
        this.shapes.heart_part.draw(context, program_state, heart_transform3, this.materials.heart);

        let heart_transform4 = heart_transform.times(Mat4.scale(1/7, 1/2, 1));
        heart_transform4 = heart_transform4.times(Mat4.scale(3, 2, 1)).times(Mat4.translation(0, -2, 0));
        this.shapes.heart_part.draw(context, program_state, heart_transform4, this.materials.heart);

        let heart_transform5 = heart_transform.times(Mat4.scale(1/7, 1/2, 1));
        heart_transform5 = heart_transform5.times(Mat4.translation(0, -7, 0));
        this.shapes.heart_part.draw(context, program_state, heart_transform5, this.materials.heart);
    }

    spawn_rocket(t, context, program_state, model_transform){
        // Just placeholder to make rocket object
        let rocket_body_transform = model_transform
        let rocket_head_transform = model_transform
        let rocket_fin_transform = model_transform
        let rocket_hitbox_transform = model_transform

        rocket_body_transform = rocket_body_transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
                                    .times(Mat4.scale(1, 1, 3))
        this.shapes.rocket_body.draw(context, program_state, rocket_body_transform, 
            this.materials.rocket_body.override({color:this.rocket_colors[this.current_rocket]}))

        rocket_head_transform = rocket_head_transform.times(Mat4.translation(0, 2, 0))
                                    .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
                                    .times(Mat4.scale(1.25, 1.25, 0.7))
        this.shapes.rocket_head.draw(context, program_state, rocket_head_transform,
            this.materials.rocket_extras.override({color:this.rocket_extras_colors[this.current_rocket]}))
        
        for(let i = 1; i < 8; i += 2){
            rocket_fin_transform = model_transform.times(Mat4.rotation(i * (Math.PI / 4), 0, 1, 0))
                                    .times(Mat4.translation(0.8, -2, 0))
                                    .times(Mat4.scale(0.8, 1.8, 1))
            this.shapes.rocket_fin.draw(context, program_state, rocket_fin_transform,
                this.materials.rocket_extras.override({color:this.rocket_extras_colors[this.current_rocket]}))
        }

        rocket_hitbox_transform = rocket_hitbox_transform.times(Mat4.scale(1.15, 2.25, 1.15)).times(Mat4.translation(0, 0.15, 0))
        this.shapes.rocket_hitbox.draw(context, program_state, rocket_hitbox_transform,
             this.materials.rocket_hitbox)

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

    leave_earth(t, context, program_state, model_transform) {
        if (t >= 0 && t <= 2) {
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 2 && t <= 10) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 2), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    arrive_earth(t, context, program_state, model_transform) {
        if (t > 35 && t <= 42) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 35), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 42) {
            model_transform = model_transform.times(Mat4.translation(0, 1.4, 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    spawn_mars(t, context, program_state, model_transform) {
        if (t >= 20 && t <= 24) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 20), 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 24 && t <= 30) {
            model_transform = model_transform.times(Mat4.translation(0, -0.8, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 30 && t <= 35) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 30), 0)).times(Mat4.translation(0, -0.8, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        return model_transform
    }

    leave_earth(t, context, program_state, model_transform) {
        if (t >= 0 && t <= 2) {
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 2 && t <= 10) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 2), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    arrive_earth(t, context, program_state, model_transform) {
        if (t > 35 && t <= 42) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 35), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 42) {
            model_transform = model_transform.times(Mat4.translation(0, 1.4, 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    spawn_mars(t, context, program_state, model_transform) {
        if (t >= 20 && t <= 24) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 20), 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 24 && t <= 30) {
            model_transform = model_transform.times(Mat4.translation(0, -0.8, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 30 && t <= 35) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 30), 0)).times(Mat4.translation(0, -0.8, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        return model_transform
    }

    // TODO: add logic for when other objects spawn
    spawn_objects(t, context, program_state, model_transform) {
        // asteroid belt there and back
        if ((t >= 10 && t <= 20) || (t >= 110 && t <= 120)) {
            this.asteroid_belt(t, context, program_state, model_transform)
        }
    }

    move_rocket(){
        // takes sum of all movements affecting rocket and moves accordingly
        let vertical = 0
        let horizontal = 0

        if(this.rocket_motion['N']){
            vertical += PLAYER_SPEED
        }
        if(this.rocket_motion['S']){
            vertical -= PLAYER_SPEED
        }
        if(this.rocket_motion['E']){
            horizontal += PLAYER_SPEED
        }
        if(this.rocket_motion['W']){
            horizontal -= PLAYER_SPEED
        }
        // ADD CHECKS FOR BLACK HOLE LATER

        this.rocket_transform = this.rocket_transform.times(Mat4.translation(horizontal, vertical, 0))
    }

    shake_camera(t, program_state) {
        if (t * 1000 % 2 > 1) {
            program_state.set_camera(this.initial_camera_location.times(Mat4.rotation(Math.PI / 32, 0, 0, 1)));
        }
        else {
            program_state.set_camera(this.initial_camera_location.times(Mat4.rotation(-Math.PI / 32, 0, 0, 1)));
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change background color", ["b"], this.change_background);
        this.key_triggered_button("Change rocket color", ["c"], this.change_rocket_color);
        this.key_triggered_button("Move rocket up", ["i"], 
                                    function() { this.rocket_motion['N'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['N'] = false});
        this.key_triggered_button("Move rocket down", ["k"], 
                                    function() { this.rocket_motion['S'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['S'] = false});
        this.key_triggered_button("Move rocket left", ["j"], 
                                    function() { this.rocket_motion['W'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['W'] = false});
        this.key_triggered_button("Move rocket right", ["l"],
                                    function() { this.rocket_motion['E'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['E'] = false});
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

        const light_position = vec4(5, -2, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10**10)];

        let model_transform = Mat4.identity()
        this.spawn_objects(t, context, program_state, model_transform)
        this.spawn_rocket(t, context, program_state, this.rocket_transform)

        this.move_rocket()
        
        if (t >= 15 && t <= 16) {
            this.shake_camera(t, program_state)
        }
        else {
            program_state.set_camera(this.initial_camera_location);
        }

        // TODO: how often do we want black holes to show up
        let black_hole_transform = model_transform
        black_hole_transform = black_hole_transform.times(Mat4.translation(0, 0, 0)).times(Mat4.rotation(Math.PI * 0.25, 1, 0, 0)).times(Mat4.scale(3, 3, 0.01))
        // this.shapes.black_hole.draw(context, program_state, black_hole_transform, this.materials.black_hole)

        let model_transform_e_leave = Mat4.identity().times(Mat4.translation(0, -30, -15)).times(Mat4.scale(20, 20, 20));
        model_transform_e_leave = this.leave_earth(t, context, program_state, model_transform_e_leave);

        let model_transform_m= Mat4.identity().times(Mat4.translation(0, 30, -30)).times(Mat4.scale(20, 20, 20));
        model_transform_m = this.spawn_mars(t, context, program_state, model_transform_m);

        let model_transform_e_arrive = Mat4.identity().times(Mat4.translation(0, -65, -15)).times(Mat4.scale(20, 20, 20));
        model_transform_e_arrive = this.arrive_earth(t, context, program_state, model_transform_e_arrive);
    }
}