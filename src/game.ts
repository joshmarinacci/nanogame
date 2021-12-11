/*

example game

create menu screen
create main game screen
create tilemap from spritesheet and JSON or from tile
create player
create enemy
create store screen


 */

import {image_to_imagedata, Point} from "./util.js";

interface NanoShape {
    name:string

    draw(ctx: CanvasRenderingContext2D): void;
}

class NanoImage implements NanoShape{
    name: string;

    draw(ctx: CanvasRenderingContext2D): void {
    }
}

function uuid(prefix: string) {
    return prefix + "_" + Math.floor(Math.random()*100000000)
}

class NanoText implements NanoShape{
    text: string;
    position: Point;
    fontSize: number;
    color: string;
    constructor() {
        this.text = "empty text"
        this.position = new Point(0,0)
        this.fontSize = 16
        this.name = uuid("text")
        this.color = 'red'
    }
    name: string;

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.font = `${this.fontSize}px serif`
        ctx.fillStyle = this.color
        ctx.fillText(this.text, this.position.x,this.position.y+10)
    }
}

interface NanoLayer {
    draw(ctx: CanvasRenderingContext2D): void;
}

class NanoStaticLayer implements NanoLayer {
    private items: Map<string, NanoShape>;
    constructor() {
        this.items = new Map<string, NanoShape>()
    }

    makeText(name: string):NanoText {
        let text = new NanoText()
        this.items.set(name,text)
        return text
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.items.forEach(it => {
            it.draw(ctx)
        })
    }
}


function toHex(c: number) {
    if(c < 16) return "0"+c.toString(16)
    return c.toString(16)
}

class NanoTilemapLayer implements NanoLayer {
    private img: HTMLImageElement;
    private data: number[];
    private loaded: boolean;
    private options: any;
    private position: Point;
    private color_cache: Map<number, string>;
    private missing_count: number;
    constructor(options:any) {
        this.color_cache = new Map<number, string>()
        this.missing_count = 0
        this.options = options
        this.position = new Point(0,0)
        this.loaded = false
        this.img = new Image()
        this.img.src = options.png
        this.img.onload = () => {
            this.process_image()
        }
    }

    set_tile_at_point(pt:Point, type:number) {
        this.data[this.xy2n(pt.x,pt.y)] = type
    }

    get_height(): number {
        if(this.loaded) return this.img.height
        return 16
    }

    get_width(): number {
        if(this.loaded) return this.img.width
        return 16
    }

    tile_at(x, y): number {
        if(this.loaded) {
            return this.data[this.xy2n(x, y)]
        }
        return 0
    }

    tile_at_point(pt: Point): number {
        return this.tile_at(pt.x,pt.y)
    }

    private process_image() {
        this.data = new Array(this.img.width*this.img.height)
        this.data.fill(0)
        let id = image_to_imagedata(this.img)
        for(let i=0; i<this.img.width; i++) {
            for(let j=0; j<this.get_height(); j++) {
                let n = (i + j*id.width)*4
                let color = [id.data[n+0],id.data[n+1],id.data[n+2],id.data[n+3]]
                this.set_xy(i,j,this.calc_type(color))
            }
        }
        // this.enhance()
        this.loaded = true
    }
    private xy2n(i: number, j: number) {
        return i + j * this.img.width
    }
    private set_xy(x: number, y: number, tt: number) {
        if (x < 0) return
        if (x >= this.img.width) return
        if (y < 0) return;
        if (y >= this.img.height) return
        this.data[this.xy2n(x, y)] = tt
    }


    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        ctx.translate(this.position.x,this.position.y)
        let ts = 16
        for (let i = 0; i < this.get_width(); i++) {
            for (let j = 0; j < this.get_height(); j++) {
                let t = this.tile_at(i, j)
                ctx.fillStyle = this.number_to_color(t)
                ctx.fillRect(i*ts, j*ts, ts, ts)
            }
        }
        ctx.restore()
    }

    private calc_type(color: number[]):number {
        let hex = '#'+color.map(c => toHex(c)).join("")
        if(!this.options.colormap[hex]) {
            this.missing_count += 1
            this.options.colormap[hex] = this.missing_count
            console.log(`unmapped color '${hex}' set to ${this.missing_count}`)
        }
        return this.options.colormap[hex]
    }

    private number_to_color(t: number):string {
        if(!this.color_cache.has(t)) {
            let color = `hsl(${(Math.random()*360).toFixed(1)},50%,50%)`
            console.log("using random color",color)
            this.color_cache.set(t,color)
        }
        return this.color_cache.get(t)
    }
}

