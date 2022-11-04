
const api_domain = location.protocol + "//" + location.hostname + ":" + location.port;
/**
 * ajax 호출
 *  args
 *      - url : URL
 *      - type : 전송방식(default : post)
 *      - data : 전송값
 *      - dataType : 데이터 타입
 *      - callback : 콜백함수
 *      - cookie : true 일경우 cookie정보 보냄(생략가능)
 *      - beforeSend : 전송전 실행함수(생략가능)
 *      - complete : 전송완료후 실행함수(생략가능)
 *      - enctype : 전송인코딩타입(생략가능)
 */
let call = {
    // api 호출
    api: function(args) {
        if ( args.url.indexOf('http') === -1 && args.url.indexOf(api_domain) === -1) {
            if( args.url.indexOf('/') > 0) {
                args.url = '/' + args.url;
            }
            args.url = api_domain + args.url;
        }
        this.ajax(args);
    },

    ajax: function(args) {
        const option = args.option != undefined ? args.option : {};
        // const loading = option.loading != undefined ? option.loading : false;

        const ajaxArgs = {
            url: args.url,
            type: args.type !== undefined ? args.type : 'post',
            data: args.data !== undefined ? args.data : '',
            // dataType: args.dataType !== undefined ? args.dataType : 'json',
            contentType: args.contentType !== undefined ? args.contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
            cache: false,
            crossDomain: true,

            beforeSend: function beforeSend() {
            },

            complete: function complete(status) {
            },

            success: function (data) {
                process();

                function process() {
                    if (document.readyState === 'interactive' || document.readyState === 'complete') {
                        if (args.callback) {
                            args.callback('success', data);
                        }
                    } else {
                        setTimeout(function () {
                            process();
                        }, 100);
                    }
                }

                return data;
            },

            error: function (request, status, error) {
                console.log('error callback > code : ' + request.status);

                if (args.callback) {
                    args.callback('error', request)
                }
            },
        };

        if (args.type === 'get') {          // 컨텍트 타입
        }

        if (args.async !== undefined) {     // 동기/비동기
            ajaxArgs.async = args.async;
        }

        if (args.timeout !== undefined) {    // 타임아웃
            ajaxArgs.timeout = args.timeout;
        }

        if (args.cookie === true) {          // 쿠키
            ajaxArgs.xhrFields = {withCredentials: true};
        }

        if (args.xhrFields !== undefined) {
            ajaxArgs.xhrFields = {responseType: "blob"};
        }

        if (args.beforeSend !== undefined) {    // ajax 시작전 콜함수
            ajaxArgs.beforeSend = args.beforeSend;
        }

        if (args.complete !== undefined) {   // ajax 성공후 콜함수
            ajaxArgs.complete = args.complete;
        }

        if (args.enctype === 'multipart/form-data') {    // 파일업로드
            ajaxArgs.processData = false;
            ajaxArgs.contentType = false;
        }

        $.ajax(ajaxArgs);
    },

    // 쿠키 가져오기
    getCookie: function (name){
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null,
            cookieEnd;

        if (cookieStart > -1){
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1){
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }

        return cookieValue;
    },

    // 쿠키 저장
    setCookie: function (name, value, path, domain, secure, expires, times) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        if (expires && times) {
            var expiresDate = new Date();
            expiresDate.setTime(expiresDate.getTime() + (expires  * times * 60 * 60 * 1000));
            cookieText += "; expires=" + expiresDate.toUTCString();
        } else if (expires) {
            var expiresDate = new Date();
            expiresDate.setTime(expiresDate.getTime() + (expires * 24 * 60 * 60 * 1000));

            cookieText += "; expires=" + expiresDate.toUTCString();
        } else if (times) {
            var expiresDate = new Date();
            expiresDate.setTime(expiresDate.getTime() + (times * 60 * 60 * 1000));
            cookieText += "; expires=" + expiresDate.toUTCString();
        }

        if (path) {
            cookieText += "; path=" + path;
        } else {
            cookieText += "; path=/";
        }
        if (domain) {
            cookieText += "; domain=" + domain;
        }
        if (secure) {
            cookieText += "; secure";
        }
        document.cookie = cookieText;
    },

    // 쿠키 해제
    unsetCookie: function (name, path, domain, secure){
        this.setCookie(name, "", path, domain, secure, new Date(0));
    },

    refresh: function() {
        let itv = setInterval(function() {
            let date = new Date();
            let min = date.getMinutes();
            let sec = date.getSeconds();
            if (min === 0 || min === 30) {
                call.locationReload(0);
            }
        }, 60000);
    },

    locationReload: function(sec) {
        if (sec === 0) {
            location.reload();
        } else {
            setTimeout(function() {
                location.reload();
            }, sec * 1000);
        }
    },

    asyncRefresh: function(func) {
        let itv = setInterval(function() {
            if (typeof func === "function") {
                setTimeout(function() {
                    let date = new Date();
                    let min = date.getMinutes();
                    let sec = date.getSeconds();
                    if (min === 0 || min === 30) {
                        func();
                    }
                }, 1000);
            }
        }, 60000);
    },
}

HashMap = function() {
    this.map = new Array();
};

HashMap.prototype = {
    put: function(key, value) {
        this.map[key] = value;
    },
    get: function(key) {
        return this.map[key];
    },
    getAll: function() {
        return this.map;
    },
    clear: function() {
        this.map = new Array();
    },
    getKeys: function() {
        let keys = new Array();
        for(let i in this.map) {
            keys.push(i);
        }
        return keys;
    }
};

