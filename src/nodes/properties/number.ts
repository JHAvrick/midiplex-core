import BaseProperty from './base-property';

interface NumberParams {
    value?: number,
    min?: number,
    max?: number,
}

export default class NumberProperty implements BaseProperty {
    private _value: number;
    public min: number;
    public max: number;
    constructor(params: NumberParams){
        this._value = params.value || 0;
        this.min = params.min || -Infinity;
        this.max = params.max || Infinity;
    }

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = Math.min(Math.max(value, this.min), this.max);
    }
}