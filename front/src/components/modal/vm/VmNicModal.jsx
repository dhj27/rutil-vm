import { useState, useEffect, useMemo } from "react";
import useUIState              from "@/hooks/useUIState";
import useGlobal               from "@/hooks/useGlobal";
import BaseModal from "../BaseModal";
import LabelInput from "../../label/LabelInput";
import LabelSelectOptions from "../../label/LabelSelectOptions";
import { handleInputChange, handleSelectIdChange } from "../../label/HandleInput";
import {
  useAddNicFromVM,
  useAllVnicsFromCluster,
  useEditNicFromVM,
  useNetworkAttachmentsFromHost,
  useNetworkInterfaceFromVM,
  useVm,
} from "../../../api/RQHook";
import ToggleSwitchButton from "../../button/ToggleSwitchButton";
import Logger from "../../../utils/Logger";
import Localization from "../../../utils/Localization";
import { useToast } from "@/hooks/use-toast";

const initialFormState = {
  id: "",
  name: "",
  linked: true, 
  plugged: true,
  macAddress: "",
  interface_: "VIRTIO",
};

const VmNicModal = ({ 
  isOpen,
  onClose,
  editMode=false,
}) => {
  const { toast } = useToast();

  const nLabel = editMode 
    ? Localization.kr.UPDATE
    : Localization.kr.CREATE;

  const { vmsSelected, nicsSelected } = useGlobal();
  const vmId = useMemo(() => [...vmsSelected][0]?.id, [vmsSelected]);
  const nicId = useMemo(() => [...nicsSelected][0]?.id, [nicsSelected]);
  const hostId = useMemo(() => [...vmsSelected][0]?.hostVo?.id, [vmsSelected]?.hostVo);

  // console.log("$ ", [...vmsSelected][0]?.hostVo, "+ ", hostId)

  const [formInfoState, setFormInfoState] = useState(initialFormState);
  const [vnicProfileVo, setVnicProfileVo] = useState({ id: "", name: "" });

  // 편집 모드이고 vnic프로파일 존재하는 조건
  const [isProfileOriginallySet, setIsProfileOriginallySet] = useState(false);
  const isInterfaceDisabled = editMode && isProfileOriginallySet;

  const { 
    data: networkAttachments = [] 
  } = useNetworkAttachmentsFromHost(hostId, (e) => ({ ...e }));
  const {
    data: vm
  } = useVm(vmId);
  const { data: nicsdetail } = useNetworkInterfaceFromVM(vmId, nicId);
  const { 
    data: vnics=[],
    isLoading: isNicsLoading
  } = useAllVnicsFromCluster(vm?.clusterVo?.id, (e) => ({ ...e }));

  useEffect(()=>{
    console.log("$ a", networkAttachments)
  }, [networkAttachments])

  const { mutate: addNicFromVM } = useAddNicFromVM(onClose, onClose);
  const { mutate: editNicFromVM } = useEditNicFromVM(onClose, onClose);

  const filteredInterfaceOptions = useMemo(() => {
    const selectedVnicProfile = vnics.find((v) => v.id === vnicProfileVo.id);
    if (selectedVnicProfile?.passThrough === "ENABLED") {
      return interfaceOptions.filter((opt) => opt.value === "PCI_PASSTHROUGH");
    }
    return interfaceOptions;
  }, [vnics, vnicProfileVo]);

  const handleRadioChange = (field, value) => {
    Logger.debug(`NicModal > handleRadioChange ... field: ${field}, value: ${value}`);
    setFormInfoState((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isOpen) {
      setFormInfoState(initialFormState);
      setVnicProfileVo({ id: "", name: "" });
    } else if (editMode && nicsdetail) {
      Logger.debug(`NIC 데이터: ${JSON.stringify(nicsdetail, null, 2)}`);
      setFormInfoState({
        id: nicsdetail?.id || "",
        name: nicsdetail?.name || "",
        linked: nicsdetail?.linked ?? true,
        plugged: nicsdetail?.plugged ?? true,
        macAddress: nicsdetail?.macAddress || "",
        interface_: nicsdetail?.interface_ || "VIRTIO",
      });
      setVnicProfileVo({
        id: nicsdetail?.vnicProfileVo?.id,
        name: nicsdetail?.vnicProfileVo?.name,
      });

      // 최초 프로파일 존재 여부 저장
      setIsProfileOriginallySet(!!nicsdetail?.vnicProfileVo?.id);
    }
  }, [isOpen, editMode, nicsdetail]);

  useEffect(() => {
    if (!editMode && vnics && vnics.length > 0) {
      const defaultVnic = vnics.find(n => n.name === "ovirtmgmt");
      const firstN = defaultVnic || vnics[0];
      setVnicProfileVo({ id: firstN.id, name: firstN.name });
    }
  }, [vnics, editMode]);

  useEffect(() => {
    const selectedVnicProfile = vnics.find((v) => v.id === vnicProfileVo.id);
    if (selectedVnicProfile?.passThrough === "ENABLED") {
      setFormInfoState(prev => ({ ...prev, interface_: "PCI_PASSTHROUGH" }));
    } else {
      setFormInfoState(prev => ({ ...prev, interface_: "VIRTIO" }));
    }
  }, [vnicProfileVo, vnics]);

  
  const validateForm = () => {
    if (!formInfoState.name) return `${Localization.kr.NAME}을 입력해주세요.`;
    return null;
  };

  const handleFormSubmit = () => {
    const error = validateForm();
    if (error) {
      toast({
        variant: "destructive",
        title: "문제가 발생하였습니다.",
        description: error,
      });
      return;
    }

    const dataToSubmit = {
      ...formInfoState,
      vnicProfileVo: { id: vnicProfileVo.id },
    };

    Logger.debug(`VmNicModal > handleFormSubmit ... dataToSubmit: `, dataToSubmit); // 데이터 출력

    editMode
      ? editNicFromVM({ vmId, nicId, nicData: dataToSubmit })
      : addNicFromVM({ vmId, nicData: dataToSubmit });
  };

  return (
    <BaseModal targetName={Localization.kr.NICS} submitTitle={nLabel}
      isOpen={isOpen} onClose={onClose}
      onSubmit={handleFormSubmit}
      contentStyle={{ width: "690px" }}
    >
      <LabelInput id="name" label={Localization.kr.NAME}
        value={formInfoState.name}
        onChange={handleInputChange(setFormInfoState, "name")}
      />
      {/* <LabelSelectOptionsID label="프로파일"
        value={vnicProfileVo?.id}
        loading={isNicsLoading}
        options={vnics}
        onChange={handleSelectIdChange(setVnicProfileVo, vnics)}
        // etcLabel={networkVo?.name} // 네트워크명
      /> */}
      <LabelSelectOptions label="프로파일"
        value={vnicProfileVo?.id}
        loading={isNicsLoading}
        onChange={(e) => setVnicProfileVo({id: e.target.value})}
        options={vnics.map(opt => ({
          value: opt.id,
          label: `${opt.name} [네트워크: ${opt.networkVo?.name || ""}]`
        }))}
      />
      <LabelSelectOptions label="유형"
        value={formInfoState.interface_}
        onChange={handleInputChange(setFormInfoState, "interface_")}
        options={filteredInterfaceOptions}
        // disabled={!!vnicProfileVo?.id}
        disabled={isInterfaceDisabled}
      />
      {/* <LabelInput
        id="macAddress"
        label="MAC 주소"
        placeholder="00:1A:4B:16:01:59"
        value={formInfoState.macAddress}
        onChange={handleInputChange(setFormInfoState, "macAddress")}
      /> */}
      <div className="nic-toggle">
        <ToggleSwitchButton id="linked-toggle" label="링크 상태"
          checked={formInfoState.linked}
          onChange={() => handleRadioChange("linked", !formInfoState.linked)}
          tType="Up" fType="Down"
        />
      </div>
      <div className="nic-toggle">
        <ToggleSwitchButton id="plugged-toggle" label="카드 상태"
          checked={formInfoState.plugged}
          onChange={() => handleRadioChange("plugged", !formInfoState.plugged)}
          tType="연결됨" fType={Localization.kr.DETACH}
        />
      </div>
      {/* <div>
            <input
              type="radio"
              name="status"
              id="status_up"
              checked={formInfoState.linked === true} // linked가 true일 때 체크
              onChange={() => handleRadioChange("linked", true)}
            />
            <RVI16 iconDef={rvi16Connected} />
            <label htmlFor="status_up">Up</label>
          </div>
          <div>
            <input
              id="status_down"
              type="radio"
              name="status"
              checked={formInfoState.linked === false} // linked가 false일 때 체크
              onChange={() => handleRadioChange("linked", false)}
            />
            <RVI16 iconDef={rvi16Disconnected} />
            <label htmlFor="status_down">Down</label>
          </div>
        */}


    </BaseModal>
  );
};

export default VmNicModal;

// 유형
const interfaceOptions = [
  { value: "E1000", label: "e1000" },
  { value: "E1000E", label: "e1000e" },
  { value: "PCI_PASSTHROUGH", label: "pci_passthrough" },
  { value: "RTL8139", label: "rtl8139" },
  { value: "RTL8139_VIRTIO", label: "rtl8139_virtio" },
  { value: "SPAPR_VLAN", label: "spapr_vlan" },
  { value: "VIRTIO", label: "virtio" },
];

const pciPassthroughOption = [
  { value: "PCI_PASSTHROUGH", label: "pci_passthrough" }
];

