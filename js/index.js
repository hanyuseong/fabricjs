let CANVAS; // Fabric js 캔버스
let TIMEDATA;   // 시간정보
let LAYOUT_NATURAL_WIDTH;   // 레이아웃 이미지 원본 가로 사이즈
let LAYOUT_NATURAL_HEIGHT;  // 레이아웃 이미지 원본 세로 사이즈
let STORE_ATRBT_GROUP_CODE = $('#storeCode').data('storecode'); // 매장 속성 그룹 코드
let STORE_LYT_TYPE_CODE = $('#storeCode').data('storelyttypecode');    // 매장레이아웃유형코드
let STORE_LYT_TYPE_DVSN_CODE;   // 매장레이아웃유형구분코드
let CURRENT_DATE = get_date_str_gubun(new Date(), '');   // 현재 날짜 저장

let STORE_LIST = []; // 매장 리스트 정보
let ROUTINES;   // 루틴 정보
let LST_NEED_TIME;  // LST 필요시간 조회
let DEFAULT_PARTNERS;   // 근무 인원별 디폴트 파트너 정보
let LOCATION_LIST;  // 파트너 배치 위치 정보

let COMPLETED_BATCH_COUNT = 0;  // 파트너 배치 완료 카운트

$(function() {
    setWorkDate();
    setWorkPerson();
    setCurrentTime();

    let timer = null;
    window.addEventListener('resize',function(event){
        clearTimeout(timer);
        timer = setTimeout(function() {
            resizeCanvas(event);
        }, 400);
    });

    // 근무일자 선택시 버튼 비활성화 해제 이벤트
    $(document).on('click', '#workDateList li', function() {
        $('#workDayBtn').removeClass('disabled');
    });

    // 근무일자 확인 버튼 클릭 이벤트
    $(document).on('click', '#workDayBtn', function() {
        if (!$(this).hasClass('disabled')) {
            $('#workDate').text($('#workDateList li.on a').text()).data('workdate', $('#workDateList li.on').data('workdate'));

            $('.up_lypop_container .btn_close').click();
            $(this).addClass('disabled');

            setCurrentTime();
            setWorkTime();
        }
    });

    $(document).on('click', '#workTimeList li .time', function() {
        $('#workTimeBtn').addClass('disabled');
        $('#workTimeList li .min').removeClass('on');
    });

    // 근무시간 선택시 버튼 비활성화 해제 이벤트
    $(document).on('click', '#workTimeList li .min', function() {
        $('#workTimeBtn').removeClass('disabled');
    });

    // 근무시간 확인 버튼 클릭 이벤트
    $(document).on('click', '#workTimeBtn', function() {
        if (!$(this).hasClass('disabled')) {
            $('#workTime').data('workhour', $('#workTimeList li.on .time').data('hour'));
            $('#workTime').data('workmin', $('#workTimeList li.on .min.on').data('min'));
            setWicPrcnt();
            $('.up_lypop_container .btn_close').click();
            $(this).addClass('disabled');
        }
    });

    // 근무인원 선택시 버튼 비활성화 해제 이벤트
    $(document).on('click', '#workPersonList li', function() {
        $('#workPersonBtn').removeClass('disabled');
    });

    // 근무인원 확인 버튼 클릭 이벤트
    $(document).on('click', '#workPersonBtn', function() {
        if (!$(this).hasClass('disabled')) {
            const workPerson = $('#workPersonList li.on').data('workperson');
            $('#workPerson').data('workperson', workPerson).text(String(workPerson).concat('명'));
            $('.up_lypop_container .btn_close').click();
            $(this).addClass('disabled');
        }
    });

    // 조회 버튼 클릭 이벤트
    $(document).on('click', '#search', function() {
        positionCalculation().then(r => {});
    });
    
    // 현재 시점 클릭 이벤트
    $(document).on('click', '#current', function() {
        setCurrentTime();
        const today = get_date_str_gubun(new Date(), '');
        $('#workDate').text($('[data-workdate="'+today+'"]').text()).data('workdate', today);
        let hour = $('#workTime').data('workhour');
        let minute = $('#workTime').data('workmin');
        if (TIMEDATA) {
            let timeData = TIMEDATA.find(time => time.aplctDate === today && time.tmznCode === hour && time.mntCode === minute)
            if (timeData) {
                $('#workPerson').data('workperson', timeData.wicPrcnt).text(String(timeData.wicPrcnt).concat('명'));
            } else {
                $('#workPerson').data('workperson', '').text('');
            }
        }
        positionCalculation().then(r => {});
    });

    // 매장 검색 팝업 이벤트
    $(document).on('click', '.adm_wrap, #storeSearchBtn', function() {
        getStoreList().then(r => {
            $( "#lb_shop_search" ).autocomplete({
                source: STORE_LIST,
                response: function(event, ui) {
                    if (!$('.ly_shop_select .btn_wrap a').hasClass('disabled')) {
                        $('.ly_shop_select .btn_wrap a').addClass('disabled');
                    }

                    $('.ly_shop_search .scroll_wrap').empty();
                    $('.ly_shop_search .scroll_wrap').append($('<ul>').addClass('comm_list_sty1 has_on'));
                    ui.content.forEach((item) => {
                        $('.ly_shop_search .scroll_wrap ul')
                            .append($('<li>')
                                .data('storecode', item.storeCode)
                                .data('storeatrbtgroupcode', item.storeAtrbtGroupCode)
                                .data('storelyttypecode', item.storeLytTypeCode)
                                .append($('<a>').attr('href', 'javascript:;').text(item.value)));
                    })
                },
                focus: function(event, ui){
                    return false;
                    event.preventDefault();
                },
                matchContains: true
            });

            $('.ui-widget-content').appendTo(".search_condition.ly_shop_search .scroll_wrap");
        });

    });

    // 매장 선택시 버튼 disable 해제
    $(document).on('click', '.comm_list_sty1.has_on a', function() {
        $('.ly_shop_search .btn_wrap a').removeClass('disabled');
        $('.ly_shop_select .btn_wrap a').removeClass('disabled');
    });

    // 매장 선택 이벤트
    $(document).on('click', '.ly_shop_search .btn_wrap a, .ly_shop_select .btn_wrap a', function() {
        if (!$(this).hasClass('disabled')) {
            STORE_ATRBT_GROUP_CODE = $('.comm_list_sty1.has_on .on').data('storeatrbtgroupcode');
            STORE_LYT_TYPE_CODE = $('.comm_list_sty1.has_on .on').data('storelyttypecode');
            const storeCode = $('.comm_list_sty1.has_on .on').data('storecode');
            const storeName = $('.comm_list_sty1.has_on .on').text();

            $('#storeCode').text(storeCode);
            $('#storeCode').data('storecode', storeCode);
            $('#storeName').text(storeName);

            setWorkDate();
            setWicPrcnt();
            $('.up_lypop_container .btn_close').click();
            $(this).addClass('disabled');
        }
    });

    call.asyncRefresh(function() {
        if (CURRENT_DATE !== get_date_str_gubun(new Date(), '')) {
            call.refresh();
        } else {
            setCurrentTime();
            setWicPrcnt();
            positionCalculation().then(r => {});
        }
    });
});