/**
 * yyyyMMdd 날짜 문자열을 Date형으로 반환
 * @param date_str
 * @returns {Date}
 */
function to_date(date_str) {
    let yyyyMMdd = String(date_str);
    let sYear = yyyyMMdd.substring(0,4);
    let sMonth = yyyyMMdd.substring(4,6);
    let sDate = yyyyMMdd.substring(6,8);

    return new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
}

/**
 * yyyy-MM-dd 날짜 문자열을 Date형으로 반환
 * @param date_str
 * @returns {Date}
 */
function to_date2(date_str) {
    var yyyyMMdd = String(date_str);
    var sYear = yyyyMMdd.substring(0,4);
    var sMonth = yyyyMMdd.substring(5,7);
    var sDate = yyyyMMdd.substring(8,10);

    return new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
}

function get_date_week(date) {
    return Constant.WEEKEND[date.getDay()];
}

/**
 * yyyyMMdd 날짜문자열을 gubun으로 포맷을 변경
 * @param date_str
 * @param gubun
 * @returns {string}
 */
function to_date_format(date_str, gubun) {
    let yyyyMMdd = String(date_str);
    let sYear = yyyyMMdd.substring(0,4);
    let sMonth = yyyyMMdd.substring(4,6);
    let sDate = yyyyMMdd.substring(6,8);

    return sYear + gubun + sMonth + gubun + sDate;
}

/**
 * Date형을 yyyyMMdd형의 문자열로 변환
 * @param date
 * @returns {*}
 */
function get_date_str(date) {
    let sYear = date.getFullYear();
    let sMonth = date.getMonth() + 1;
    let sDate = date.getDate();

    sMonth = sMonth > 9 ? sMonth : "0" + sMonth;
    sDate  = sDate > 9 ? sDate : "0" + sDate;
    return sYear + sMonth + sDate;
}

/**
 * Date형을 구분자로 구분된 형식의 날짜 문자열 변환
 * @param date
 * @param gubun
 * @returns {*}
 */
function get_date_str_gubun(date, gubun) {
    var sYear = date.getFullYear();
    var sMonth = date.getMonth() + 1;
    var sDate = date.getDate();

    sMonth = sMonth > 9 ? sMonth : "0" + sMonth;
    sDate  = sDate > 9 ? sDate : "0" + sDate;
    return sYear + gubun + sMonth + gubun + sDate;
}

/**
 * 00:00 ~ 00:00 세팅
 * @param date
 * @returns {string}
 */
function set_time_a_to_b (date) {
    let hours1 = date.getHours();
    date.setHours(date.getHours()+1);
    let hours2 = date.getHours();

    if (date.getMinutes() > 30) {
        return number_pad(hours1, 2) + ":30 ~ " + number_pad(hours2, 2) + ":00";
    }
    return number_pad(hours1, 2) + ":00 ~ " + number_pad(hours1, 2) + ":30";
}

/**
 * 시간 연산
 * @param hour
 * @param num
 * @returns {string}
 */
function add_hour(hour, num) {
    if (Number(hour)+num>24) {
        return number_pad(num-1, 2);
    } else if (Number(hour)+num===24) {
        return '00';
    }
    return number_pad(Number(hour) + num, 2);
}

/**
 * 숫자 앞에 0 붙이기
 * @param n
 * @param width
 * @returns {string|string}
 */
function number_pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

/**
 * 금일 기준 14일 날짜 가져오기
 * @returns {Date[]}
 */
function get_current_two_week() {
    const ratio = 86400000;
    let today = new Date();
    const result = [today.toISOString().slice(0, 10)];
    for (let i=1; i<14; i++) {
        today.setTime(today.getTime() + ratio);
        result.push(today.toISOString().slice(0, 10));
    }
    return result;
}

function isChromeBrowser(userAgent) {
    if (userAgent && userAgent.toLowerCase().indexOf('chrome') > -1) {
        return true;
    }
    return false;
}

function getChromeBrowserDetailVersion() {
    let version = null;
    let userAgent = navigator.userAgent;
    if (isChromeBrowser(userAgent)) {
        let matches = userAgent.toLowerCase().match(/chrome\/([\d.]+)/);
        if (matches) {
            version = matches[1];
        }
    }
    return version;
}

function getChromeBrowserBriefVersion() {
    let detailVersion = getChromeBrowserDetailVersion();
    let version = null;
    if (detailVersion) {
        let matches = detailVersion.toLowerCase().match(/(\d+)/);
        if (matches) {
            version = matches[1];
        }
    }
    return version;
}

function setChromeBrowserVersionUpgradeGuide() {
    let chromeVersion = getChromeBrowserBriefVersion();
    if (chromeVersion && chromeVersion <= 60) {
        if (!$('div').hasClass('chromeVersion')) {
            const filePath = "/DP/apk/chrome_95.0.4638.74-463807411_(x86).apk";
            const msg = " <U>상위 버전 다운로드</U>";
            $('.login_wrap').after(
                $('<div>').addClass('chromeVersion').css({
                    'width': '100%',
                    'bottom': '0',
                    'height': '10%',
                    'position': 'absolute',
                    'background-color': 'lightgray',
                    'text-align': 'center',
                    'justify-content': 'center',
                    'align-items': 'center',
                    'display': 'flex',
                    'text-border' : 'solid',
                    'font-size' : '24px',
                    'font-weight' : 'bold'
                }).html('Chrome ' + getChromeBrowserDetailVersion() + '&nbsp; : &nbsp;<a style=color:blue; href=\''+ filePath +'\' download>' + msg + '</a>')
            );
        }
    }
}