import {image_to_imagedata, Point} from "./util.js";
import {NanoEntity, NanoRect, NanoShape, NanoText} from "./common.js";
import {NanoScreen} from "./screen.js";
import {KeyboardInput} from "./keyboard.js";

class NanoGame {
    private state: {};
    private screens: Map<string, NanoScreen>;
    debug: boolean;
    keyboard: KeyboardInput;
    width: number;
    height: number;
    private _canvas: HTMLCanvasElement;
    _scale: number;
    private _update_loop: () => void;
    private _current_screen: NanoScreen;
    constructor() {
        this.state = {}
        this.screens = new Map<string, NanoScreen>()
        this.debug = false
        this.keyboard = new KeyboardInput()
        this.width = 25
        this.height = 25
    }

    makeScreen(menu: string):NanoScreen {
        let screen = new NanoScreen()
        this.screens.set(menu,screen)
        return screen
    }

    start() {
        this._canvas = document.createElement('canvas')
        // this._canvas.width = this.width * window.devicePixelRatio * this._scale
        // this._canvas.height = this.height * window.devicePixelRatio * this._scale
        this._canvas.width = this.width * this._scale
        this._canvas.height = this.height * this._scale

        document.body.append(this._canvas)
        requestAnimationFrame(()=>  this._update())
    }

    private _update() {
        this._input()
        if(this._update_loop) this._update_loop()
        this._draw()
        requestAnimationFrame(()=>this._update())
    }

    private _draw() {
        let ctx = this._canvas.getContext('2d')
        ctx.save()
        ctx.scale(this._scale,this._scale)
        ctx.fillStyle = 'red'
        ctx.fillRect(0,0,this.width,this.height)


        this._current_screen.draw(ctx)
        ctx.restore()
    }

    setUpdateLoop(param: () => void) {
        this._update_loop = param
    }

    private _input() {
        this.keyboard.update()
    }

    setCurrentScreen(name: string) {
        if(!this.screens.has(name)) throw new Error(`no such screen ${name}`)
        this._current_screen = this.screens.get(name)
    }
}


export function example() {
    let game = new NanoGame()
    game.debug = true
    game.width = 640
    game.height = 480
    game._scale = 1

    //already has game.camera
    let menu = game.makeScreen("menu")
    let layer = menu.makeStaticLayer("layer1")
    let title:NanoText = layer.makeText("title")
    title.text = "This is Jude's cool game"
    title.position.x = 50
    title.position.y = 20
    title.fontSize = 20
    title.color = 'black'

    let world = game.makeScreen("world")
    const BRICK = 13
    const GROUND = 11
    // let map = world.makeTilemapLayer('map', {
    //         png: "./mario-1-1@1.png",
    //         colormap: {
    //             // '#503000ff':GROUND,
    //             // '#3cbcfcff':2,
    //             // '#ac7c00ff':BRICK,
    //             // '#80480',0,
    //             // let DARK_BROWN = [80,48,0,255]
    //             //503000ff
    //             // let sky_blue = [60,188,252,255]
    //             // let dark_green = [0,88,0,255]
    //             // let light_green = [184,248,24,255]
    //             // let white = [252,252,252,255]
    //             // let orange_brown = [228,92,16,255]
    //             // let brown = [172,124,0,255]
    //             // let medium_green = [0,168,68,255]
    //             // let medium_brown = [136,20,0,255]
    //             // return NONE
    //         },
    //         spritesheet: "spritesheet.png",
    //         tile_size: 4,
    //     })

    let creatures = world.makeEntityLayer("creatures")

    let player = new NanoEntity()
    player.type = 'player'
    player.name = "my player"
    player.position.x = 100 // in pixels
    player.position.y = 100
    player.view = new NanoRect(20,20)
    // player.width = 16
    // player.height = 16
    creatures.add(player)

    // let enemy1 = new NanoEntity()
    // enemy1.position.set(200,50) // in pixels
    // enemy1.type = 'enemy'
    // creatures.add(enemy1)

    // game.setCurrentScreen("menu")
    game.setCurrentScreen("world")

    // the world screen should be shown.
    // it should draw the tilemap and then the player and enemies
    // camera should just work. if follows a game entity with the type 'player'
    // how do we add logic to the enemy?
    // how do we change the type of a tile when the player presses the enter key on it?
        // in the game loop check if game.keyboard.enter.pressed vs game.keyboard.enter.down
    // shake the camera.  game.camera.shake()
    // log will draw into a console overlay

    game.keyboard.add_key("ArrowRight")
    game.keyboard.add_key("ArrowLeft")
    game.keyboard.add_key("ArrowUp")
    game.keyboard.add_key("ArrowDown")
    game.keyboard.add_key("Enter")
    let speed = 5
    game.setUpdateLoop(()=>{
        if(game.keyboard.keys.get("ArrowRight").pressed) {
            player.position.x += speed
        }
        if(game.keyboard.keys.get("ArrowLeft").pressed) {
            player.position.x -= speed
        }
        if(game.keyboard.keys.get("ArrowUp").pressed) {
            player.position.y -= speed
        }
        if(game.keyboard.keys.get("ArrowDown").pressed) {
            player.position.y += speed
        }
        if(game.keyboard.keys.get("Enter").fell) {
            player.position.y += 20
        }
        // if(game.keyboard.enter.pressed) {
        //     game.log("tilled soil")
        //     game.findScreen("world").findLayer("ground").setTileAt(player.position, 2)
        //     game.state.tilled_soil++
        // }
    })

    game.start() //creates canvas and css and adds to the page
}