/** 상단 매장명, 근무일자, 근무시간, 근무인원, 루틴 데이터 조회 및 가공 START **/

// 근무 일자 세팅
function setWorkDate(drawCanvasYn) {
    const twoWeek = get_current_two_week();
    const today = get_date_str_gubun(new Date(), '');
    const isClosed = ' [휴점]';
    let todayIsClosed = true;

    $('#workDateList').empty(); // 초기화

    twoWeek.forEach(date => {
        let dataStr = get_date_str_gubun(to_date2(date), '');
        let dataTxt = String(date).concat(' (').concat(get_date_week(to_date2(date))).concat(')');

        // 당일 출력
        if (dataStr === today) {
            $('#workDate').text(dataTxt).data('workdate', dataStr);
        }

        $('#workDateList').append('<li data-workdate=\'' + dataStr +'\' class=\'disabled\'><a href="#">'+ dataTxt + isClosed + '</a></li>');
    });

    let url = "/getTimeList";
    const data = {
        storeCode: $('#storeCode').text(),
    }
    call.api({
        url: url,
        type: 'POST',
        data: data,
        // contentType: "application/json; charset-utf-8",
        dataType: 'json',
        callback: function(type, result) {
            if(type === 'success') {
                const data = TIMEDATA = result;
                let wicPrcnt = 0;

                // 근무일자 세팅
                if (data) {
                    data.filter(
                        (arr, index, callback) => index === callback.findIndex(x => x.aplctDate === arr.aplctDate)
                    ).forEach(y => {
                        let aplctDate = y.aplctDate;
                        let date = to_date_format(aplctDate, '-').concat(" (").concat(get_date_week(to_date(aplctDate))).concat(")");

                        if ($('#workDate').data('workdate') === aplctDate) {    // 근무일자 조회 데이터중 금일 날짜가 존재할 경우 휴점여부 false
                            todayIsClosed = false;
                            wicPrcnt = y.wicPrcnt;
                        }

                        if ($('#workDateList').find("[data-workdate='" + aplctDate + "']").length > 0) {
                            let el = $('#workDateList').find("[data-workdate='" + aplctDate + "']");
                            el.removeClass('disabled');
                            let dateStr = el.find('a').text();
                            el.find('a').text(dateStr.replace(isClosed, ''));
                            // el.find('a').text(el.find('a').text().replaceAll(isClosed,''));
                        }
                    });

                    if (todayIsClosed) { // 금일 휴일일 경우 휴점 여부 추가
                        $('#workDate').append(isClosed);
                    }

                    setWorkTime();
                }
                if (drawCanvasYn !== 'N') {
                    fabricInit('Y');
                }
            }
        }
    });
}
// 근무 인원수 셀렉트박스 세팅
function setWorkPerson() {
    $('#workPersonList').empty();
    // MINIMUM_PARTNERS_COUNT = 2
    // MAXIMUM_PARTNERS_COUNT = 15
    for(let i = Constant.MINIMUM_PARTNERS_COUNT; i <= Constant.MAXIMUM_PARTNERS_COUNT; i++) {
        $('#workPersonList').append($('<li>').data('workperson', i).append($('<a>').attr('href', 'javascript:;').text(String(i).concat('명'))));
    }
}

// 근무 인원수 세팅
function setWicPrcnt() {
    let hour = String($('#workTime').data('workhour'));
    let min = String($('#workTime').data('workmin'));

    if (min === '30') {
        $('#workTime').text(hour + ":30 ~ " + add_hour(hour,1) + ":00");
    } else {
        $('#workTime').text(hour + ":00 ~ " + hour + ":30");
    }
    $('#workTime').data('workhour', hour).data('workmin', min);

    let yyyymmdd = String($('#workDate').data('workdate'));
    let wicPrcnt = TIMEDATA.filter(x => x.aplctDate === yyyymmdd && x.tmznCode === hour && x.mntCode === min).map(y => y.wicPrcnt)[0];
    if (wicPrcnt && wicPrcnt > 0) {
        $('#workPerson').text(wicPrcnt + "명").data('workperson', wicPrcnt);
    } else {
        $('#workPerson').text('').data('workperson', '');
    }
}

