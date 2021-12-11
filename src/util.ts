export class Point {
    x:number
    y:number
    constructor(x:any,y?:any) {
        if(typeof x == 'number') {
            this.x = x
            this.y = y
        } else {
            this.x = x.x
            this.y = x.y
        }
    }
    add(pt) {
        return new Point(this.x + pt.x, this.y + pt.y)
    }

    subtract(pt: Point) {
        return new Point(this.x - pt.x, this.y - pt.y)
    }

    multiplyScalar(scalar: number) {
        return new Point(this.x*scalar, this.y*scalar)
    }

    set(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export class Rect {
    pos: Point;
    size: Point;
    constructor(a1:any,a2:any,a3?:any,a4?:any) {
        this.pos = new Point(0,0)
        this.size = new Point(0,0)
        if(typeof a1 === 'number') this.pos.x = a1
        if(typeof a2 === 'number') this.pos.y = a2
        if(typeof a3 === 'number') this.size.x = a3
        if(typeof a4 === 'number') this.size.y = a4
        if(a1 instanceof Point) this.pos = a1
        if(a2 instanceof Point)  this.size = a2
    }

    multiplyScalar(scalar: number) {
        return new Rect(
            this.pos.multiplyScalar(scalar),
            this.size.multiplyScalar(scalar)
        )
    }

    add(pt:Point) {
        return new Rect(this.pos.add(pt),this.size)
    }

    inset(number: number) {
        let off = new Point(number,number)
        return new Rect(
            this.pos.add(off),
            this.size.subtract(off).subtract(off)
        )
    }
    left() {
        return this.pos.x
    }
    right() {
        return this.pos.x + this.size.x
    }
    top() {
        return this.pos.y
    }

    bottom() {
        return this.pos.y + this.size.y
    }

    width() {
        return this.size.x
    }
    height() {
        return this.size.y
    }

    contains(pt: Point) {
        if(pt.x < this.pos.x) return false
        if(pt.x > this.pos.x + this.size.x) return false
        if(pt.y < this.pos.y) return false
        if(pt.y > this.pos.y + this.size.y) return false
        return true
    }
}


export function image_to_imagedata(img: HTMLImageElement):ImageData {
    let can = document.createElement('canvas')
    can.width = img.width
    can.height = img.height
    let ctx = can.getContext('2d')
    ctx.drawImage(img,0,0)
    return ctx.getImageData(0,0,img.width,img.height)
}


