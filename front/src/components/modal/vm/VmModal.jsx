import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import BaseModal from "../BaseModal";
import {
  useFindEditVmById,  
  useAddVm,
  useEditVm,
  useAllUpClusters,
  useCDFromDataCenter,
  useHostsFromCluster,
  useAllActiveDomainsFromDataCenter,
  useAllvnicFromDataCenter,
  useOsSystemsFromCluster,
  useFindTemplatesFromDataCenter,
} from '../../../api/RQHook';
import VmCommon from './create/VmCommon';
import VmNic from './create/VmNic';
import VmDisk from './create/VmDisk';
import VmSystem from './create/VmSystem';
import VmInit from './create/VmInit';
import VmHost from './create/VmHost';
import VmHa from './create/VmHa';
import VmBoot from './create/VmBoot';
import LabelSelectOptions from '../../label/LabelSelectOptions';
import LabelSelectOptionsID from '../../label/LabelSelectOptionsID';
import { checkName } from "../../../util";
import './MVm.css';
import ModalNavButton from "../../navigation/ModalNavButton";
import Localization from "../../../utils/Localization";
import Logger from "../../../utils/Logger";

// 탭 메뉴
const tabs = [
  { id: "common", label: Localization.kr.GENERAL },
  { id: "system", label: "시스템" },
  { id: "beginning", label: "초기 실행" },
  { id: "host", label: Localization.kr.HOST },
  { id: "ha_mode", label: Localization.kr.HA },
  { id: "boot_outer", label: "부트 옵션" },
];

// 칩셋 옵션
const chipsetOptionList = [
  { value: "i440fx_sea_bios", label: "BIOS의 I440FX 칩셋" },
  { value: "q35_ovmf", label: "UEFI의 Q35 칩셋" },
  { value: "q35_sea_bios", label: "BIOS의 Q35 칩셋" },
  { value: "q35_secure_boot", label: "UEFI SecureBoot의 Q35 칩셋" },
];

// 최적화옵션
const optimizeOptionList = [
  { value: "server", label: "서버" },
  { value: "high_performance", label: "고성능" },
  { value: "desktop", label: "데스크톱" },
];


// 일반
const infoform = {
  id: "",
  name: "",
  description: "",
  comment: "",
  osSystem: "other_linux",
  osType: "q35_ovmf" || chipsetOptionList[0].value,
  optimizeOption: "server",
};

//시스템
const systemForm = {
  memorySize: 1024, // 메모리 크기
  memoryMax: 1024, // 최대 메모리
  memoryActual: 1024, // 할당할 실제메모리
  cpuTopologyCnt: 1, // 총cpu
  cpuTopologyCore: 1, // 가상 소켓 당 코어
  cpuTopologySocket: 1, // 가상소켓
  cpuTopologyThread: 1, //코어당 스레드
};

// 초기실행
const cloudForm = {
  cloudInit: false, // Cloud-lnit
  script: "", // 스크립트
};

// 호스트
const hostForm = {
  hostInCluster: true, // 클러스터 내 호스트 버튼
  hostVos: [],
  migrationMode: "migratable", // 마이그레이션 모드
  // migrationEncrypt: 'INHERIT',  // 암호화
  // migrationPolicy: 'minimal_downtime',// 마이그레이션 정책
};

// 고가용성
const haForm = {
  ha: false, // 고가용성(체크박스)
  priority: 1, // 초기값
  storageDomainVo: { id: "", name: "" },
};

// 부트옵션
const bootForm = {
  firstDevice: "hd", // 첫번째 장치
  secDevice: "", // 두번째 장치
  isCdDvdChecked: false, // cd/dvd 연결 체크박스
  connVo: { id: "", name: "" }, // iso 파일
  bootingMenu: false, // 부팅메뉴 활성화
};