// 현재 시간 세팅
function setCurrentTime() {
    let today = new Date();
    let date = set_time_a_to_b(new Date());
    let min = today.getMinutes()>=30?'30':'00';
    $("#workTime").text(set_time_a_to_b(new Date())).data('workhour', number_pad(today.getHours(),2)).data('workmin', number_pad(min,2));
}

// 근무 시간 세팅
function setWorkTime() {
    const yyyymmdd = String($('#workDate').data('workdate'));
    let startHour = '';
    let startMinute = '';
    let endHour = '';
    let endMinute = '';
    const officeHoursTemplate = '\
        {{if map}}\
            <li>\
                <div class="txt_wrap">\
                    <a href="#" class="txt time" data-hour="${map.hour}">${map.hour}시</a>\
                    {{if map.min0}}\
                        <a href="#" class="txt min" data-min="${map.min0}">${map.min0}분</a>\
                    {{/if}}\
                    {{if map.min1}}\
                        <a href="#" class="txt min" data-min="${map.min1}">${map.min1}분</a>\
                    {{/if}}\
                </div>\
            </li>\
        {{/if}}\
    ';

    const timeInfoTemplate = '\
        {{if map}}\
            시간대 선택 (${map.startHour}:${map.startMinute?map.startMinute:"00"} ~ Close(${map.endHour}:${map.endMinute?map.endMinute:"00"})/ 30분 단위 선택)\
        {{/if}}\
    ';

    $('#workTimeList').empty();
    let timeData = TIMEDATA.filter(
        (arr, index, callback) => index === callback.findIndex(x => yyyymmdd === x.aplctDate && x.tmznCode === arr.tmznCode)
    ).map(y => y.tmznCode);
    if (timeData) {
        timeData.forEach((z, idx) => {
            let dataMap = new HashMap();
            dataMap.put("hour", z);
            let minData = TIMEDATA.filter(a => a.tmznCode === z);
            if (minData) {
                minData.forEach((b, bIdx) => {
                    dataMap.put("min"+bIdx, b.mntCode);
                    if (idx === 0 && bIdx === 0) {
                        startMinute = b.mntCode;
                    } else if (idx === timeData.length-1 && bIdx === minData.length-1) {
                        endMinute = b.mntCode;
                    }
                });
            }
            $('#workTimeList').append($.tmpl(officeHoursTemplate, dataMap));

            if (idx === 0) {
                startHour = z;
            }
            if (idx === timeData.length-1) {
                endHour = z;
            }
        });
    }

    let timeInfoMap = new HashMap();
    timeInfoMap.put('startHour', startHour);
    timeInfoMap.put('startMinute', startMinute);
    timeInfoMap.put('endHour', endHour);
    timeInfoMap.put('endMinute', endMinute);
    $('.ly_work_time p').html($.tmpl(timeInfoTemplate, timeInfoMap));

    setWicPrcnt();
}

