import OVirtWebAdminHyperlink     from "@/components/common/OVirtWebAdminHyperlink";
import { InfoTable }              from "@/components/table/InfoTable";
import { 
  useAllBiosTypes,
  useCluster
} from "@/api/RQHook";
import Localization               from "@/utils/Localization";

/**
 * @name ClusterGeneral
 * @description 클러스터 일반정보
 * (/computing/clusters/<clusterId>)
 *
 * @param {string} clusterId 클러스터ID
 * @returns
 */
const ClusterGeneral = ({
  clusterId
}) => {
  const {
    data: cluster,
    isLoading: isClusterLoading,
    isError: isClusterError,
    isSuccess: isClusterSuccess,
  } = useCluster(clusterId);

  const {
    data: biosTypes = [],
    isLoading: isBiosTypesLoading,
  } = useAllBiosTypes();

  const renderBiosType = (biosType="") => [...biosTypes].filter((b) => {
    return b.id.toLowerCase() === biosType.toLowerCase()
  })[0]?.kr;

  const tableRows = [
    { label: Localization.kr.NAME, value: cluster?.name },
    { label: Localization.kr.DESCRIPTION, value: cluster?.description },
    { label: Localization.kr.DATA_CENTER, value: cluster?.dataCenterVo?.name },
    { label: "호환버전", value: cluster?.version },
    // { label: `${Localization.kr.CLUSTER} ID`, value: cluster?.id },
    { label: `${Localization.kr.CLUSTER} CPU 유형`, value: cluster?.cpuType },
    { label: "최대 메모리 오버 커밋", value: `${cluster?.memoryOverCommit}%` },
    { label: "칩셋/펌웨어 유형", value: renderBiosType(cluster?.biosType) },
    // { label: "총 볼륨 수", value: Localization.kr.NOT_ASSOCIATED },
    // { label: "Up 상태의 볼륨 수", value: Localization.kr.NOT_ASSOCIATED },
    // { label: "Down 상태의 볼륨 수", value: Localization.kr.NOT_ASSOCIATED },
    { label: `${Localization.kr.VM} 수`, value: cluster?.vmSize?.allCnt },
  ];

  return (
    <>
      <InfoTable tableRows={tableRows} />
      <OVirtWebAdminHyperlink
        name={`${Localization.kr.COMPUTING}>${Localization.kr.CLUSTER}>${cluster?.name}`}
        path={`clusters-general;name=${cluster?.name}`} />
    </>
  );
};

export default ClusterGeneral;