const VmModal = ({ 
  isOpen, 
  editMode = false, 
  vmId, 
  onClose
}) => {
  const vLabel = editMode ? Localization.kr.UPDATE : Localization.kr.CREATE;
  const [selectedModalTab, setSelectedModalTab] = useState("common");

  const [formInfoState, setFormInfoState] = useState(infoform);
  const [formSystemState, setFormSystemState] = useState(systemForm);
  const [formCloudState, setFormCloudState] = useState(cloudForm);
  const [formHostState, setFormHostState] = useState(hostForm);
  const [formHaState, setFormHaState] = useState(haForm);
  const [formBootState, setFormBootState] = useState(bootForm);

  const [architecture, setArchitecture] = useState("");
  const [dataCenterVo, setDataCenterVo] = useState({ id: "", name: "" });
  const [clusterVo, setClusterVo] = useState({ id: "", name: "" });
  const [templateVo, setTemplateVo] = useState({ id: "", name: "" });
  const [nicListState, setNicListState] = useState([
    { id: "", name: "nic1", vnicProfileVo: { id: "" } },
  ]);
  const [diskListState, setDiskListState] = useState([]);
  
  const onSuccess = () => {
    onClose();
    toast.success(`가상머신 ${vLabel} 완료`);
  };
  const { mutate: addVM } = useAddVm(onSuccess, () => onClose());
  const { mutate: editVM } = useEditVm(onSuccess, () => onClose());

  // 가상머신 상세데이터 가져오기
  const {
    data: vm
  } = useFindEditVmById(vmId);

  // 클러스터 목록 가져오기
  const { 
    data: clusters = [], 
    isLoading: isClustersLoading 
  } = useAllUpClusters((e) => ({ ...e }));

  // 템플릿 가져오기
  const { 
    data: templates = [], 
    isLoading: isTemplatesLoading 
  } = useFindTemplatesFromDataCenter(dataCenterVo.id, (e) => ({ ...e }));

  // 클러스터가 가지고 있는 nic 목록 가져오기
  const { 
    data: nics = [], 
    isLoading: isNicsLoading 
  } = useAllvnicFromDataCenter(dataCenterVo.id, (e) => ({ ...e }));

  // 편집: 가상머신이 가지고 있는 디스크 목록 가져오기
  // const { data: disks = [], isLoading: isDisksLoading } = 
  //   useDisksFromVM(vmId, (e) => ({ ...e }));
  const { 
    data: hosts = [], 
    isLoading: isHostsLoading 
  } = useHostsFromCluster(clusterVo.id, (e) => ({ ...e }));
  const { 
    data: osList = [], 
    isLoading: isOssLoading 
  } = useOsSystemsFromCluster(clusterVo.id, (e) => ({ ...e }));
  const { 
    data: domains = [], 
    isLoading: isDomainsLoading 
  } = useAllActiveDomainsFromDataCenter(dataCenterVo.id, (e) => ({ ...e }));
  const { 
    data: isos = [], 
    isLoading: isIsoLoading 
  } = useCDFromDataCenter(dataCenterVo.id, (e) => ({ ...e }));

    
  const handleInputChange = (field) => (e) => {
    setFormInfoState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // 초기값 설정
  useEffect(() => {
    if (!isOpen) {
      setSelectedModalTab("common"); // 탭 상태 초기화
      setFormInfoState(infoform);
      setFormSystemState(systemForm);
      setFormCloudState(cloudForm);
      setFormHostState(hostForm);
      setFormHaState(haForm);
      setFormBootState(bootForm);
      setDataCenterVo({ id: "", name: "" })
      setClusterVo({ id: "", name: "" })
      setTemplateVo({ id: "", name: "" })
      setNicListState([{ id: "", name: "nic1", vnicProfileVo: { id: "" } }]);
      setDiskListState([]);
    }
    if (editMode && vm) {
      setFormInfoState({
        id: vm?.id || "",
        name: vm?.name || "",
        description: vm?.description || "",
        comment: vm?.comment || "",
        osSystem: vm?.osSystem || "",
        osType: vm?.osType || "q35_ovmf",
        optimizeOption: vm?.optimizeOption || "server"
      });
      setFormSystemState({
        memorySize: vm?.memorySize / (1024 * 1024), // 입력된 값는 mb, 보낼 단위는 byte
        memoryMax: vm?.memoryMax / (1024 * 1024),
        memoryActual: vm?.memoryActual / (1024 * 1024),
        cpuTopologyCnt: vm?.cpuTopologyCnt || 1,
        cpuTopologyCore: vm?.cpuTopologyCore || 1,
        cpuTopologySocket: vm?.cpuTopologySocket || 1,
        cpuTopologyThread: vm?.cpuTopologyThread || 1,
      });
      setFormCloudState({
        cloudInit: vm?.cloudInit || false,
        script: vm?.setScript || "",
      });
      setFormHostState({
        hostInCluster: vm?.hostInCluster || true,
        hostVos: (vm?.hostVos || [])?.map((host) => {
          return { id: host.id, name: host.name}}),
        migrationMode: vm?.migrationMode || "migratable",
      });
      setFormHaState({
        ha: vm?.ha || false,
        priority: vm?.priority || 1,
        storageDomainVo: { id: vm?.storageDomainVo?.id || "" }
      });
      setFormBootState({
        firstDevice: vm?.firstDevice || "hd",
        secDevice: vm?.secDevice || "",
        isCdDvdChecked: !vm?.connVo?.id,
        connVo: {id: vm?.connVo?.id},
        bootingMenu: vm?.bootingMenu || false, 
      });
      setArchitecture("");
      setDataCenterVo({ id: vm?.dataCenterVo?.id, name: vm?.dataCenterVo?.name })
      setClusterVo({ id: vm?.clusterVo?.id, name: vm?.clusterVo?.name })
      setTemplateVo({ id: vm?.templateVo?.id, name: vm?.templateVo?.name })
      
      setNicListState(vm.nicVos.map((nic) => ({
        id: nic?.id || "",
        name: nic?.name || "",
        vnicProfileVo: {
          id: nic?.vnicProfileVo?.id || "",
          name: nic?.vnicProfileVo?.name || "",
        },
        networkVo: {
          id: nic?.networkVo?.id || "",
          name: nic?.networkVo?.name || "",
        },
      })));

      setDiskListState(Array.isArray(vm?.diskAttachmentVos)? vm.diskAttachmentVos.map((d) => ({
        id: d?.id,
        alias: d?.diskImageVo?.alias,
        virtualSize: d?.diskImageVo?.virtualSize
          ? d.diskImageVo.virtualSize / (1024 * 1024 * 1024)
          : 0,
        interface_: d?.interface_ || "VIRTIO_SCSI",
        readOnly: d?.readOnly || false,
        bootable: d?.bootable || false,
        storageDomainVo: { id: d?.diskImageVo?.storageDomainVo?.id || "" },
        diskProfileVo: { id: d?.diskImageVo?.diskProfileVo?.id || "" },
        isExisting: true,
      })): []);
    } 
  }, [isOpen, editMode, vm]);

  // 클러스터 변경에 따른 결과
  useEffect(() => {
    if (!clusterVo.id || clusters.length === 0) {
      return;
    }
    const selectedCluster = clusters.find((c) => c.id === clusterVo.id);
    if (selectedCluster) {
      setDataCenterVo((prev) => {
        return prev.id !== selectedCluster.dataCenterVo?.id
          ? { id: selectedCluster.dataCenterVo?.id || "", name: selectedCluster.dataCenterVo?.name || "" }
          : prev;
      });

      setArchitecture(selectedCluster.cpuArc || "");

      const newOsSystem = osList.length > 0 ? osList[0].name : "other_linux";
      if (formInfoState.osSystem !== newOsSystem) {
        setFormInfoState((prev) => ({
          ...prev, osSystem: newOsSystem }));
      }
    }
  }, [clusterVo.id, clusters, osList.length]); // osList 전체가 아닌 length만 의존성에 포함
  
  Logger.debug(`VmModal.nicListState: `, nicListState);

  // 초기화 작업
  useEffect(() => {
    if (!editMode && clusters && clusters.length > 0) {
      const firstCluster = clusters[0];
      setClusterVo({id: firstCluster.id, name: firstCluster.name});
      setDataCenterVo({id: firstCluster.dataCenterVo?.id || "", name: firstCluster.dataCenterVo?.name || ""});
      setArchitecture(firstCluster.cpuArc || "");
    }
  }, [isOpen, clusters, editMode]);

  useEffect(() => {
    if (!editMode && templates && templates.length > 0) {
      setTemplateVo({id: "00000000-0000-0000-0000-000000000000"});
    }
  }, [isOpen, templates, editMode]);
  
  // 템플릿항목 숨기는 조건건
  const isTemplateHidden = editMode && templateVo.id === "00000000-0000-0000-0000-000000000000";
  
  const dataToSubmit = {
    // VmInfo
    ...formInfoState,
    clusterVo,
    templateVo,

    ...formSystemState,
    memorySize: formSystemState.memorySize * 1024 * 1024,  // mb -> byte
    memoryMax: formSystemState.memoryMax * 1024 * 1024,
    memoryActual: formSystemState.memoryActual * 1024 * 1024,
    
    // VmInit
    ...formCloudState,

    // VmHost
    ...formHostState,
    hostVos: formHostState.hostVos.map((host) => ({ id: host.id })),

    // VmHa
    ...formHaState,
    storageDomainVo: { id: formHaState.storageDomainVo.id },

    // VmBoot
    ...formBootState,

    // nic 목록
    nicVos: Array.isArray(nicListState)
    ? nicListState.map((nic) => ({
        id: nic?.id || "",
        name: nic?.name || "",
        vnicProfileVo: {
          id: nic?.vnicProfileVo && "id" in nic.vnicProfileVo
            ? nic.vnicProfileVo.id
            : null
        }
      }))
    : [],

    // 디스크 데이터 (객체 형태 배열로 변환)
    diskAttachmentVos: diskListState.map((disk) => ({
      id: disk?.id || "",
      active: true,
      bootable: disk?.bootable,
      readOnly: disk?.readOnly,
      passDiscard: false,
      interface_: disk?.interface_,
      diskImageVo: {
        id: disk?.id || "", // 기존 디스크 ID (새 디스크일 경우 빈 문자열)
        size: disk?.size * 1024 * 1024 * 1024, // GB → Bytes 변환
        alias: disk?.alias,
        description: disk?.description || "",
        storageDomainVo: { id: disk?.storageDomainVo?.id || "" },
        diskProfileVo: { id: disk?.diskProfileVo?.id || "" },
        sparse: disk?.sparse,
        wipeAfterDelete: disk?.wipeAfterDelete || false,
        sharable: disk?.sharable || false,
        backup: disk?.backup || false,
      },
    })),    
  };

  const validateForm = () => {
    checkName(formInfoState.name);// 이름 검증

    if (!clusterVo.id) return `${Localization.kr.CLUSTER}를 선택해주세요.`;
    return null;
  };

  const handleFormSubmit = () => {
    // 디스크  연결은 id값 보내기 생성은 객체로 보내기
    const error = validateForm();
    if (error) return toast.error(error);

    Logger.debug(`가상머신 데이터 ${JSON.stringify(dataToSubmit, null ,2)}`);
    editMode
      ? editVM({ 
        vmId: vmId,
        vmData: dataToSubmit
      })
      : addVM(dataToSubmit);
  };

  return (
    <BaseModal targetName={Localization.kr.VM} submitTitle={vLabel}  
      isOpen={isOpen} onClose={onClose} 
      onSubmit={handleFormSubmit}
      contentStyle={{ width: "850px", height: "730px" }}  
    >
      <div className="popup-content-outer flex">
      <ModalNavButton
        tabs={tabs}
        activeTab={selectedModalTab}
        onTabClick={setSelectedModalTab}
      />

      <div className="vm-edit-select-tab">
        <div className="edit-first-content pb-0.5">
          <LabelSelectOptionsID label={Localization.kr.CLUSTER}
            value={clusterVo.id}
            disabled={editMode}
            loading={isClustersLoading}
            options={clusters}
            onChange={(e) => {
              const selected = clusters.find(c => c.id === e.target.value);
              if (selected) setClusterVo({ id: selected.id, name: selected.name });
            }}
            etcLabel={`[${Localization.kr.DATA_CENTER}: ${dataCenterVo.name}]`}
          />
          {!isTemplateHidden && (
            <LabelSelectOptionsID
              label="템플릿"
              value={templateVo.id}
              disabled={editMode}
              loading={isTemplatesLoading}
              options={templates}
              onChange={(e) => {
                const selected = templates.find(t => t.id === e.target.value);
                if (selected) setTemplateVo({ id: selected.id, name: selected.name });
              }}
            />
          )}
          {/* TODO: options에 대한 별도 소형 컴포넌트 생성 필요 */}
          <LabelSelectOptionsID id="os_system" label="운영 시스템"            
            value={formInfoState.osSystem}
            options={osList.map((opt) => ({id: opt.name, name: opt.description}))}
            onChange={ handleInputChange("osSystem") }
          />
          <LabelSelectOptions label="칩셋/펌웨어 유형"
            value={formInfoState.osType}
            disabled={architecture === "PPC64" || architecture === "S390X"}
            options={chipsetOptionList}
            onChange={ handleInputChange("osType") }
          />
          <LabelSelectOptions label="최적화 옵션"
            value={formInfoState.optimizeOption}
            options={optimizeOptionList}
            onChange={ handleInputChange("optimizeOption") }
          />
        </div>

        {selectedModalTab === "common" && (
          <>
            <VmCommon
              formInfoState={formInfoState}
              setFormInfoState={setFormInfoState}
            />
            <VmDisk
              editMode={editMode}
              vm={vm}
              vmName={formInfoState.name}
              dataCenterId={dataCenterVo.id}
              diskListState={diskListState}
              setDiskListState={setDiskListState}
            />
            <VmNic
              nics={nics}
              nicsState={nicListState}
              setNicsState={setNicListState}
            />
          </>
        )}
        {selectedModalTab === "system" && (
          <VmSystem
            formSystemState={formSystemState}
            setFormSystemState={setFormSystemState}
          />
        )}
        {selectedModalTab === "beginning" && (
          <VmInit
            formCloudState={formCloudState}
            setFormCloudState={setFormCloudState}
          />
        )}
        {selectedModalTab === "host" && (
          <VmHost
            hosts={hosts}
            formHostState={formHostState}
            setFormHostState={setFormHostState}
          />
        )}
        {selectedModalTab === "ha_mode" && (
          <VmHa
            domains={domains}
            formHaState={formHaState}
            setFormHaState={setFormHaState}
          />
        )}
        {selectedModalTab === "boot_outer" && (
          <VmBoot
            isos={isos}
            isIsoLoading={isIsoLoading}
            formBootState={formBootState}
            setFormBootState={setFormBootState}
          />
        )}
      </div>
      </div>
    </BaseModal>
  );
};

export default VmModal;
