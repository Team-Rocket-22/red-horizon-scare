// Function to play background music
let audio = null; // Declare audio variable in the global scope

function background_music() {
    // Create an audio object
    audio = new Audio('./assets/starwars.mp3');

    // Play the sound
    audio.play();
}

function toggleVolume() {
    if (audio) {
        if (audio.volume === 0) {
            audio.volume = 1; // If muted, set volume to full
        } else {
            audio.volume = 0; // If not muted, mute the volume
        }
    }
}

// Call the background_music function to start playing the music when the page loads
document.getElementById("startMusic").addEventListener("click", background_music);

// Add event listener for the volume toggle button click
document.getElementById("volumeToggle").addEventListener("click", toggleVolume);

// Indicate which element on the page you want the Canvas_Widget to replace with a 3D WebGL area:
const element_to_replace = document.querySelector("#main-canvas");
import { Main_Scene, Additional_Scenes, Canvas_Widget } from './main-scene.js';
// Import the file that defines a scene.
const scenes = [Main_Scene, ...Additional_Scenes].map(scene => new scene());
// This line creates your scene.
new Canvas_Widget(element_to_replace, scenes);
