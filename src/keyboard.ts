class KeyState {
    public pressed: boolean;
    public fell: boolean
    public raised: boolean
    private updated:boolean
    constructor(keyname: string) {
        this.pressed = false
        this.updated = false
        this.fell = false
        this.raised = false
    }

    handle_down(e: KeyboardEvent) {
        if(this.pressed === false) {
            this.pressed = true
            this.updated = true
        }
    }

    handle_up(e: KeyboardEvent) {
        this.pressed = false
        this.updated = true
    }

    update() {
        if(this.updated) {
            if(this.pressed) this.fell = true
            this.updated = false
        } else {
            this.fell = false
        }
    }
}


export class KeyboardInput {
    public readonly keys: Map<string,KeyState>;
    constructor() {
        this.keys = new Map<string,KeyState>()
        this.keys.set("ArrowRight",new KeyState("ArrowRight"))
        document.addEventListener('keydown',(e) => {
            if(this.keys.has(e.key)) this.keys.get(e.key).handle_down(e)
        })
        document.addEventListener('keyup',(e) => {
            if(this.keys.has(e.key)) this.keys.get(e.key).handle_up(e)
        })
    }

    add_key(name: string) {
        this.keys.set(name, new KeyState(name))
    }

    update() {
        for(let ks of this.keys.values()) {
            ks.update()
        }
    }
}

