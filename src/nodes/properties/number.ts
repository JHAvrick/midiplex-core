export default class NumberProperty {
    private _value: number;
    public min: number;
    public max: number;
    constructor(value: number, min:number = -Infinity, max:number = Infinity){
        this._value = value;
        this.min = min;
        this.max = max;
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = Math.min(Math.max(this._value, this.min), this.max);
    }
}