export default class BooleanProperty {
    private _value: boolean;
    constructor(value: boolean){
        this._value = value;
    }

    set value(value: boolean){
        this._value = value;
    }

    get value(): boolean {
        return this._value;
    }
}