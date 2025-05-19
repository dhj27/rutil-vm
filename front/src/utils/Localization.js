import Logger from "./Logger";

export const Localization = {
  kr: {
    NAME: "이름",
    DESCRIPTION: "설명",
    COMMENT: "코멘트",
    STATUS: "상태",
    DETAILS: "세부 정보",
    ALIAS: "별칭",
    STATELESS: "상태 비저장",
    ROLE: "역할",
    NOT_ASSOCIATED: "N/A",
    UNATTACHED: "붙어있지 않음",
    UNKNOWN: "알 수 없음",
    AVAILABLE: "사용 가능",
    UP_TIME: "업타임",

    DATA_CENTER: "데이터센터",
    CLUSTER: "클러스터",
    HOST: "호스트",
    HOST_DEVICE: "호스트 장치",
    ENGINE: "엔진",
    VM: "가상머신",
    TEMPLATE: "템플릿",
    SNAPSHOT: "스냅샷",
    NETWORK: "네트워크",
    NETWORK_FILTER: `네트워크 필터`,
    NICS: `네트워크 인터페이스`,
    VNIC: "vNIC",
    VNIC_PROFILE: "vNIC 프로파일",
    STORAGE: "스토리지",
    DOMAIN: "스토리지 도메인",
    DISK: "디스크",
    DISK_PROFILE: "디스크 프로파일",
    EVENT: "이벤트",
    CONSOLE: "콘솔",
    UP: "실행 중",
    DOWN: "중지",
    HA: "고가용성",
    SPARSE: "할당 정책",
    SIZE_AVAILABLE: "여유 공간",
    SIZE_USED: "사용된 공간",
    SIZE_TOTAL: "총 공간",
    SIZE_VIRTUAL: "가상 크기",
    SIZE_ACTUAL: "실제 크기",
    IP_ADDRESS: "IP 주소",
    CONNECTION: "연결",
    ATTACH: "연결",
    DETACH: "분리",
    SPEED: "속도 (Mbps)",
    SPEED_RX: "Rx 속도 (Mbps)",
    SPEED_TX: "Tx 속도 (Mbps)",
    TOTAL_BYTE_RX: "총 Rx (byte)",
    TOTAL_BYTE_TX: "총 Rx (byte)",
    IS_SHARABLE: "공유가능",
    IS_BOOTABLE: "부팅가능",
    IS_READ_ONLY: "읽기전용",
    IS_IN_USE: "현재 사용중",
    WIPE_AFTER_DELETE: "삭제 후 초기화",
    PREVIEW: "미리보기",
    COMMIT: "커밋",
    UNDO: "되돌리기",
    STARTED: "시작됨",
    FINISHED: "완료",
    APPLICATION: "애플리케이션",
    CPU: "CPU",
    MEMORY: "메모리",
    HARDWARE: "하드웨어",
    SOFTWARE: "소프트웨어",

    GENERAL: "일반",
    MANAGEMENT: "관리",
    TARGET: "대상",
    SYSTEM: "시스템",
    USER: "사용자",
    USER_ID: "사용자ID",
    USER_SESSION: "사용자세션",
    LOGIN: "로그인",
    LOGOUT: "로그아웃",
    PRINT: "출력",
    JOB: "작업",
    COMPUTING: "컴퓨팅",
    TIME: "시간",
    TIMESTAMP: "총 소요 시간",
    TIMEZONE: "시간대",
    DATE: "날짜",
    DATE_CREATED: "생성일자",
    HOUR: "시간",
    MINUTE: "분",
    SECOND: "초",
    SEARCH: "검색",
    CREATE: "생성",
    UPDATE: "편집",
    UPLOAD: "업로드",
    REMOVE: "삭제",
    DESTROY: "파괴",
    START: "시작",
    RESTART: "재시작",
    REFRESH: "새로고침",
    REFRESH_CAPABILITIES: "기능을 새로고침",
    END: "종료",
    POWER_OFF: "전원끔",
    PAUSE: "일시중지",
    REBOOT: "재부팅",
    RESET: "재설정",
    ACTIVATE: "활성화",
    DEACTIVATE: "비활성화",
    MAINTENANCE: "유지보수",
    MOVE: "이동",
    COPY: "복사",
    IMPORT: "가져오기",
    EXPORT: "내보내기",
    MIGRATION: "마이그레이션",
    OK: "확인",
    CANCEL: "취소",
    LOADING: "로딩",
    IN_PROGRESS: "중 ...",
    YES: "예",
    NO: "아니오",

    PLACEHOLDER: "임력하세요.",
    PLACEHOLDER_SEARCH: "검색어를 입력하세요.",
    PLACEHOLDER_USERNAME: "사용자명",
    PLACEHOLDER_PASSWORD: "암호",
    NO_INFO: "🤷‍♂️ 내용이 없습니다",

    renderTime(milliseconds) {
      Logger.debug(`Localization > renderTime ... milliseconds: ${milliseconds}`)
      const hours = Math.floor(milliseconds / 3600000);
      const minutes = Math.floor((milliseconds % 3600000) / 60000);
      const seconds = Math.ceil((milliseconds % 60000) / 1000);
    
      let result = "";
    
      if (hours > 0) result += `${hours}시간 `;
      if (minutes > 0) result += `${minutes}분 `;
      if (seconds > 0 || hours > 0 || minutes > 0) result += `${seconds}초`;
    
      return result.trim();
    },

    renderStatus(status = "") {
      const _status = status?.toUpperCase() ?? "";
      if (_status === "OK")                 return "양호";
      if (_status === "UP" || _status === "UNASSIGNED")  return "실행 중";
      else if (_status === "ACTIVE")        return "활성화";
      else if (_status === "ACTIVATING")    return "활성화 중";
      else if (_status === "INSTALLING")    return "설치 중";
      else if (_status === "DOWN")          return "중지";
      else if (_status === "INACTIVE")      return "비활성화";
      else if (_status === "UNINITIALIZED") return "초기화되지 않음";
      else if (_status === "NEXT_RUN")      return "다음 실행 시 변경내용 적용";
      else if (_status === "REBOOT")        return "재부팅 중";
      else if (_status === "REBOOT_IN_PROGRESS")  return "재부팅/재설정 중";
      else if (_status === "SUSPENDED" || _status === "PAUSED")   return "일시중지";
      else if (_status === "SAVING_STATE")  return "일시중지 중";
      else if (_status === "MAINTENANCE") return "유지보수";
      else if (_status === "PREPARING_FOR_MAINTENANCE") return "유지 관리 모드 준비 중";
      else if (_status === "WAIT_FOR_LAUNCH") return "전원을 켜는 중";
      else if (_status === "POWERING_UP") return "전원을 켜는 중";
      else if (_status === "POWERING_DOWN") return "전원을 끄는 중";
      else if (_status === "OPERATIONAL") return "가동 중";
      else if (_status === "NON_OPERATIONAL") return "비 가동 중";
      else if (_status === "NON_RESPONSIVE") return "응답하지 않음";
      else if (_status === "UNATTACHED")  return "연결 해제";
      else if (_status === "DETACHING")  return "분리 중";
      else if (_status === "RESTORING_STATE")  return "복구 중";
      else if (_status === "MIGRATING")  return "마이그레이션 중";
      else if (_status === "LOCKED")  return "잠김";
      else if (_status === "IMAGE_LOCKED") return "이미지 잠김";
      // else if (_status === "NEXTRUN")  return "??";
      else if (_status === "STARTED")  return "시작됨";
      else if (_status === "FAILED")  return "실패";
      else if (_status === "FINISHED")  return "완료";
      else if (_status === "UNKNOWN")  return "알 수 없음";
      else if (_status === "IN_PREVIEW")  return "미리보기";
      return _status;
    },

    renderSeverity(severity="NORMAL") {
      const _severity = severity?.toUpperCase() ?? "";
      if (_severity === "ALERT")            return "알림";
      else if (_severity === "ERROR")       return "실패";
      else if (_severity === "WARNING")     return "경고";
      else if (_severity === "NORMAL")      return "양호";//"정상"
      return _severity;
    },
  }
}

export default Localization;