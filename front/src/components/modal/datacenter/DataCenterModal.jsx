import { useState, useEffect, useMemo, useRef } from "react";
import { useValidationToast }           from "@/hooks/useSimpleToast";
import useGlobal                        from "@/hooks/useGlobal";
import BaseModal                        from "@/components/modal/BaseModal";
import LabelInput                       from "@/components/label/LabelInput";
import LabelSelectOptions               from "@/components/label/LabelSelectOptions";
import { 
  handleInputChange
} from "@/components/label/HandleInput";
import ToggleSwitchButton               from "@/components/button/ToggleSwitchButton";
import {
  useAddDataCenter,
  useEditDataCenter,
  useDataCenter,
  useAllClusterLevels,
  useAllQuotaEnforcementTypes,
} from "@/api/RQHook";
import {
  checkKoreanName, checkName 
} from "@/util";
import Localization                     from "@/utils/Localization";
import Logger                           from "@/utils/Logger";
import "./MDatacenter.css";

const initialFormState = {
  id: "",
  name: "",
  comment: "",
  description: "",
  storageType: false, // 공유됨이 false
  version: "4.7",
  quotaMode: "DISABLED",
};

/**
 * @name DataCenterModal
 * @description ...
 *
 * @param {boolean} isOpen ...
 * @returns
 */
