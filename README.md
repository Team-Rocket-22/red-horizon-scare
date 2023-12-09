# red-horizon-scare

**Goal:**

The goal of our project is to create a rocket adventure game that demonstrates our understanding and application of course topics such as modeling, matrix transformations, the notion of a camera/eye matrix, and lighting. The user will move a rocket through space, with the goal of getting from Earth to Mars and back. Players are essentially surviving for a set amount of time while avoiding various obstacles they may encounter.


**Features:**

1. Customization: Players will be able to customize the primary and accent colors of their rocket along with the space background of their choice.
2. Different Obstacles: There are numerous, unique obstacles and enemies to avoid such as black holes, asteroids, satellites, alien ships, and laser beams.
3. On-hit Effects: Collisions result in different effects. Being hit by obstacles results in losing health and a camera shake. Collecting a power-up grants players a force field or a speed-up buff.
4. Bump Mapping: To produce more realistic details, we will use bump mapping to give asteroids a texture that has a rough, rocky appearance.
5. Collision Detection: When an object hits the rocket, we want to detect that it was hit so we need collision detection to correctly apply the intended effect.
6. Physics-based Simulation: The black holes in our game will force a translation on the rocket object to move in the direction towards the black hole’s center.


**Operation:**

The user will be able to move the rocket in four directions: up, down, left, and right, but it will continuously “travel” forward to progress the game. Users must use these controls to avoid obstacles such as aliens, lasers, asteroids, satellites, and blackholes while trying to collect power-ups that will help them survive. Hitting an obstacle will result in losing health and a camera shake effect while black holes actively try to suck players into the singularity with their gravitational field.

To start the game, players can simply navigate to [https://red-horizon-scare.vercel.app/](https://red-horizon-scare.vercel.app/) and start experiencing the game. More advanced users who want to further customize the game can either download and extract the zipped file from the repository or use git to clone the repository from  [https://github.com/Team-Rocket-22/red-horizon-scare](https://github.com/Team-Rocket-22/red-horizon-scare). Then, they can open the root folder in Visual Studio Code and download the Live Server Extension. Finally, they can click “Go Live” in the bottom right corner and begin playing the game in their browser.

The following key/button presses are used to control the game:


Customization:

    ‘b’ key- Change the background

    ‘c’ key - Change the rocket color

    ‘Start Music’ button - Begin playing background music

    ‘Toggle Volume’ button - Mute/unmute background music

Movement:

    ‘w’ key - Move the rocket up

    ‘a’ key - Move the rocket left

    ‘s’ key - Move the rocket down

    ‘d’ key - Move the rocket right

Browser:

    ‘Refresh’ button: Restart the game
