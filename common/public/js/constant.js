const Constant = {
    PARTNER_POSITION_LABEL_LIST: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'
    ],

    WEEKEND: ['일', '월', '화', '수', '목', '금', '토'],

    CORE: 10,
    DT: 20,
    RESERVE: 30,
    ETC: 90,

    ATRBT_GROUP_CODE_CAFE: 10,  // CAFÉ매장
    ATRBT_GROUP_CODE_DT: 20,  // DT매장
    ATRBT_GROUP_CODE_R: 30,  // R매장
    ATRBT_GROUP_CODE_DTR: 40,  // DTR매장

    MINIMUM_PARTNERS_COUNT: 2,  // 최소 근무 인원
    MAXIMUM_PARTNERS_COUNT: 15, // 최대 근무 인원

    DEFAULT_BATCH_CODE: 'default',  // 디폴트 배치 코드
    FIRST_BATCH_CODE: 'first',  // 1차 배치 코드
    SECOND_BATCH_CODE: 'second',    // 2차 배치 코드

    MINUTE_CHECK: 20,   // 잔여시간 체크 (20분)
    BUSINESS_HOURS: 30, // LST 필요시간에서 계산에 필요한 시간 30분

    CS_POSITION_CODE: 'P040',   // CS 포지션 코드
    SUPPORT_POSITION_CODE: 'P100',  // 서포트 포지션 코드
    SUPPORT_POSITION_LST_NEED_TIME: 0,

    PARTNER_WHITE_ICON_URI: '/common/front/images/ic_man_w.png',    // 파트너 지원 아이콘
    PARTNER_GREEN_ICON_URI: '/common/front/images/ic_man_g.png',    // 파트너 고정 아이콘
    PARTNER_ICON_FONT_SIZE: 50, // 파트너 아이콘 폰트 기본 크기
    PARTNER_ICON_FONT_COLOR_1: 'black', // 파트너 아이콘 폰트 색상
    PARTNER_ICON_FONT_COLOR_2: 'white', // 파트너 아이콘 폰트 색상
    PARTNER_ICON_RATIO_FONT_ALPHABET: 1.1,   // 파트너 아이콘 포지션 알파뱃 폰트 크기
    PARTNER_ICON_RATIO_FONT: 0.5,   // 파트너 아이콘 포지션명 폰트 비율
    PARTNER_ICON_RATIO: 0.8,    // 파트너 아이콘 사이즈 조절 비율

    // ADMIN - 매장 DP 설정
    POSITION_DELETE_ICON_URI: '/common/admin/images/btn_pointer_del.png',    // 포시션 박스 삭제 아이콘 경로
    POSITION_AREA_CALC_RATIO_WIDTH: 0.05,    // 포지션 박스 가로 비율
    POSITION_AREA_CALC_RATIO_HEIGHT: 0.08,    // 포지션 박스 세로 비율
    POSITION_AREA_CALC_RATIO_RX: 0.008,    // 포지션 박스 라운드 비율
    POSITION_AREA_CALC_RATIO_FONT: 0.009,    // 포지션 박스 폰트 비율
    POSITION_AREA_FONT_COLOR: 'black',    // 포지션 박스 색상
    CANVAS_WHITE_SPACE: 15 // 캔버스 공백
}