const DataCenterModal = ({ 
  isOpen,
  onClose,
  editMode=false
}) => {
  const { validationToast } = useValidationToast();
  // const { closeModal } = useUIState()
  const dcLabel = editMode 
    ? Localization.kr.UPDATE
    : Localization.kr.CREATE;
  
  const { datacentersSelected } = useGlobal()
  const datacenterId = useMemo(() => 
    [...datacentersSelected][0]?.id
  , [datacentersSelected])

  const [formState, setFormState] = useState(initialFormState);
  const { mutate: addDataCenter } = useAddDataCenter(onClose, onClose);
  const { mutate: editDataCenter } = useEditDataCenter(onClose, onClose);
  const {
    data: datacenter,
    isSuccess: isDataCenterSuccess,
  } = useDataCenter(datacenterId);
  const { 
    data: clusterLevels = [],
  } = useAllClusterLevels("id", (e) => e);
  // 지정된 데이터센터의 버전보다 높은것만 출력되도록
  const {
    data: quotaEnforcementTypes=[],
    isLoading: isQuotaEnforcementTypesLoading
  } = useAllQuotaEnforcementTypes((e) => ({ 
     ...e,
     value: e?.id,
     label: e?.kr
  }))
  /*
  const quotaModes = [
    { value: "DISABLED", label: `${Localization.kr.DEACTIVATE}` },
    { value: "AUDIT", label: "감사" },
    { value: "ENABLED", label: `${Localization.kr.ACTIVATE}` },
  ];
  */

  const initialVersionRef = useRef(null);
  const minVersion = editMode && initialVersionRef.current ? initialVersionRef.current : null;
  const filteredClusterLevels = minVersion
    ? [...clusterLevels].filter(ver => versionCompare(ver, minVersion) >= 0)
    : [...clusterLevels];

  const clusterLevelsTransformed = filteredClusterLevels.map((e) => ({
    value: e,
    label: e,
  }));

  /*
  const { 
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: (editMode && isDataCenterSuccess) ?  datacenter?.id : "",
      name: (editMode && isDataCenterSuccess) ? datacenter?.name : "",
      comment: (editMode && isDataCenterSuccess) ? datacenter?.comment : "",
      description: (editMode && isDataCenterSuccess) ? datacenter?.description : "",
      storageType: (editMode && isDataCenterSuccess) ? Boolean(datacenter?.storageType) : false, // 공유됨이 false
      version: (editMode && isDataCenterSuccess) ? datacenter?.version : "4.7",
      quotaMode: (editMode && isDataCenterSuccess) ? datacenter?.quotaMode : "DISABLED",
    }
  })
  */
  // 모달 열릴때 초기화, 편집 정보넣기
  useEffect(() => {
    if (editMode && datacenter?.version && !initialVersionRef.current) {
      initialVersionRef.current = datacenter.version; // 최초 진입 시 한 번만 세팅
    }
    if (!isOpen) {
      return setFormState(initialFormState);
    }
    if (editMode && datacenter) {
      setFormState({
        id: datacenter.id,
        name: datacenter.name,
        comment: datacenter.comment,
        description: datacenter.description,
        storageType: Boolean(datacenter.storageType),
        version: datacenter.version,
        quotaMode: datacenter.quotaMode,
      });
    }
  }, [isOpen, editMode, datacenter]);
  
  // 값 검증
  const validateForm = () => {
    Logger.debug(`DataCenterModal > validateForm ... `)
    const nameError = checkName(formState.name);
    if (nameError) return nameError;
    if (checkKoreanName(formState.description)) return `${Localization.kr.DESCRIPTION}은 영어만 입력가능합니다.`;
    if (formState.quotaMode==="none") return `쿼터 모드를 선택해주세요.`
    if (formState.version==="none") return `버전을 선택해주세요.`
    return null;
  };

  // 제출
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      validationToast.fail(error);
      return;
    }
    const [versionMajor, versionMinor] = formState.version.split(".");

    const dataToSubmit = { 
      ...formState,
      versionMajor: versionMajor,
      versionMinor: versionMinor
     };
    Logger.debug(`DataCenterModal > handleFormSubmit ... dataToSubmit: `, dataToSubmit)
    editMode
      ? editDataCenter({ dataCenterId: formState.id, dataCenterData: dataToSubmit })
      : addDataCenter(dataToSubmit);
  };

  return (
    <BaseModal targetName={Localization.kr.DATA_CENTER} submitTitle={dcLabel}
      isOpen={isOpen} onClose={onClose}
      onSubmit={handleFormSubmit}
      contentStyle={{ width: "473px" }} 
    >
      <LabelInput id="name" label={Localization.kr.NAME}
        autoFocus required
        value={formState.name}
        onChange={handleInputChange(setFormState, "name", validationToast)}
        // register={register} target={"name"} options={{ required: true, maxLength: 30 }}
      />
      <LabelInput id="description" label={Localization.kr.DESCRIPTION}
        value={formState.description}
        onChange={handleInputChange(setFormState, "description", validationToast)}
        // register={register} target={"description"} options={{ required: true, maxLength: 30 }}
      />
      <LabelInput id="comment" label={Localization.kr.COMMENT}
        value={formState.comment}
        onChange={handleInputChange(setFormState, "comment", validationToast)}
        // register={register} target={"comment"} options={{ required: true, maxLength: 30 }}
      />
      <ToggleSwitchButton id="storage-type" label="스토리지 타입"
        required
        checked={formState.storageType}
        onChange={() => setFormState((prev) => ({ 
          ...prev,
          storageType: !formState.storageType
        }))}
        tType="로컬" fType="공유됨"
      />
      <LabelSelectOptions id="quota-mode" label="쿼터 모드"
        value={formState.quotaMode}
        options={quotaEnforcementTypes}
        loading={isQuotaEnforcementTypesLoading}
        onChange={handleInputChange(setFormState, "quotaMode", validationToast)}
        
      />
      <LabelSelectOptions id="version-compatible" label="호환버전"
        value={formState.version}
        onChange={handleInputChange(setFormState, "version", validationToast)}
        options={clusterLevelsTransformed}
      />
    </BaseModal>
  );
};

export default DataCenterModal;

// 버전 비교 함수
function versionCompare(a, b) {
  const [aMaj, aMin] = a.split('.').map(Number);
  const [bMaj, bMin] = b.split('.').map(Number);
  if (aMaj !== bMaj) return aMaj - bMaj;
  return aMin - bMin;
}