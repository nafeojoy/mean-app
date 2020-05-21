export function getDateOfThirtyDayAgo() {
    var moment = require('moment');
    var resultDate = moment().subtract(1, 'months').format();
    return resultDate;
}

export function getDateCriteria(date_field_name, r_form_date, r_to_date) {
    let c_cond = new Object();
    let p_cond = new Object();
    let result_obj = new Object();

    let form_date = r_form_date ? new Date(r_form_date) : new Date(getDateOfThirtyDayAgo());
    form_date.setHours(0, 0, 0, 0);
    let to_date = r_to_date ? new Date(r_to_date) : new Date();
    to_date.setHours(23, 59, 59, 999);
    c_cond[date_field_name] = {
        $lte: new Date(to_date),
        $gte: new Date(form_date)
    }
    result_obj.current_cond = c_cond;
    let fromDate_string = form_date.getFullYear() + '-' + (form_date.getMonth() + 1) + '-' + form_date.getDate();
    let toDate_string = to_date.getFullYear() + '-' + (to_date.getMonth() + 1) + '-' + to_date.getDate();
    let dif = getTwoDateDiffirenceAsDays(fromDate_string, toDate_string);
    let p_to_date = new Date(form_date);
    p_to_date.setHours(23, 59, 59, 999);
    let p_from_date = new Date(getDateOfSpecificDayAgo(p_to_date, Math.abs(dif)));
    p_from_date.setHours(0, 0, 0, 0);
    p_cond[date_field_name] = {
        $lte: new Date(p_to_date),
        $gte: new Date(p_from_date)
    }
    result_obj.prior_cond = p_cond;
    return result_obj;
}

export function getTwoDateDiffirenceAsDays(smallDay, bigDay) {
    var moment = require('moment');
    var start = moment(smallDay, "YYYY-MM-DD");
    var end = moment(bigDay, "YYYY-MM-DD");
    return moment.duration(start.diff(end)).asDays();
}

export function getDateOfSpecificDayAgo(dt, day) {
    var moment = require('moment');
    let to_dt = moment(dt);
    let fr_date = to_dt.subtract(day, 'days').format();
    return fr_date;
}

export function getDateOfSevenDayLater() {
    var moment = require('moment');
    var resultDate = moment().add(7, 'days').format();
    return resultDate;
}

export function getDateOfSevenDayAgo() {
    var moment = require('moment');
    var resultDate = moment().subtract(6, 'days').format();
    return resultDate;
}


Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

export function getDatesOfRange(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

export function getLastAndFirstDateOfPreviousMonth() {
    var moment = require('moment');
    var dateTo = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    var dateFrom = dateTo.split("-");
    dateFrom = dateFrom[0] + '-' + dateFrom[1] + '-01';
    dateFrom = new Date(dateFrom);
    dateTo = new Date(dateTo);
    dateTo.setHours(23, 59, 59, 999);
    return {
        dateFrom: dateFrom,
        dateTo: dateTo
    }
}

export function isSeoUnique(model, enSeo, bnSeo, excluded_id) {
    return new Promise((resolve, reject) => {
        let engCond = new Object();
        let exist = new Object();
        engCond['seo_url'] = enSeo;
        engCond['_id'] = {
            $ne: excluded_id
        }
        model.findOne(engCond)
            .exec()
            .then(eData => {
                if (eData && eData._id) {
                    exist.eng = true;
                } else {
                    exist.eng = false;
                }
                let bngCond = new Object();
                bngCond['lang.content.seo_url'] = bnSeo;
                bngCond['_id'] = {
                    $ne: excluded_id
                }

                return model.findOne(bngCond)
            })
            .then(bData => {
                if (bData && bData._id) {
                    exist.bng = true;
                } else {
                    exist.bng = false;
                }
                let uniq = {
                    duplicate: exist.bng || exist.eng,
                    message: (exist.bng && exist.eng) ? 'Seo Urls are duplicate!' : (!exist.bng && exist.eng) ? 'English seo url is duplicate!' : 'Bangla seo url is duplicate!'
                }
                resolve(uniq);
            })
    })
}


export function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

export function soundexSen(MyStr) {
    var GROUPSEPARATOR = " ";
    // replace certain text in strings with a slash
    var re = / v | v\. | vel | aka | false | recte | on zhe /gi;
    MyStr = MyStr.replace(re, '');

    // append soundex of each individual word
    var result = '^';
    var MyStrArray = MyStr.split(/[\s|,]+/); // use space or comma as token delimiter



    for (var i in MyStrArray) {
        if (MyStrArray[i].length > 0) { // ignore null at ends of array (due to leading or trailing space)
            if (i != 0) {
                result += GROUPSEPARATOR;
            }
            result += soundex(MyStrArray[i]);
            if ((MyStrArray.length - 1) == i) {
                result += "";
            }
        }
    }
    let last_length = (MyStrArray[MyStrArray.length - 1]).length;

    if (result.slice(-3) == '000' && result.length > 4 && last_length < 3) {
        result = result.slice(0, -3);
    }
    // //console.log(result);

    return result;
}
export function soundex(s) {
    var a = s.toLowerCase().split(''),
        f = a.shift(),
        r = '',
        codes = {
            a: '',
            e: '',
            i: '',
            o: '',
            u: '',
            b: 1,
            f: 1,
            p: 1,
            v: 1,
            c: 2,
            g: 2,
            j: 2,
            k: 2,
            q: 2,
            s: 2,
            x: 2,
            z: 2,
            d: 3,
            t: 3,
            l: 4,
            m: 5,
            n: 5,
            r: 6
        };

    r = f +
        a
        .map(function(v, i, a) {
            return codes[v]
        })
        .filter(function(v, i, a) {
            return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
        })
        .join('');

    return (r + '000').slice(0, 4).toUpperCase();
};