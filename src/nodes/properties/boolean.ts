import BaseProperty from './base-property';

interface BooleanParams {
    value?: boolean,
}

export default class BooleanProperty implements BaseProperty {
    private _value: boolean;
    constructor(params: BooleanParams){
        this._value = params.value || false;
    }

    set value(value: boolean){
        this._value = value;
    }

    get value(): boolean {
        return this._value;
    }
}