import {image_to_imagedata, Point, toHex, uuid} from "./util.js";

export interface NanoShape {
    name:string
    draw(ctx: CanvasRenderingContext2D): void;
}

export class NanoImage implements NanoShape{
    name: string;
    draw(ctx: CanvasRenderingContext2D): void {
    }
}
export class NanoText implements NanoShape{
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
export class NanoRect implements NanoShape {
    name: string;
    private width: number;
    private height: number;
    constructor(width:number, height:number) {
        this.width = width
        this.height = height
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'blue'
        ctx.fillRect(0,0,this.width,this.height)
    }

}
export class NanoEntity implements NanoShape {
    type: string;
    name: string;
    position: Point
    view:NanoShape
    constructor() {
        this.type = "unknown"
        this.name = uuid('entity')
        this.position = new Point(0,0)
        this.view = new NanoRect(50,100)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.view.draw(ctx)
    }
}

export interface NanoLayer {
    draw(ctx: CanvasRenderingContext2D): void;
}

export class NanoStaticLayer implements NanoLayer {
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

export class NanoTilemapLayer implements NanoLayer {
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

export class NanoEntityLayer implements NanoLayer{
    private entities: NanoEntity[];
    constructor() {
        this.entities = new Array<NanoEntity>()
    }
    add(ent: NanoEntity) {
        this.entities.push(ent)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.entities.forEach(ent => {
            ctx.save()
            ctx.translate(ent.position.x,ent.position.y)
            ent.draw(ctx)
            ctx.restore()
        })
    }
}

