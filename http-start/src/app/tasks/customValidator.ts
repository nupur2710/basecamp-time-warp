import { AbstractControl, ValidatorFn } from '@angular/forms';
// validation function
function validateTimeDescription() : ValidatorFn {
  return (c: AbstractControl) => {
    debugger
    let isValid = c.value !="";
    if(isValid) {
        return null;
    } else {
        return {
            timeDescription: {
                valid: false
            }
        };
  }
}