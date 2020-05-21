// app/translate/translation.ts

import { OpaqueToken } from '@angular/core';

// import translations
import { LANG_EN_NAME, LANG_EN_TRANS } from './lang-en';
import { LANG_BN_NAME, LANG_BN_TRANS } from './lang-bn';

// translation token
export const TRANSLATIONS = new OpaqueToken('translations');

// all translations
/*export const dictionary = {
    [LANG_EN_NAME]: LANG_EN_TRANS,
    [LANG_BN_NAME]: LANG_BN_TRANS
};*/

const dictionary = {
    "en": LANG_EN_TRANS,
    "bn": LANG_BN_TRANS,
};


// providers
export const TRANSLATION_PROVIDERS = [
    { provide: TRANSLATIONS, useValue: dictionary },
];