import {NanoEntityLayer, NanoLayer, NanoStaticLayer, NanoTilemapLayer} from "./common.js";

export class NanoScreen {
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
