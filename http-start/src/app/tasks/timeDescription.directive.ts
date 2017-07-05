import { NG_VALIDATORS, Validator, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';

import { Directive, OnInit, ElementRef, HostListener, Input, OnChanges } from '@angular/core';

// validation function
function validateTimeDescription(): ValidatorFn {
    return (c: AbstractControl) => {
        debugger
        let isValid = c.value != "";
        if (isValid) {
            return null;
        } else {
            return {
                timeDescription: {
                    valid: false
                }
            };
        }
    }
}

@Directive({
    selector: '[timeDescpValidation][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: TimeDescriptionDirective, multi: true }
    ]
})

// @Directive({
//     selector: '[timeDescpValidation]'
// })
export class TimeDescriptionDirective implements Validator, OnInit, OnChanges {
    validator: ValidatorFn;
    @Input() public timeDescpValidation: any;
    @Input() public input: any;

    constructor(private el: ElementRef) {
        this.validator = validateTimeDescription();
    }

    // @HostListener('change') ngOnChanges() {
    //     console.log('test');
    // }

    ngOnChanges(changes) {
        if (changes.input) {
            console.log('input changed');
        }
    }

    ngOnInit() {
    }
    // constructor() {
    //     debugger
    //     this.validator = validateTimeDescription();
    // }

    validate(c: FormControl) {
        return this.validator(c);
    }
}