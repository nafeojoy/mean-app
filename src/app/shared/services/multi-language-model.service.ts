import { Injector } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';

import { LanguageFormGroup } from '../interfaces/language-form-group.interface';

import { AppState } from '../../app.service';

export abstract class MultiLanguageModelService {

    public formBuilder: FormBuilder;

    protected appService: AppState;

    constructor(injector: Injector) {
        this.formBuilder = injector.get(FormBuilder);
        this.appService = injector.get(AppState);
    }

    public get defaultLanguageCode() {
        return this.appService.defaultLanguageCode;
    }

    public abstract getFormModel(): FormGroup;

    public getDataModel(): any {
        var formModel = this.getFormModel();
        var dataModel = {};

        for (var key in formModel.value) {
            if (formModel.controls[key] instanceof LanguageFormGroup) {
                dataModel[key] = {}
                dataModel[key][this.defaultLanguageCode] = '';
            } else {
                dataModel[key] = formModel.controls[key].value
            }
        }

        return dataModel;
    }

    /**
     * @returns multi language ready data model from form values
     */
    
    public getFormValue(form: FormGroup): any {
        var returnVal = {};
        var languageValues = {};
        returnVal['lang'] = [];
        for (var key in form.value) {
            if (form.controls[key] instanceof LanguageFormGroup) {

                returnVal[key] = form.controls[key].value[this.defaultLanguageCode];

                for (var languageCode in form.controls[key].value) {
                    if (languageCode != this.defaultLanguageCode) {
                        if (!languageValues[languageCode]) {
                            languageValues[languageCode] = {};
                        }
                        languageValues[languageCode][key] = form.controls[key].value[languageCode];
                    }
                }
            } else {
                returnVal[key] = form.controls[key].value;
            }
        }

        for (var languageCode in languageValues) {
            var obj = {
                code: languageCode,
                content: languageValues[languageCode]
            };

            returnVal['lang'].push(obj);
        }

        return returnVal;
    }

    public buildFormValue(inputValue: any) {
        var returnVal = {};

        if (inputValue['lang'] && inputValue['lang'].length) {
            var content = inputValue['lang'][0].content;

            for (var key in inputValue) {
                if (key != 'lang') {
                    if (key in content) {
                        var defaultVal = inputValue[key];

                        returnVal[key] = {}
                        returnVal[key][this.defaultLanguageCode] = defaultVal;

                        for (var index in inputValue['lang']) {
                            var languageCode = inputValue['lang'][index].code;

                            returnVal[key][languageCode] = inputValue['lang'][index].content[key];
                        }
                    } else {
                        returnVal[key] = inputValue[key];
                    }
                }
            }
        } else {
            return inputValue;
        }

        return returnVal;
    }
}