// MIX, 포지션별 LST 필요시간 조회
function getEssentialData() {
    return new Promise((resolve, reject) => {
        const storeCode = $('#storeCode').text();
        let workDate = $('#workDate').data('workdate');
        let workHour = $('#workTime').data('workhour');
        let workMin = $('#workTime').data('workmin');
        let workPerson = $('#workPerson').data('workperson');

        let param = {
            storeCode: storeCode,
            aplctDate: workDate,
            tmznCode: workHour,
            mntCode: workMin,
        }

        const url = "/getEssentialData";
        call.api({
            url: url,
            type: 'POST',
            data: JSON.stringify(param),
            contentType: "application/json; charset-utf-8",
            dataType: 'json',
            callback: function(type, result) {
                if(type === 'success') {
                    const data = result;
                    if (data) {
                        setChannelMix(data.channelData);
                        setProductMix(data.productData);
                        setLstNeedTime(data.lstNeedData);
                        resolve();
                    }
                } else {
                    reject();
                }
            }
        });
    });
}
function setChannelMix(data) {
    let elm = $('#channelMixTable');
    if (Number(STORE_ATRBT_GROUP_CODE) === Number(Constant.ATRBT_GROUP_CODE_DT) ||
        Number(STORE_ATRBT_GROUP_CODE) === Number(Constant.ATRBT_GROUP_CODE_DTR)) { // 20 DT, 40 DTR
        let dtChannelMixTable = '\
            <table class="table_sty1">\
                <caption>channel Mix 테이블</caption>\
                <colgroup>\
                    <col style="width:22%;">\
                    <col style="width:28%;">\
                    <col style="width:22%;">\
                    <col style="width:28%;">\
                </colgroup>\
                <thead>\
                    <tr>\
                        <th scope="row" colspan="4">Channel Mix</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <tr>\
                        <td>Café</td>\
                        <td>Café_S/O</td>\
                        <td>DT</td>\
                        <td>DT_S/O</td>\
                    </tr>\
                </tbody>\
                <tfoot>\
                    <tr>\
                        <td>\
                            {{if cafePosSalCscntRatio}} ${cafePosSalCscntRatio}% {{else}} 0% {{/if}}\
                        </td>\
                        <td>\
                            {{if cafeSrorSalCscntRatio}} ${cafeSrorSalCscntRatio}% {{else}} 0% {{/if}}\
                        </td>\
                        <td>\
                            {{if dtPosSalCscntRatio}} ${dtPosSalCscntRatio}% {{else}} 0% {{/if}}\
                        </td>\
                        <td>\
                            {{if dtSrorSalCscntRatio}} ${dtSrorSalCscntRatio}% {{else}} 0% {{/if}}\
                        </td>\
                    </tr>\
                </tfoot>\
            </table>\
        ';
        elm.parent('div').removeClass('core').addClass('dt')
        elm.html($.tmpl(dtChannelMixTable, data));
    } else {
        let coreChannelMixTable = '\
            <table class="table_sty1">\
                <caption>channel Mix 테이블</caption>\
                <colgroup>\
                    <col style="width:50%;">\
                    <col style="width:50%;">\
                </colgroup>\
                <thead>\
                    <tr>\
                        <th scope="row" colspan="2">Channel Mix</th>\
                    </tr>\
                    </thead>\
                    <tbody>\
                        <tr>\
                            <td>Café</td>\
                            <td>Café_S/O</td>\
                        </tr>\
                    </tbody>\
                    <tfoot>\
                        <tr>\
                            <td>\
                                {{if cafePosSalCscntRatio}} ${cafePosSalCscntRatio}% {{else}} 0% {{/if}}\
                            </td>\
                            <td>\
                                {{if cafeSrorSalCscntRatio}} ${cafeSrorSalCscntRatio}% {{else}} 0% {{/if}}\
                            </td>\
                        </tr>\
                    </tfoot>\
            </table>\
        ';
        elm.parent('div').removeClass('dt').addClass('core');
        elm.html($.tmpl(coreChannelMixTable, data));
    }
}
function setProductMix(data) {
    let productMixTable = '\
        <table class="table_sty1">\
            <caption>Product Mix 테이블</caption>\
            <colgroup>\
                <col style="width:20%;">\
                <col style="width:20%;">\
                <col style="width:20%;">\
                <col style="width:20%;">\
                <col>\
            </colgroup>\
            <thead>\
                <tr>\
                    <th scope="row" colspan="5">Product Item Mix</th>\
                </tr>\
            </thead>\
            <tbody>\
                <tr>\
                    <td>Espresso</td>\
                    <td>Brewed Coffee</td> \
                    <td>CBS</td> \
                    <td>Food</td> \
                    <td>Other</td> \
                </tr>\
            </tbody>\
            <tfoot>\
                <tr>\
                    <td>{{if espresso}} ${espresso}% {{else}} 0% {{/if}}</td>\
                    <td>{{if brewed}} ${brewed}% {{else}} 0% {{/if}}</td>\
                    <td>{{if cbs}} ${cbs}% {{else}} 0% {{/if}}</td>\
                    <td>{{if food}} ${food}% {{else}} 0% {{/if}}</td>\
                    <td>{{if other}} ${other}% {{else}} 0% {{/if}}</td>\
                </tr>\
            </tfoot>\
        </table>\
    ';
    $('#productMixTable').html($.tmpl(productMixTable, data));
}
function setLstNeedTime(data) {
    if (data) {
        LST_NEED_TIME = data;
        LST_NEED_TIME.forEach((item) => {
            item.afterSmtnNeedTmeMtcnt = item.smtnNeedTmeMtcnt;
        })

        let support = ROUTINES.find(rtn => rtn.dpLctnDvsnCode === Constant.SUPPORT_POSITION_CODE);
        if (support && support.useYn === 'Y') {
            LST_NEED_TIME.push({
                afterSmtnNeedTmeMtcnt: 0,
                aplctDate: $('#workDate').data('workdate'),
                dpLctnDvsnCode: Constant.SUPPORT_POSITION_CODE,
                mntCode: $('#workTime').data('workmin'),
                smtnNeedTmeMtcnt: Constant.SUPPORT_POSITION_LST_NEED_TIME,
                storeCode: $('#storeCode').data('storecode'),
                tmznCode: $('#workTime').data('workhour'),
            });
        }
    }
}

// 근무인원별 디폴트 배치 인원 정보
function getPlacement(wicPrcnt) {
    return new Promise((resolve, reject) => {
        if (!wicPrcnt) {
            wicPrcnt = $('#workPerson').data('workperson');
        }
        let url = "/getPlacement";
        const data = {
            wicDate: $('#workDate').data('workdate'),
            wicTme: $('#workTime').data('workhour') + $('#workTime').data('workmin'),
            storeCd: $('#storeCode').data('storecode'),
            storeAtrbtGroupCode: STORE_ATRBT_GROUP_CODE,
            wicPrcnt: wicPrcnt
        }
        call.api({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset-utf-8",
            dataType: 'json',
            callback: function (type, result) {
                if (type === 'success') {
                    DEFAULT_PARTNERS = result;
                    resolve();
                } else {
                    reject();
                }
            }
        });
    });
}

// 파트너 포지션별 루틴 정보 세팅
function getRoutineList(resolve) {
    let url = "/getRoutineList";
    const param = {
        storeLytTypeCode: STORE_LYT_TYPE_CODE,
    }
    call.api({
        url: url,
        type: 'POST',
        // data: JSON.stringify(param),
        data: param,
        // contentType: "application/json; charset-utf-8",
        dataType: 'json',
        callback: function(type, result) {
            if(type === 'success') {
                if (result) {
                    ROUTINES = result.filter(item => item.useYn === 'Y');
                    ROUTINES.forEach((item) => {
                       item.totalPlcmtPrcnt = 0; // 배치될때마다 카운트 수 저장을 위해 추가
                    });
                }
                resolve();
            }
        }
    });
}

