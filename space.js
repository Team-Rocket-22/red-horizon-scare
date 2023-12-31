import {defs, tiny} from './examples/common.js'
import {Asteroid} from './shapes/asteroid.js'
import { BlackHole } from './shapes/black_hole.js'
import {shaders} from './shaders.js'
import { Text_Demo, Text_Line } from './examples/text-demo.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Textured_Phong} = defs
const PLAYER_SPEED = 0.12;
const INVINCIBILITY_TIME = 3000;
const HURT_TIME = 500;
const SHIELD_DESTROY_TIME = 1000;
const BLACK_HOLE_ATTRACT = 0.05
const CAMERA = {
    INIT_Z: 10,
    END_Z: 50,
}

export class Space extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.

        this.shapes = {
            black_hole: new BlackHole,
            heart_part: new defs.Cube(),
            shield: new defs.Subdivision_Sphere(8),
            speed_up: new defs.Cube(),
            face: new defs.Capped_Cylinder(20, 20),
            smile: new defs.Closed_Cone(20, 20),
            satellite: new defs.Capped_Cylinder(20, 20),
            solar_panel1: new defs.Cube(),
            solar_panel2: new defs.Cube(),
            satellite_head: new defs.Cone_Tip(20, 20),
            satellite_tail: new defs.Subdivision_Sphere(8),
            earth: new defs.Subdivision_Sphere(8),
            mars: new defs.Subdivision_Sphere(8),
            rocket_body: new defs.Capped_Cylinder(20,20),
            rocket_head: new defs.Closed_Cone(20, 20),
            rocket_fin: new defs.Triangle(),
            rocket_hitbox: new defs.Cube(),
            rocket_bubble: new defs.Torus(15, 15),

            text_test: new Text_Line(20),
            alien_ship_body: new defs.Subdivision_Sphere(4),
            alien_ship_head: new defs.Subdivision_Sphere(4),
            alien_ship_guns: new defs.Capped_Cylinder(20,20),
            laser: new defs.Capped_Cylinder(20,20),
        };

        // *** Materials
        this.materials = {
            asteroid: new Material(new shaders.Bump_Mapped(), {
                color: hex_color("#000000"),
                ambient: 0.8, diffusivity: 0, specularity: 0.2, texture: new Texture("assets/asteroid.jpeg"), 
            }),
            heart: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#880808")}),
            shield: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.8, specularity: 0.8, color: hex_color("#08b8e8")}),
            bubble: new Material(new defs.Bubble_Shader(),
                {ambient: 0.4, diffusivity: 0.8, specularity: 0.8, color: hex_color("#08b8e8")}),
            speed_up: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.8, specularity: 0.2, color: hex_color("#ffb81c")}),
            face: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#000000")}),
            satellite: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#f5f5dc")}),
            solar_panel1: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            solar_panel2: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#0047ab")}),
            satellite_head: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#4b4e52")}),
            satellite_tail: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.2, color: hex_color("#ffffff")}),
            black_hole: new Material(new shaders.Ring_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0.3, radius: 5.0}),
            earth: new Material(new Textured_Phong(), {
                    color: hex_color("#000000"),
                    ambient: 1,
                    texture: new Texture("/assets/earth.jpg", "LINEAR_MIPMAP_LINEAR")
                }),
            mars: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("/assets/mars.jpeg", "LINEAR_MIPMAP_LINEAR")
            }),
            // rocket material colors don't matter because they will be overridden in display()
            rocket_body: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0, color: hex_color("#000000")}),
            rocket_extras: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.7, specularity: 0.4, color: hex_color("#000000")}),
            rocket_hitbox: new Material(new defs.Invisible_Shader(),
                {ambient: 0.8, diffusivity: 0.7, specularity: 0.5, color: hex_color("#850e05")}),

            text_test: new Material(new defs.Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")}),

            alien_ship_body: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0, color: hex_color("#4895EF")}),
            alien_ship_head: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0, color: hex_color("#A8CCD7")}),
            alien_ship_guns: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 0.5, specularity: 0, color: hex_color("#F17961")}),

            laser: new Material(new defs.Phong_Shader(), {
                ambient: 0.8, diffusivity: 0.5, specularity: 1, color: hex_color("#FF0000")}),

        }

        this.background_images = ["/assets/stars.jpeg", "/assets/space_1.avif", "/assets/galaxy.webp", "/assets/purple_space.avif"]
        this.current_background = 0
        this.alien_positions = []
        this.alien_collisions = {}
        this.laser_collisions = {}
        for (let i = 0; i < 7; i++) {
            this.alien_positions.push(Math.floor(Math.random() * (60) - 30 ))
        }
        this.satellite_positions_left = []
        this.satellite_collisions_left = {}
        for (let i = 0; i < 12; i++) {
            this.satellite_positions_left.push(Math.floor(Math.random() * (80) - 80 ))
        }
        this.satellite_positions_right = []
        this.satellite_collisions_right = {}
        for (let i = 0; i < 12; i++) {
            this.satellite_positions_right.push(Math.floor(Math.random() * (80) - 0 ))
        }
        // TODO: what rocket colors do we want
        this.rocket_colors = [hex_color("#850e05"), hex_color("#61abff"), hex_color("#4e4e54"), hex_color("#023b02"), hex_color("#FF0000")]
        this.rocket_extras_colors = [hex_color("#2ebdff"), hex_color("#ea94d5"), hex_color("#ff1b1b"), hex_color("#7c61ff"), hex_color("#FFD700")]
        this.current_rocket = 2
        // this.initial_camera_location = Mat4.look_at(vec3(0, 10, CAMERA.INIT_Z), vec3(0, 0, 0), vec3(0, 1, 0));
        this.stay_camera_location = Mat4.look_at(vec3(0, 10, CAMERA.INIT_Z), vec3(0, 0, 0), vec3(0, 1, 0));

        this.speed_up_state = true
        this.shield_state = true

        this.hp = 3

        this.asteroids = []
        this.asteroid_positions = {}
        for (let i = 0; i < 15; i++) {
            let ast = new Asteroid()
            this.asteroids.push(ast)
        }

        this.black_hole_positions = []
        this.black_hole_positions.push(Mat4.translation(Math.floor(Math.random() * (25) + 6), Math.floor(Math.random() * (33) - 18), 0))
        this.black_hole_positions.push(Mat4.translation(Math.floor(Math.random() * (25) -30), Math.floor(Math.random() * (33) - 18), 0))
        
        // user-controlled rocket movement for next frame in North, South, East, and West
        this.rocket_motion = {
            'N': false,
            'S': false,
            'E': false,
            'W': false,
        }

        this.rocket_transform = Mat4.identity();
        // These power up values must be manipulated when collecting powerups
        this.shield = false
        this.boost = false
        this.flipped = false
        this.hurt = false

        // When colliding with an object, manipulate this to give the player small time of invincibility
        this.isInvincible = false
    }


    change_background() {
        this.current_background = (this.current_background + 1) % (this.background_images.length)
        // document.body.style.backgroundImage = `url(${this.background_images[this.current_background]})`;
        document.getElementById("main-canvas").style.backgroundImage = `url(${this.background_images[this.current_background]})`
    }

    change_rocket_color() {
        this.current_rocket = (this.current_rocket + 1) % (this.rocket_colors.length)
    }

    // TODO: call this function whenever rocket is hit or we collect a powerup
    modify_hp(amount) {
        this.hp += amount
    }

    set_hp(amount) {
        this.hp = amount
    }

    // TODO: number of asteroids, asteroid speed? change based on level?
    asteroid_belt(t, context, program_state, model_transform) {
        for (let i = 0; i < this.asteroids.length; i++) {
            let ast_transform = model_transform
            ast_transform = ast_transform.times(Mat4.rotation(this.asteroids[i].angle, 0, 1, 0)).times(Mat4.translation(this.asteroids[i].xPos, 150 + (i * 5), 0)).times(Mat4.scale(1, 1.5, 1)).times(Mat4.translation(0, (-(t%100) * 7), 0))
            this.asteroid_positions[i] = ast_transform;
            this.asteroids[i].draw(context, program_state, ast_transform, this.materials.asteroid)
        }
    }

    alien_attack(t, spawn, context, program_state, model_transform) {
        let aliens = []
        for (let i = 0; i < this.alien_positions.length; i++) {
            aliens[i] = model_transform
            aliens[i] = aliens[i].times(Mat4.translation(this.alien_positions[i], 30 + (i * 5), 0)).times(Mat4.scale(1, 1.5, 1)).times(Mat4.translation(0, -(t % 10) * 7, 0))
            this.spawn_alienship(t, spawn, context, program_state, aliens[i], i)
        }
    }

    satellite_hit_right(t, context, program_state, model_transform) {
        let satellites_right = []
        for (let i = 0; i < this.satellite_positions_right.length; i++) {
            satellites_right[i] = model_transform
            satellites_right[i] = satellites_right[i].times(Mat4.translation(this.satellite_positions_right[i], 30 + (i * 5), 0)).times(Mat4.scale(1, 1.5, 1)).times(Mat4.translation(0, -(t % 10) * 7, 0))
            this.spawn_satellite_right(t, context, program_state, satellites_right[i], i)
        }
    }

    satellite_hit_left(t, context, program_state, model_transform) {
        let satellites_left = []
        for (let i = 0; i < this.satellite_positions_left.length; i++) {
            satellites_left[i] = model_transform
            satellites_left[i] = satellites_left[i].times(Mat4.translation(this.satellite_positions_left[i], 30 + (i * 5), 0)).times(Mat4.scale(1, 1.5, 1)).times(Mat4.translation(0, -(t % 10) * 7, 0))
            this.satellite_collisions_left[i] = satellites_left[i]
            this.spawn_satellite_left(t, context, program_state, satellites_left[i], i)
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

    spawn_healthbar(t, context, program_state, model_transform){
        let healthbar_transform = model_transform;
        healthbar_transform = healthbar_transform.times(Mat4.translation(-32.5, 18, 0));
        for (let i = 0; i < this.hp; i++){
            this.spawn_heart(t, context, program_state, healthbar_transform);
            healthbar_transform = healthbar_transform.times(Mat4.translation(4, 0, 0));
        }
    }

    spawn_rocket(t, context, program_state){
        // Just placeholder to make rocket object
        let rocket_body_transform = this.rocket_transform
        let rocket_head_transform = this.rocket_transform
        let rocket_fin_transform = this.rocket_transform
        let rocket_hitbox_transform = this.rocket_transform
        let rocket_bubble_transform = this.rocket_transform

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
            rocket_fin_transform = this.rocket_transform.times(Mat4.rotation(i * (Math.PI / 4), 0, 1, 0))
                                    .times(Mat4.translation(0.8, -2, 0))
                                    .times(Mat4.scale(0.8, 1.8, 1))
            this.shapes.rocket_fin.draw(context, program_state, rocket_fin_transform,
                this.materials.rocket_extras.override({color:this.rocket_extras_colors[this.current_rocket]}))
        }

        if(this.shield){
            rocket_bubble_transform = rocket_bubble_transform.times(Mat4.scale(2, 3, 0.5))
            this.shapes.rocket_bubble.draw(context, program_state, rocket_bubble_transform,
                this.materials.shield)
        }

        rocket_hitbox_transform = rocket_hitbox_transform.times(Mat4.scale(1.15, 2.25, 1.15)).times(Mat4.translation(0, 0.15, 0))
        this.shapes.rocket_hitbox.draw(context, program_state, rocket_hitbox_transform, this.materials.rocket_hitbox)

        return rocket_hitbox_transform;
    }

    detect_collisions(hitbox_transform, object_list, type, max_dist) {
        for (let i = 0; i < object_list.length; i++) {
            if (this.compute_distance(hitbox_transform, object_list[i], max_dist)) {
                this.handle_collision(type)
            }
        }
    }

    handle_collision(type = "default") {
        switch(type) {
            case("Blackhole"):
                this.hp = 0
                console.log("Died to Black Hole")
                break
            case("Speedup"):
                this.activate_boost()
                this.speed_up_state = false
                console.log("Boost Activated")
                break
            case("Shield"):
                this.shield = true
                this.shield_state = false
                console.log("Shield Activated")
                break
            default:
                if (!this.isInvincible && !this.shield) {
                    console.log(`Hit by ${type}`)
                    this.isInvincible = true
                    this.hp -= 1
                    setTimeout(() => {
                        this.isInvincible = false;
                    }, INVINCIBILITY_TIME);
                    this.hurt = true
                    setTimeout(() => {
                        this.hurt = false;
                    }, HURT_TIME);
                }
                else if (!this.isInvincible && this.shield) {
                    console.log("Shield Destroyed")
                    this.isInvincible = true
                    this.shield = false
                    setTimeout(() => {
                        this.isInvincible = false;
                    }, SHIELD_DESTROY_TIME);
                    this.hurt = true
                    setTimeout(() => {
                        this.hurt = false;
                    }, HURT_TIME);
                }
                
        }
    }

    compute_distance(hitbox_transform, object_transform, max_dist) {

        let hitbox_x = hitbox_transform[0][0] + hitbox_transform[0][3]
        let hitbox_y = hitbox_transform[1][0] + hitbox_transform[1][3]

        let object_x = object_transform[0][0] + object_transform[0][3]
        let object_y = object_transform[1][0] + object_transform[1][3]

        let distance_x = object_x - hitbox_x
        let distance_y = object_y - hitbox_y
        let total_distance = Math.hypot(distance_x, distance_y);

        if (total_distance > max_dist) {
            return false
        } else {
            return true
        }
    }

    shoot_laser(t, spawn, context, program_state, model_transform, i) {
        const downward_speed = 9;
            
        const animate_laser = () => {
            let elapsed_time = t - spawn;
            const downward_distance = downward_speed * elapsed_time
            model_transform = model_transform.times(Mat4.translation( 0, -downward_distance, 0))
            const laser_transform = model_transform
                .times(Mat4.translation(0, 0, 0))
                .times(Mat4.scale(.6, .6, .6))
            this.laser_collisions[i] = laser_transform
            this.shapes.laser.draw(context, program_state, laser_transform, this.materials.laser);
        }

        animate_laser(t)
    }

    spawn_alienship(t, spawn, context, program_state, model_transform, i) {
        const downward_speed = 12;

        const animate_ship = () => {
            // Calculate time elapsed since the ship was spawned
            // const elapsed_time = t - spawn;
            // let elapsed_time = t + spawn_time - spawn_time;
            const downward_distance = downward_speed * (t - (spawn + 5))
            model_transform = model_transform.times(Mat4.translation( 0, -downward_distance, 0))

            const alien_ship_transform = model_transform
            .times(Mat4.scale(5/3, 5/3, 1/3))
    
            // Draw the disk body of the alien ship
            this.alien_collisions[i] = alien_ship_transform
            this.shapes.alien_ship_body.draw(context, program_state, alien_ship_transform, this.materials.alien_ship_body);

            // Position and draw the half-sphere head of the alien ship
            const head_transform = alien_ship_transform
                .times(Mat4.translation(0, 0, -.2 * 1/3)) 
                .times(Mat4.scale(1/5 * 2 , 1/5 * 2 , 2 * 1.2 ))
            this.shapes.alien_ship_head.draw(context, program_state, head_transform, this.materials.alien_ship_head);
    
            const gun_transform_left = model_transform
                .times(Mat4.translation(4.5 * 1/3, -1.5 * 1/3, 0))
                .times(Mat4.scale(.4 * 1/3, 4.5 * 1/3, .4 *1/3))
            const gun_transform_right = model_transform
                .times(Mat4.translation(-4.5 * 1/3, -1.5 * 1/3, 0))
                .times(Mat4.scale(.4 * 1/3, 4.5 * 1/3, .4 * 1/3))
            
            this.shapes.alien_ship_guns.draw(context, program_state, gun_transform_left, this.materials.alien_ship_guns);
            this.shapes.alien_ship_guns.draw(context, program_state, gun_transform_right, this.materials.alien_ship_guns);
            this.shoot_laser(t, spawn, context, program_state, gun_transform_left, i)
            this.shoot_laser(t, spawn, context, program_state, gun_transform_right, i)
        }

        animate_ship()
    }

    spawn_satellite_left(t, context, program_state, model_transform, i) {
        const speed = 12
        let satellite_transform = model_transform;
        satellite_transform = satellite_transform.times(Mat4.translation(speed * t, 0, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(.5, .5, 2));
        this.satellite_collisions_left[i] = satellite_transform
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

    spawn_satellite_right(t, context, program_state, model_transform, i) {
        const speed = 12
        let satellite_transform = model_transform;
        satellite_transform = satellite_transform.times(Mat4.translation(-speed * t, 0, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(.5, .5, 2));
        this.satellite_collisions_right[i] = satellite_transform
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

    spawn_speed_up(t, context, program_state, model_transform) {
        if (this.speed_up_state && t > 40 && t <= 58) {
            model_transform = Mat4.identity().times(Mat4.translation(0, -3 * (t - 40), 0)).times(model_transform);
            this.shapes.speed_up.draw(context, program_state, model_transform, this.materials.speed_up);
            model_transform = Mat4.identity().times(Mat4.translation(0, -1, 0)).times(model_transform);
            this.shapes.speed_up.draw(context, program_state, model_transform, this.materials.speed_up);
            model_transform = Mat4.identity().times(Mat4.translation(0, -1, 0)).times(model_transform);
            this.shapes.speed_up.draw(context, program_state, model_transform, this.materials.speed_up);
        }
        return model_transform;
    }

    spawn_shield(t, context, program_state, model_transform) {
        if (this.shield_state && t >= 3 && t <= 16) {
            model_transform = Mat4.identity().times(Mat4.translation(0, -5 * (t - 3), 0)).times(model_transform);
            this.shapes.shield.draw(context, program_state, model_transform, this.materials.shield);
        }
        return model_transform;
    }

    leave_earth(t, context, program_state, model_transform) {
        if (t >= 0 && t <= 2) {
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 2 && t <= 16) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 2), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    arrive_earth(t, context, program_state, model_transform) {
        if (t > 106 && t <= 120) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 106), 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        else if (t > 120) {
            model_transform = model_transform.times(Mat4.translation(0, 2.8, 0));
            this.shapes.earth.draw(context, program_state, model_transform, this.materials.earth);
        }
        return model_transform
    }

    spawn_mars(t, context, program_state, model_transform) {
        if (t >= 48 && t <= 54) {
            model_transform = model_transform.times(Mat4.translation(0, -0.2 * (t - 48), 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 54 && t <= 60) {
            model_transform = model_transform.times(Mat4.translation(0, -1.2, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        else if (t > 60 && t <= 70) {
            model_transform = model_transform.times(Mat4.translation(0, 0.2 * (t - 60), 0)).times(Mat4.translation(0, -1.2, 0));
            this.shapes.mars.draw(context, program_state, model_transform, this.materials.mars);
        }
        return model_transform
    }

    spawn_black_hole(t, context, program_state, model_transform) {
        let radius = 4 * Math.sin(Math.PI * t/15)
        radius = radius.toFixed(2)
        radius = Math.max(-radius, radius)
        if (radius == 0) {
            this.black_hole_positions[0] = (Mat4.translation(Math.floor(Math.random() * (25) + 6), Math.floor(Math.random() * (33) - 18), 0))
            this.black_hole_positions[1] = (Mat4.translation(Math.floor(Math.random() * (25) -30), Math.floor(Math.random() * (33) - 18), 0))
        }

        let black_hole_transform_1 = model_transform.times(this.black_hole_positions[0]).times(Mat4.scale(radius, radius, 0.01))
        let black_hole_transform_2 = model_transform.times(this.black_hole_positions[1]).times(Mat4.scale(radius, radius, 0.01))
        this.shapes.black_hole.draw(context, program_state, black_hole_transform_1, this.materials.black_hole.override({radius: radius}))
        this.shapes.black_hole.draw(context, program_state, black_hole_transform_2, this.materials.black_hole.override({radius: radius}))
    }

    // TODO: add logic for when other objects spawn
    spawn_objects(t, context, program_state, model_transform) {
        if (t > 5) {
            this.spawn_black_hole(t - 5, context, program_state, model_transform)
        }

        if ((t >= 10 && t <= 25)) {
            this.asteroid_belt(t, context, program_state, model_transform)
        }

        if ((t >= 30 && t <= 40)) {
            this.satellite_hit_left(t - 30, context, program_state, model_transform)
        }
        if ((t >= 40 && t <= 50)) {
            this.satellite_hit_right(t - 40, context, program_state, model_transform)
        }

        if ((t >= 50 && t <= 60)) {
            this.alien_attack(t, 50, context, program_state, model_transform)
        }
        if ((t >= 60 && t <= 70)) {
            this.alien_attack(t, 60, context, program_state, model_transform)
        }
        
        if ((t >= 75 && t <= 85)) {
            this.satellite_hit_right(t - 75, context, program_state, model_transform)
        }
        if ((t >= 85 && t <= 95)) {
            this.satellite_hit_left(t - 85, context, program_state, model_transform)
        }

        if ((t >= 100 && t <= 110)) {
            this.alien_attack(t, 100, context, program_state, model_transform)
        }
        if ((t >= 110 && t <= 120)) {
            this.alien_attack(t, 100, context, program_state, model_transform)
        }
    }

    spawn_text(t, context, program_state, model_transform) {

        // Ends the game if the user dies
        if (this.hp === 0) {
            let gameOver_transfrom = model_transform.times(Mat4.translation(-13.5, 10, 0)).times(Mat4.scale(2, 2, 2));
            const gameOver_text = "GAME OVER!"
            this.shapes.text_test.set_string(gameOver_text, context.context)
            this.shapes.text_test.draw(context, program_state, gameOver_transfrom, this.materials.text_test);

            let refresh_transform = model_transform.times(Mat4.translation(-11, 6, 0)).times(Mat4.scale(.85, 0.85, 0.85))
            const refreshGame_text = "Refresh To Restart"
            this.shapes.text_test.set_string(refreshGame_text, context.context)
            this.shapes.text_test.draw(context, program_state, refresh_transform, this.materials.text_test);
            return true
        }
        else {
            // spawn text
            if ((t >= 0 && t <= 11.5)) {
                let model_transform_1 = model_transform.times(Mat4.translation(-12, 10, -20))
                const text_1 = "Red Horizon Scare"
                this.shapes.text_test.set_string(text_1, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_1, this.materials.text_test)

                // transform the text downwards
                let model_transform_2 = model_transform_1.times(Mat4.translation(3, -4, 0))
                const text_2 = "Don't Get Hit"
                this.shapes.text_test.set_string(text_2, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_2, this.materials.text_test)

                // transform the text downwards
                let model_transform_3 = model_transform_2.times(Mat4.translation(-3, -4, 0))
                const text_3 = "Collect Power-Ups"
                this.shapes.text_test.set_string(text_3, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_3, this.materials.text_test)
            }

            if ((t >= 55 && t <= 60)) {
                if(!this.flipped){
                    this.flip_rocket()
                }
                
                let model_transform_4 = model_transform.times(Mat4.translation(-4, 0, -20))
                const text_4 = "Danger!"
                this.shapes.text_test.set_string(text_4, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_4, this.materials.text_test)

                // transform the text downwards
                let model_transform_5 = model_transform_4.times(Mat4.translation(1, -5, 0))
                const text_5 = "Abort."
                this.shapes.text_test.set_string(text_5, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_5, this.materials.text_test)
            }

            if ((t >= 120)) {
                let model_transform_6 = model_transform.times(Mat4.translation(-12, 10, -20))
                const text_6 = "You Made It Home!"
                this.shapes.text_test.set_string(text_6, context.context)
                this.shapes.text_test.draw(context, program_state, model_transform_6, this.materials.text_test)
            }
            return false
        }
        
    }

    move_rocket(){
        // takes sum of all movements affecting rocket and moves accordingly
        let vertical = 0
        let horizontal = 0
        let speed_mod = 1.0
        let flip_mod = 1.0

        // When collision detection becomes 
        if(this.boost){
            speed_mod = 1.8
        }
        
        if(this.flipped){
            flip_mod = -1.0
        }

        if(this.rocket_motion['N']){
            vertical += (PLAYER_SPEED * speed_mod * flip_mod)
        }
        if(this.rocket_motion['S']){
            vertical -= (PLAYER_SPEED * speed_mod * flip_mod)
        }
        if(this.rocket_motion['E']){
            horizontal += (PLAYER_SPEED * speed_mod)
        }
        if(this.rocket_motion['W']){
            horizontal -= (PLAYER_SPEED * speed_mod)
        }
        // ADD CHECKS FOR BLACK HOLE LATER
        let black_hole_directions = this.black_hole_effect()
        horizontal += black_hole_directions[0]
        vertical += (black_hole_directions[1] * flip_mod)

        this.rocket_transform = this.rocket_transform.times(Mat4.translation(horizontal, vertical, 0))
    }

    activate_boost(){
        this.boost = true;
        setTimeout(() => {this.boost = false}, 10000)
    }

    flip_rocket(){
        this.flipped = true
        let y_coord = this.rocket_transform[1][3]
        this.rocket_transform = Mat4.identity().times(Mat4.scale(1, -1, 1))
                                    .times(Mat4.translation(0, -2 * y_coord, 0))
                                    .times(this.rocket_transform)
    }

    black_hole_effect(){
        let result = [0, 0]
        for(let i = 0; i < 2; i++){
            let hole_coords = (this.black_hole_positions[i])

            let sum = 0.0
            // console.log(this.rocket_transform[0][3])
            for(let j = 0; j < 2; j++){
                sum += Math.pow((this.rocket_transform[j][3] - hole_coords[j][3]), 2)
            }

            // console.log(Math.sqrt(sum))
            if(Math.sqrt(sum) < 15){                
                if(this.rocket_transform[0][3] > hole_coords[0][3]){
                    result[0] -= BLACK_HOLE_ATTRACT
                }
                else{
                    result[0] += BLACK_HOLE_ATTRACT
                }

                if(this.rocket_transform[1][3] > hole_coords[1][3]){
                    result[1] -= BLACK_HOLE_ATTRACT
                }
                else{
                    result[1] += BLACK_HOLE_ATTRACT
                }
            }
        }

        return result
    }

    shake_camera(t, program_state) {
        if (t * 1000 % 2 > 1) {
            program_state.set_camera(this.stay_camera_location.times(Mat4.rotation(Math.PI / 32, 0, 0, 1)));
        }
        else {
            program_state.set_camera(this.stay_camera_location.times(Mat4.rotation(-Math.PI / 32, 0, 0, 1)));
        }
    }

    zoom_camera(t, program_state, { duration = 5, start_time = 0}) {
        if (t >= start_time && t <= start_time + duration) {
            const t_clamped = Math.min((t - start_time) / duration, 1);
            const interpolated_z = CAMERA.INIT_Z + t_clamped * (CAMERA.END_Z - CAMERA.INIT_Z);
    
            const camera_position = vec3(0, 10, interpolated_z);
            this.stay_camera_location = Mat4.look_at(
                camera_position, vec3(0, 0, 0), vec3(0, 1, 0)
            )
            // program_state.set_camera(this.stay_camera_location);
        } 
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change background", ["b"], this.change_background);
        this.key_triggered_button("Change rocket color", ["c"], this.change_rocket_color);
        this.key_triggered_button("Move rocket up", ["w"], 
                                    function() { this.rocket_motion['N'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['N'] = false});
        this.key_triggered_button("Move rocket down", ["s"], 
                                    function() { this.rocket_motion['S'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['S'] = false});
        this.key_triggered_button("Move rocket left", ["a"], 
                                    function() { this.rocket_motion['W'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['W'] = false});
        this.key_triggered_button("Move rocket right", ["d"],
                                    function() { this.rocket_motion['E'] = true},
                                    '#6E6460',
                                    function() { this.rocket_motion['E'] = false});
    }

    display(context, program_state) {
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.stay_camera_location);
            
        }
        
        // context.context.clearColor(this.background_colors[this.current_background][0], this.background_colors[this.current_background][1], this.background_colors[this.current_background][2], 1)
        context.context.clearColor(0, 0, 0, 0)
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(5, -2, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10**10)];

        program_state.set_camera(this.stay_camera_location);

        if (this.hurt) {
            this.shake_camera(t, program_state)
        }
        else {
            program_state.set_camera(this.stay_camera_location);
        }

        let model_transform = Mat4.identity()
        this.zoom_camera(t, program_state, {duration: 6, start_time: 2})
        let isGameOver = this.spawn_text(t, context, program_state, model_transform)
        if (isGameOver) {
            return;
        }
        this.spawn_objects(t, context, program_state, model_transform)
        let hitbox = this.spawn_rocket(t, context, program_state)
        this.move_rocket()
        this.spawn_healthbar(t, context, program_state, model_transform)
        
        let model_transform_speed_up_left = Mat4.identity().times(Mat4.translation(-4, 25, 0)).times(Mat4.translation(-0.335, 0, 0)).times(Mat4.rotation(Math.PI / 6, 0, 0, 1)).times(Mat4.scale(6, 2, 1)).times(Mat4.scale(0.08, 0.08, 0.08));
        model_transform_speed_up_left = this.spawn_speed_up(t, context, program_state, model_transform_speed_up_left)
        let model_transform_speed_up_right = Mat4.identity().times(Mat4.translation(-4, 25, 0)).times(Mat4.translation(0.335, 0, 0)).times(Mat4.rotation(-Math.PI / 6, 0, 0, 1)).times(Mat4.scale(6, 2, 1)).times(Mat4.scale(0.08, 0.08, 0.08));
        model_transform_speed_up_right = this.spawn_speed_up(t, context, program_state, model_transform_speed_up_right)

        let speed_up_collisions = [model_transform_speed_up_left, model_transform_speed_up_right]

        let model_transform_shield = Mat4.identity().times(Mat4.translation(6, 20, 0)).times(Mat4.scale(1.5, 1.5, 1.5));
        model_transform_shield = this.spawn_shield(t, context, program_state, model_transform_shield)

        let shield_collisions = [model_transform_shield];

        let model_transform_e_leave = Mat4.identity().times(Mat4.translation(0, -30, -15)).times(Mat4.scale(20, 20, 20));
        model_transform_e_leave = this.leave_earth(t, context, program_state, model_transform_e_leave);

        let model_transform_m= Mat4.identity().times(Mat4.translation(0, 50, -30)).times(Mat4.scale(20, 20, 20));
        model_transform_m = this.spawn_mars(t, context, program_state, model_transform_m);

        let model_transform_e_arrive = Mat4.identity().times(Mat4.translation(0, -80, -15)).times(Mat4.scale(20, 20, 20));
        model_transform_e_arrive = this.arrive_earth(t, context, program_state, model_transform_e_arrive);

        // Detecting collisions between objects and rocket
        this.detect_collisions(hitbox, this.black_hole_positions, "Blackhole", 1.5);
        this.detect_collisions(hitbox, Object.values(this.asteroid_positions), "Asteroid", 1.5);
        this.detect_collisions(hitbox, Object.values(this.alien_collisions), "Alien", 1.5);
        this.detect_collisions(hitbox, speed_up_collisions, "Speedup", 1.5);
        this.detect_collisions(hitbox, shield_collisions, "Shield", 1.5);
        this.detect_collisions(hitbox, Object.values(this.satellite_collisions_left), "Sattelite", 1.5);
        this.detect_collisions(hitbox, Object.values(this.satellite_collisions_right), "Sattelite", 1.5);
        this.detect_collisions(hitbox, Object.values(this.laser_collisions), "Laser", 1.5);
    }
}
