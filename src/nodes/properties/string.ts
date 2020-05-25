import BaseProperty from './base-property';

interface StringParams {
    value?: string,
}

export default class StringProperty implements BaseProperty {
    private _value: string;
    constructor(params: StringParams){
        this._value = params.value || "";
    }

    set value(value: string){
        this._value = value;
    }

    get value(): string {
        return this._value;
    }
}