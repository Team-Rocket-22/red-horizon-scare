import {defs, tiny} from '../examples/common.js';

const {
    Shader,
    Matrix
 } = tiny;

 const {
    Textured_Phong
 } = defs;

const shaders = {};

export {shaders};

const Bump_Mapped = shaders.Bump_Mapped =
    class Bump_Mapped extends Textured_Phong {
        fragment_glsl_code() {
            // ********* FRAGMENT SHADER *********
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
        
                void main(){
                    // Sample the texture image in the correct place:
                    vec4 tex_color = texture2D( texture, f_tex_coord );
                    if( tex_color.w < .01 ) discard;
                    float gray = dot(tex_color.rgb, vec3(0.299, 0.587, 0.114));
                    vec3 grayscale = vec3(gray);
                    // Slightly disturb normals based on sampling the same image that was used for texturing:
                    vec3 bumped_N  = N + tex_color.rgb - .5*vec3(1,1,1);
                    // Compute an initial (ambient) color:
                    gl_FragColor = vec4(grayscale, 1.0) - vec4(0.15, 0.15, 0.15, 0);
                    // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( normalize( bumped_N ), vertex_worldspace );
                  } `;
        }
    }

const Ring_Shader = shaders.Ring_Shader = 
    class Ring_Shader extends Shader {
        update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
            // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
            const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
                PCM = P.times(C).times(M);
            context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
            context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
                Matrix.flatten_2D_to_1D(PCM.transposed()));
            this.send_material(context, gpu_addresses, material);
        }

        send_material(gl, gpu, material) {
            // send_material(): Send the desired shape-wide material qualities to the
            // graphics card, where they will tweak the Phong lighting formula.
            gl.uniform1f(gpu.radius, material.radius);
        }

        shared_glsl_code() {
            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
            return `
                precision mediump float;
                varying vec4 point_position;
                varying vec4 center;
                uniform float radius;
            `;
        }

        vertex_glsl_code() {
            // ********* VERTEX SHADER *********
            return this.shared_glsl_code() + `
            attribute vec3 position;
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
            
            void main(){
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
            point_position = model_transform * vec4(position, 1.0);
            }`;
        }

        fragment_glsl_code() {
            // ********* FRAGMENT SHADER *********
            return this.shared_glsl_code() + `
            void main(){
                if (distance(point_position.xyz, center.xyz) > (radius * 0.93)) {
                    gl_FragColor = vec4(0.69,0.502,0.251, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }`;
        }
    }