class NanoEntityLayer implements NanoLayer{
    private entities: NanoEntity[];
    constructor() {
        this.entities = new Array<NanoEntity>()
    }
    add(ent: NanoEntity) {
        this.entities.push(ent)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.entities.forEach(ent => {
            ent.draw(ctx)
        })
    }
}

class NanoScreen {
    private layers:Map<string,NanoLayer>;
    constructor() {
        this.layers = new Map<string, NanoLayer>()
    }

    makeStaticLayer(name: string):NanoStaticLayer {
        let layer = new NanoStaticLayer()
        this.layers.set(name, layer)
        return layer
    }

    makeTilemapLayer(name:string, options:any):NanoTilemapLayer {
        let layer = new NanoTilemapLayer(options)
        this.layers.set(name,layer)
        return layer
    }

    makeEntityLayer(name: string):NanoEntityLayer {
        let layer = new NanoEntityLayer()
        this.layers.set(name,layer)
        return layer
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'yellow'
        ctx.fillRect(0,0,10,10)
        this.layers.forEach((layer)=>{
            layer.draw(ctx)
        })
    }
}

class KeyboardInput {
}

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

    }

    setCurrentScreen(name: string) {
        if(!this.screens.has(name)) throw new Error(`no such screen ${name}`)
        this._current_screen = this.screens.get(name)
    }
}

class NanoEntity implements NanoShape {
    type: string;
    name: string;
    position: Point
    constructor() {
        this.type = "unknown"
        this.name = uuid('entity')
        this.position = new Point(0,0)
    }

    draw(ctx: CanvasRenderingContext2D): void {
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
    let map = world.makeTilemapLayer('map', {
            png: "./mario-1-1@1.png",
            colormap: {
                // '#503000ff':GROUND,
                // '#3cbcfcff':2,
                // '#ac7c00ff':BRICK,
                // '#80480',0,
                // let DARK_BROWN = [80,48,0,255]
                //503000ff
                // let sky_blue = [60,188,252,255]
                // let dark_green = [0,88,0,255]
                // let light_green = [184,248,24,255]
                // let white = [252,252,252,255]
                // let orange_brown = [228,92,16,255]
                // let brown = [172,124,0,255]
                // let medium_green = [0,168,68,255]
                // let medium_brown = [136,20,0,255]
                // return NONE
            },
            spritesheet: "spritesheet.png",
            tile_size: 4,
        })

    let creatures = world.makeEntityLayer("creatures")

    let player = new NanoEntity()
    player.type = 'player'
    player.name = "my player"
    player.position.x = 100 // in pixels
    player.position.y = 100
    // player.width = 16
    // player.height = 16
    creatures.add(player)

    let enemy1 = new NanoEntity()
    enemy1.position.set(200,50) // in pixels
    enemy1.type = 'enemy'
    creatures.add(enemy1)

    game.setCurrentScreen("world")

    // the world screen should be shown.
    // it should draw the tilemap and then the player and enemies
    // camera should just work. if follows a game entity with the type 'player'
    // how do we add logic to the enemy?
    // how do we change the type of a tile when the player presses the enter key on it?
        // in the game loop check if game.keyboard.enter.pressed vs game.keyboard.enter.down
    // shake the camera.  game.camera.shake()
    // log will draw into a console overlay

    game.setUpdateLoop(()=>{
        // if(game.keyboard.enter.pressed) {
        //     game.log("tilled soil")
        //     game.findScreen("world").findLayer("ground").setTileAt(player.position, 2)
        //     game.state.tilled_soil++
        // }
    })

    game.start() //creates canvas and css and adds to the page
}