async function getStoreList() {
    return new Promise((resolve, reject) => {
        const url = "/admin/getStoreList";
        call.api({
            url: url,
            type: 'POST',
            contentType: "application/json; charset-utf-8",
            dataType: 'json',
            callback: function(type, result) {
                if(type === 'success') {
                    const data = result;
                    if (data) {
                        STORE_LIST = [];
                        data.forEach((item, index) => {
                            // STORE_LIST.push(item.storeName);
                            STORE_LIST.push({
                                label: '('+item.storeCode+')'+item.storeName,
                                // label: item.storeName,
                                value: item.storeName,
                                storeCode: item.storeCode,
                                storeAtrbtGroupCode: item.storeAtrbtGroupCode,
                                storeLytTypeCode: item.storeLytTypeCode,
                            });
                            if (index === data.length-1) {
                                resolve();
                            }
                        });
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            }
        });
    });

    setTImeout(function() {
        reject();
    }, 5000);
    
}
/** 상단 매장명, 근무일자, 근무시간, 근무인원, 루틴 데이터 조회 및 가공 END **/

/** Fabric START **/
// fabric init
function fabricInit(disposeYn) {
    fabric.isTouchSupported = false;
    if (CANVAS && disposeYn === 'Y') {   // CANVAS 초기화
        CANVAS.dispose();
    }
    CANVAS = new fabric.Canvas('canvas', {
        width: $('.planimg_wrap').width(),
        height: $('.planimg_wrap').height(),
        allowTouchScrolling: true,
    });
    CANVAS.selection = false;
    CANVAS.allowTouchScrolling = true;

    let beforeScrollY=0;
    let beforePageY=0;
    CANVAS.on({ // 캔버스 터치 스크롤 이동 처리
        'touch:drag': function(event) {
            if (event.e.changedTouches) {
                if (event.e.type === 'touchstart') {
                    beforePageY = event.e.changedTouches[0].pageY;
                    beforeScrollY = $('.all_contents_mid .inner_wrap').scrollTop();
                } else {
                    $('.all_contents_mid .inner_wrap').scrollTop(beforeScrollY + (beforePageY - event.e.changedTouches[0].pageY));
                }
            }
        }
    });

    async function wait() {
        await new Promise(resolve => {
            getLayoutInfo(resolve);
        });
        await new Promise(resolve => {
            getRoutineList(resolve); // 루틴 정보
        })
    };

    wait().then(() => {
        let wrapInnerWidth = $('.planimg_wrap').innerWidth();
        let wrapInnerHeight = $('.planimg_wrap').innerHeight();
        let wrapWidth = $('.planimg_wrap').width();
        let wrapHeight = $('.planimg_wrap').height();

        let resizeWrapInnerHeight = wrapInnerWidth * LAYOUT_NATURAL_HEIGHT / LAYOUT_NATURAL_WIDTH;
        let resizeWrapHeight = wrapWidth * LAYOUT_NATURAL_HEIGHT / LAYOUT_NATURAL_WIDTH;

        $('.planimg_wrap').css("height", resizeWrapInnerHeight);
        CANVAS.setWidth(resizeWrapHeight * LAYOUT_NATURAL_WIDTH / LAYOUT_NATURAL_HEIGHT);
        CANVAS.setHeight(resizeWrapHeight);

        let layout = CANVAS.getObjects().filter(x => x.name === 'background')[0];
        layout.scaleToWidth($('.planimg_wrap').width());
        layout.scaleToHeight($('.planimg_wrap').height());
        CANVAS.centerObject(layout);
        CANVAS.renderAll();

        positionCalculation().then(r => {});
    });
}

// 매장 레이아웃 조회
function getLayoutInfo(resolve) {
    let url = "/getLayoutInfo";
    call.api({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {
            storeLytTypeCode: STORE_LYT_TYPE_CODE,
        },
        callback: function(type, result) {
            if(type === 'success') {
                let data = result;
                STORE_ATRBT_GROUP_CODE = data.storeAtrbtGroupCode;
                STORE_LYT_TYPE_DVSN_CODE = data.storeLytTypeDvsnCode;

                let imgFileName = data.imgFileName;
                let imgFileFullPath = data.imgFileFullPath;
                if (imgFileName) {
                    let url = imgFileFullPath;
                    let layout = document.createElement('img');
                    layout.src = url;

                    layout.onload = function() {
                        LAYOUT_NATURAL_WIDTH = layout.naturalWidth;
                        LAYOUT_NATURAL_HEIGHT = layout.naturalHeight;

                        fabric.Image.fromURL(url, function(oImg) {
                            oImg.set({ selectable: false, name: 'background' });

                            CANVAS.add(oImg).sendToBack(oImg).setHeight(oImg.height).centerObject(oImg);
                            CANVAS.centerObject(oImg);
                            CANVAS.renderAll();

                            resolve();
                        });
                    };
                }
            }
        }
    });
}

// 파트너 아이콘 생성
function makePartnerIcon(isFixed, name, alp, code, left, top) {
    const canvasWidth = $('.planimg_wrap').innerWidth();
    const ratio = canvasWidth / LAYOUT_NATURAL_WIDTH * Constant.PARTNER_ICON_RATIO;
    let uri = Constant.PARTNER_WHITE_ICON_URI;  // '/common/front/images/ic_man_w.png';
    let fontColor = Constant.PARTNER_ICON_FONT_COLOR_1; // 'black';
    let fontSize = Constant.PARTNER_ICON_FONT_SIZE; // 50
    if (isFixed) {
        uri = Constant.PARTNER_GREEN_ICON_URI;  // '/common/front/images/ic_man_g.png';
        fontColor = Constant.PARTNER_ICON_FONT_COLOR_2; // 'white';
    }
    let lstNeedTime = Number(LST_NEED_TIME.filter(lst => lst.dpLctnDvsnCode === code).map(x=>x.afterSmtnNeedTmeMtcnt)[0]).toFixed(2);
    let routineObj = ROUTINES.filter(rtn => rtn.dpLctnDvsnCode === code);
    let totalPlcmtPrcnt = routineObj.map(x=>x.totalPlcmtPrcnt)[0]+1;
    let fxngPlcmtMxmPrcnt = routineObj.map(x=>x.fxngPlcmtMxmPrcnt)[0];
    let totalPlcmtMxmPrcnt = routineObj.map(x=>x.totalPlcmtMxmPrcnt)[0];

    let text = new fabric.Text(alp, {
        fontWeight: 'bold',
        fontFamily: 'SoDoSans',
        fill: fontColor,
        fontSize: fontSize,
        originX: 'center',
        originY: 'bottom'
    });

    let positionCode = new fabric.Text(name, {
        fontWeight: 'bold',
        fontFamily: 'SoDoSans',
        fontSize: CANVAS.width * Constant.POSITION_AREA_CALC_RATIO_FONT,
        fill: Constant.POSITION_AREA_FONT_COLOR,
        originX: 'center',
        originY: 'top',
    });

    new fabric.Image.fromURL(uri, function(oImg){
        oImg.set({ selectable: false });
        oImg.set({
            scaleX: ratio,
            scaleY: ratio,
            originX: 'center',
			originY: 'bottom',
        });

        text.setTop(ratio*5);
        text.setFontSize(fontSize * ratio);


        let obj = new fabric.Group([oImg, text, positionCode], {
            top: CANVAS.height * top,
            // 저장된 좌표는 포지션 영역에서 포지션 지정 영역배율 0.07의 크기의 절반에서 파트너 아이콘 절반을 뺀 위치가 정중앙 위치
            // left: CANVAS.width * left + (($('.planimg_wrap').innerWidth() * Constant.POSITION_AREA_CALC_RATIO_WIDTH / 2) - (oImg.width * ratio)/2),
            left: CANVAS.width * left,
            name: code,
            selectable: false
        });

        obj.on('mousedown', function(e) {
            // e.target should be the circle
            if ($('#isAdmin').val() ==='Y') {
                if (CANVAS.getObjects().filter(x => x.name == code + name).length > 0) {
                    CANVAS.remove(...CANVAS.getObjects().filter(item => item.name.indexOf(code + name) > -1));
                } else {
                    let calcNeedTime = Number(lstNeedTime-Number(Constant.BUSINESS_HOURS)).toFixed(2);
                    let afterLstNeedTime = new fabric.Text(lstNeedTime+"("+calcNeedTime+")\r\n" +
                        "("+totalPlcmtPrcnt+"/"+fxngPlcmtMxmPrcnt+"/"+totalPlcmtMxmPrcnt+")", {
                        fontFamily: 'SoDoSans',
                        fill: Constant.PARTNER_ICON_FONT_COLOR_1,
                        name: code + name,
                        selectable: true,
                    });

                    afterLstNeedTime.setLeft(obj.left + obj.width);
                    afterLstNeedTime.setTop(obj.top);
                    afterLstNeedTime.setFontSize(fontSize * ratio * Constant.PARTNER_ICON_RATIO_FONT);
                    CANVAS.add(afterLstNeedTime);
                }
            }
        });
        CANVAS.add(obj);
        CANVAS.renderAll();
    });
}

// 루틴 테이블 생성
function makePartnerRoutineTable(alp, code, isFixed, idx, seqc) {
    const routineTemplate = '\
        <tr>\
            <th>${label}</th>\
            <td>${dpLctnDvsnName}{{if totalPlcmtMxmPrcnt && totalPlcmtMxmPrcnt != 1}}${plcmtSeqc}{{/if}}</td>\
            {{if isFixed}}\
                <td>고정</td>\
                <td class="tal_l">${fxngRtnDscrt}</td>\
            {{else}}\
                <td>지원</td>\
                <td class="tal_l">${sprtRtnDscrt}</td>\
            {{/if}}\
        </tr>\
    ';

    let data = ROUTINES.filter(info => info.dpLctnDvsnCode === code);
    if (data) {
        data[0].label = alp;
        data[0].isFixed = isFixed;
        data[0].plcmtSeqc = seqc;
        if (idx == 0 && $('#routineTable tbody').html()) {
            $('#routineTable tbody').children().remove();
        }
        $('#routineTable tbody').append($.tmpl(routineTemplate, data));
    }

}

// resize 발생할 경우
function resizeCanvas() {
    // 캔버스 삭제
    CANVAS.dispose();

    // 캔버스 다시 로드
    fabricInit();
}

// 파트너 아이콘 전체 삭제
function removeAllPartnerIcon() {
    CANVAS.remove(...CANVAS.getObjects().filter(item => item.name.indexOf('P') > -1));
    $('#routineTable tbody').empty();
}
/** Fabric END **/

/** 산출 로직 START **/
async function positionCalculation() {
    removeAllPartnerIcon();
    COMPLETED_BATCH_COUNT = 0;
    ROUTINES.filter((routine) => routine.totalPlcmtPrcnt > 0).forEach((item) => {
        item.totalPlcmtPrcnt = 0;
    })
    LST_NEED_TIME = [];  // LST 필요시간 정보 초기화
    DEFAULT_PARTNERS = [];   // 근무 인원별 디폴트 파트너 정보 초기화
    LOCATION_LIST = [];  // 파트너 배치 위치 정보 초기화

    await getEssentialData(); // MIX, 포지션별 LST 필요시간 조회
    await getPlacement(); // 근무인원별 디폴트 배치 인원 정보
    await getLocationList(); // 파트너 위치 정보

    // 디폴트 인원 배치
    defaultBatch();

    let cnt = 0; // 무한 루프를 방지하기 위한 횟수 제한 체크용
    let totalPartners = $('#workPerson').data('workperson');  // 근무 인원수
    while(totalPartners - COMPLETED_BATCH_COUNT > 0 && cnt++ < 50) {   // 배치하지 않은 근무인원이 0보다 클 경우
        let completeFxngPlcmt = true;  // 1차 배치 완료 여부
        LST_NEED_TIME.forEach((item) => {   // 잔여시간이 0보다 큰 포지션 중 1차배치 잔여인원이 있는 포지션 존재할 경우 1차 배치 진행
            let rtn = ROUTINES.filter((routine) => routine.dpLctnDvsnCode === item.dpLctnDvsnCode);
            if (item.afterSmtnNeedTmeMtcnt > 0 && (rtn.length > 0 && Number(rtn[0].fxngPlcmtMxmPrcnt) - Number(rtn[0].totalPlcmtPrcnt) > 0)) {
                completeFxngPlcmt = false;
                // 1차 배치
                loop(Constant.FIRST_BATCH_CODE);
            }
        });

        if (completeFxngPlcmt) {
            // 2차 배치
            loop(Constant.SECOND_BATCH_CODE);
        }
    }
}

// 파트너 위치 정보
function getLocationList() {
    return new Promise((resolve, reject) => {
        // 루틴정보, LST 필요시간 데이터, 디폴트 배치 인원 정보가 존재할 경우에만 포지션 정보 조회
        if (ROUTINES.length>0 && LST_NEED_TIME.length>0 && DEFAULT_PARTNERS.length>0) {
            let url = "/getLocationList";
            call.api({
                url: url,
                type: 'POST',
                data: {
                    code : STORE_LYT_TYPE_CODE
                },
                dataType: 'json',
                callback: function(type, result) {
                    if(type === 'success') {
                        LOCATION_LIST = result;
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        }
    });
}

// 디폴트 인원 배치
function defaultBatch() {
    let routinesByDvsnCode = ROUTINES.sort((a, b) => (a.plcmtPriorRank - b.plcmtPriorRank));
    routinesByDvsnCode.filter((code) =>
        DEFAULT_PARTNERS.filter((partner) => partner.dpLctnDvsnCode === code.dpLctnDvsnCode).length > 0
    ).forEach((item) => {
        let defaultPartners = DEFAULT_PARTNERS.find(partner => partner.dpLctnDvsnCode === item.dpLctnDvsnCode);
        if (defaultPartners) {
            let basicPlcmtPrcnt = defaultPartners.basicPlcmtPrcnt;  // 해당 포지션의 디폴트 배치인원 수
            for(let i=0; i<basicPlcmtPrcnt; i++) {
                if (i < Number(item.totalPlcmtMxmPrcnt)) {  // 디폴트 인원 배치는 총 최대 배치 인원수를 넘을 수 없음
                    partnerPlacement(Constant.DEFAULT_BATCH_CODE, item.dpLctnDvsnCode);
                }
            }
        }
    });
}

function loop(type) {
    let definePosition; // 제일 긴 잔여시간 포지션 저장용
    let definePositionAfterSmtnNeedTmeMtcnt = -999;
    let definePlcmtPriorRank = 999;
    const totalPartners = $('#workPerson').data('workperson');  // 총 배치 인원
    const headCount = totalPartners - COMPLETED_BATCH_COUNT;    // 총 배치 인원중 배치된 파트너 수 뺀 나머지

    // 제일 긴 잔여시간 확인
    // 1차 배치일 경우 1차총배치 최대 인원수에서 현재 배치 인원수를 뺀 나머지가 0이 아닐경우 또는
    // 2차 배치일 경우 최대총배치 인원수에서 현재 배치 인원수를 뺀 나머지가 0이 아닐경우
    ROUTINES.filter((routine) =>
        (type === Constant.FIRST_BATCH_CODE && Number(routine.fxngPlcmtMxmPrcnt) - Number(routine.totalPlcmtPrcnt) !== 0) ||
        (type === Constant.SECOND_BATCH_CODE && Number(routine.totalPlcmtMxmPrcnt) - Number(routine.totalPlcmtPrcnt) !== 0)
    ).forEach((item) => {
        // 잔여시간이 제일 긴 포지션들중 LST 필요시간 정보가 있을 경우
        let lstNeedTime = LST_NEED_TIME.find((lst) => lst.dpLctnDvsnCode === item.dpLctnDvsnCode);
        if (lstNeedTime) {
            let rank = item.plcmtPriorRank;
            let afterSmtnNeedTmeMtcnt = lstNeedTime.afterSmtnNeedTmeMtcnt;
            // 이전에 저장한 잔여시간이 제일 긴 포지션의 남은 잔여시간보다 현재 포지션의 잔여시간이 같거나 클 경우 또는
            // 이전에 저장한 잔여시간이 현재 포지션의 남은 잔여시간과 동일하며 현재 포지션이 이전에 저장한 포지션의 우선순위보다 높을 경우
            // 현재 포지션정보를 저장한다
            if (Number(definePositionAfterSmtnNeedTmeMtcnt) <= Number(afterSmtnNeedTmeMtcnt) ||
                (Number(definePositionAfterSmtnNeedTmeMtcnt) === Number(afterSmtnNeedTmeMtcnt) && Number(definePlcmtPriorRank) >= Number(rank))) {
                definePosition = lstNeedTime.dpLctnDvsnCode;
                definePositionAfterSmtnNeedTmeMtcnt = afterSmtnNeedTmeMtcnt;
                definePlcmtPriorRank = rank;
            }
        }
    });

    if (definePosition) {
        ROUTINES.filter((item) => item.dpLctnDvsnCode === definePosition).map(map => {
            if (type === Constant.FIRST_BATCH_CODE) {   // 1차 배치 로직
                if (headCount == 1) {   // 근무인원 - 1차배치인원 == 1명일 경우
                    // 디폴트 배치에 SUPPORT 포지션이 있는 경우
                    if (ROUTINES.filter((rtn) => rtn.dpLctnDvsnCode === Constant.SUPPORT_POSITION_CODE && rtn.totalPlcmtPrcnt > 0).length > 0) {
                        // 1차 배치 잔여인원이 있고 잔여시간이 제일 큰 포지션에 배치
                        partnerPlacement(type, definePosition);
                    } else { // 디폴트 배치에 SUPPORT 포지션이 없는 경우
                        // 1차 배치 잔여인원이 있고 잔여시간이 20분 이상인 포지션이 2개 이상 있는지 체크
                        if (ROUTINES.filter((rtn) => Number(rtn.fxngPlcmtMxmPrcnt) - Number(rtn.totalPlcmtPrcnt) > 0 && rtn.useYn === 'Y' &&
                                LST_NEED_TIME.filter((lst) => lst.dpLctnDvsnCode === rtn.dpLctnDvsnCode && lst.afterSmtnNeedTmeMtcnt >= Constant.MINUTE_CHECK).length > 0
                            ).length >= 2)  {
                            // SUPPORT 포지션에 배치
                            partnerPlacement(type, Constant.SUPPORT_POSITION_CODE);
                        } else {
                            // 2개 미만일 경우 잔여시간이 제일 큰 포지션에 배치
                            partnerPlacement(type, definePosition);
                        }
                    }
                } else if (headCount > 1) { // 근무인원 - 1차배치인원 > 1명일 경우
                    partnerPlacement(type, definePosition);
                }
            } else if (type === Constant.SECOND_BATCH_CODE) {   // 2차 배치 로직
                // 최대배치 잔여인원이 있는 포지션 여부 체크
                if (headCount > 0) {
                    partnerPlacement(type, definePosition);
                }
            }
        });
    }
}

function partnerPlacement(type, dpLctnDvsnCode) {
    let batchCheck = false;
    let obj = ROUTINES.filter((item) => item.dpLctnDvsnCode === dpLctnDvsnCode);
    let lstNeedTime = LST_NEED_TIME.find((item) => item.dpLctnDvsnCode === dpLctnDvsnCode);
    let locations = LOCATION_LIST.filter((item) => item.dpLctnDvsnCode === dpLctnDvsnCode);
    let alp = Constant.PARTNER_POSITION_LABEL_LIST[COMPLETED_BATCH_COUNT];
    let isFixed = false;    // 고정 여부
    if (lstNeedTime && lstNeedTime.afterSmtnNeedTmeMtcnt >= Constant.MINUTE_CHECK) {
        isFixed = true;
    }

    if (type === Constant.DEFAULT_BATCH_CODE) {   // 디폴트 배치
        if (dpLctnDvsnCode !== Constant.SUPPORT_POSITION_CODE && dpLctnDvsnCode !== Constant.CS_POSITION_CODE) {
            isFixed = true;
        } else {
            isFixed = false;
        }
        batchCheck = true;
    } else if (type === Constant.FIRST_BATCH_CODE) {
        batchCheck = true;
    } else if (type === Constant.SECOND_BATCH_CODE) {
        if (obj.length > 0 && Number(obj[0].totalPlcmtMxmPrcnt) - Number(obj[0].totalPlcmtPrcnt) > 0) {
            batchCheck = true;
        }
    }

    if (batchCheck) {
        let seqc='';
        if (obj.length > 0 && locations.length > 0) {
            let seq = obj[0].totalPlcmtPrcnt;    // 현재 배치되어있는 카운트수 로 배치되야할 위치 조회를 위한 시퀀스
            let loc = locations[seq];
            if (loc) {
                seqc = loc.plcmtSeqc;
                let name = obj[0].totalPlcmtMxmPrcnt!=1?loc.dpLctnDvsnName.concat(loc.plcmtSeqc):loc.dpLctnDvsnName;
                makePartnerIcon(isFixed, name, alp, dpLctnDvsnCode, loc.plcmtXcrdn, loc.plcmtYcrdn);
            } else {
                seqc = seq + 1;
            }
        }
        makePartnerRoutineTable(alp, dpLctnDvsnCode, isFixed, COMPLETED_BATCH_COUNT, seqc);
        obj[0].totalPlcmtPrcnt++;

        COMPLETED_BATCH_COUNT++;
        // 서포트 포지션 또는 CS 포지션이 아닌 경우에만 필요시간 계산함
        // if (dpLctnDvsnCode !== Constant.SUPPORT_POSITION_CODE && dpLctnDvsnCode !== Constant.CS_POSITION_CODE) {
            LST_NEED_TIME.filter((item) => item.dpLctnDvsnCode === dpLctnDvsnCode).map(map => {
                map.afterSmtnNeedTmeMtcnt = map.afterSmtnNeedTmeMtcnt - Constant.BUSINESS_HOURS;
            })
        // }
    }
}
/** 산출 로직 END **/